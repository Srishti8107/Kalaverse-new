import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  initHandLandmarker,
  startWebcam,
  stopWebcam,
  detectHands,
  drawOverlay,
  describeCameraError,
} from './mediaPipeService';
import { CraftRuleEngine, STEPS, REASON, COLUMN_ZONES } from './craftLogic';
import { buildFeedbackPayload, getCoachFeedback, hasGeminiConfig, COACH_MODEL } from '../services/geminiService';
import { getTutorialById, getPracticePath } from './index';

/*
 * Palette — Kalaverse "tradition meets modern" theme tokens (see index.css @theme)
 *   indigo-night  camera stage, step tracker
 *   sand-50/100   panels / page ground, ink for text
 *   sage    #7FA07A  correct
 *   clay    #C8664A  incorrect
 *   gold    #C9A24A  uncertain
 */

const REFERENCE_IMAGE = '/tutorials/paper-weaving-steps.jpeg'; // 2 × 3 collage of the expert's steps
const COACH_DEBOUNCE_MS = 700; // verdict must be stable this long before asking the coach
const COACH_MIN_INTERVAL_MS = 3500; // don't send more often than this
const PRIORITY_REASONS = new Set([REASON.STEP_COMPLETE, REASON.WEAVE_COMPLETE, REASON.ZONES_INCOMPLETE]);

const RESULT_UI = {
  correct: { label: 'On track', dot: 'bg-[#7FA07A]', text: 'text-[#C3D6BE]', ring: 'ring-[#7FA07A]/50' },
  incorrect: { label: 'Needs a fix', dot: 'bg-[#C8664A]', text: 'text-[#EDBBA8]', ring: 'ring-[#C8664A]/50' },
  uncertain: { label: 'Can’t see clearly', dot: 'bg-[#C9A24A]', text: 'text-[#E8D5A0]', ring: 'ring-[#C9A24A]/50' },
};

const TONE_UI = {
  celebrate: 'border-[#7FA07A] bg-[#7FA07A]/10',
  encourage: 'border-indigo-deep/40 bg-sand-50',
  correct: 'border-[#C8664A] bg-[#C8664A]/[0.07]',
  camera: 'border-[#C9A24A] bg-[#C9A24A]/10',
};

const SOURCE_LABEL = {
  gemini: `Gemini · ${COACH_MODEL}`,
  offline: 'Built-in coach (add GEMINI_API_KEY for live feedback)',
  fallback: 'Built-in coach (Gemini didn’t respond)',
  local: 'Kala',
};

const INITIAL_COACH = {
  message: 'Start the camera and I’ll guide you one strip at a time.',
  tone: 'encourage',
  tip: 'Keep the sheet flat, well lit, and fully inside the camera view.',
  source: 'local',
};

const frameSignature = (r) =>
  [
    r.stepIndex,
    r.result,
    r.reason,
    Math.round(r.progress * 25),
    r.meta.alternations,
    r.meta.expectedPosition,
    r.completedColumns.length,
    r.finished,
  ].join('|');

/** Route: /practice/:tutorialId — resolves the tutorial, then mounts a fresh session for it. */
export default function ARPracticePage() {
  const { tutorialId } = useParams();
  const tutorial = getTutorialById(tutorialId);

  if (!getPracticePath(tutorial)) return <PracticeUnavailable tutorial={tutorial} />;
  return <PracticeSession key={tutorial.id} tutorial={tutorial} />;
}

function PracticeSession({ tutorial }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const landmarkerRef = useRef(null);
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastSigRef = useRef('');
  const lastCoachAtRef = useRef(-Infinity);
  const statsRef = useRef({ frames: 0, since: 0 });
  const engineRef = useRef(null);
  if (!engineRef.current) engineRef.current = new CraftRuleEngine();

  const [phase, setPhase] = useState('idle'); // idle | loading | running | error
  const [error, setError] = useState('');
  const [frame, setFrame] = useState(() => engineRef.current.snapshot());
  const [coach, setCoach] = useState(INITIAL_COACH);
  const [coachBusy, setCoachBusy] = useState(false);
  const [aspect, setAspect] = useState(16 / 9);
  const [showDebug, setShowDebug] = useState(false);
  const [debug, setDebug] = useState({ fps: 0, hands: 0, pinchRatio: null });
  const [voiceOn, setVoiceOn] = useState(false);

  const step = STEPS[frame.stepIndex];
  const resultUi = RESULT_UI[frame.result];

  /* ---------------------------- frame loop ---------------------------- */

  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    const engine = engineRef.current;
    if (!video || !canvas || !landmarker) return;

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const now = performance.now();

      let hands = [];
      try {
        hands = detectHands(landmarker, video, now);
      } catch (err) {
        console.warn('[Kalaverse] detection error', err);
      }

      const result = engine.evaluate(hands, now);

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      drawOverlay(canvas.getContext('2d'), hands, engine.getOverlayModel());

      // Only re-render React when something visible changed.
      const sig = frameSignature(result);
      if (sig !== lastSigRef.current) {
        lastSigRef.current = sig;
        setFrame(result);
      }

      const stats = statsRef.current;
      stats.frames += 1;
      if (now - stats.since > 500) {
        setDebug({
          fps: Math.round((stats.frames * 1000) / (now - stats.since)),
          hands: hands.length,
          pinchRatio: result.meta.pinchRatio,
        });
        stats.frames = 0;
        stats.since = now;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    stopWebcam(streamRef.current, videoRef.current);
    streamRef.current = null;
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setPhase((p) => (p === 'error' ? p : 'idle'));
  }, []);

  const startCamera = useCallback(async () => {
    setPhase('loading');
    setError('');
    try {
      const [landmarker, stream] = await Promise.all([initHandLandmarker(), startWebcam(videoRef.current)]);
      landmarkerRef.current = landmarker;
      streamRef.current = stream;
      const v = videoRef.current;
      const ratio = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : 16 / 9;
      setAspect(ratio);
      engineRef.current.setAspectRatio(ratio);
      lastVideoTimeRef.current = -1;
      statsRef.current = { frames: 0, since: performance.now() };
      setPhase('running');
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      stopWebcam(streamRef.current, videoRef.current);
      streamRef.current = null;
      setError(describeCameraError(err));
      setPhase('error');
    }
  }, [loop]);

  useEffect(
    () => () => {
      cancelAnimationFrame(rafRef.current);
      stopWebcam(streamRef.current, videoRef.current);
      window.speechSynthesis?.cancel();
    },
    [],
  );

  /* ---------------------------- AI coach ------------------------------ */

  const coachKey = `${frame.stepIndex}|${frame.result}|${frame.reason}`;

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const priority = PRIORITY_REASONS.has(frame.reason);
    const sinceLast = performance.now() - lastCoachAtRef.current;
    const delay = priority ? 150 : Math.max(COACH_DEBOUNCE_MS, COACH_MIN_INTERVAL_MS - sinceLast);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      lastCoachAtRef.current = performance.now();
      setCoachBusy(true);
      try {
        const payload = buildFeedbackPayload(STEPS[frame.stepIndex], frame);
        const feedback = await getCoachFeedback(payload, { signal: controller.signal });
        if (!controller.signal.aborted) setCoach(feedback);
      } catch (err) {
        if (err?.name !== 'AbortError') console.warn(err);
      } finally {
        if (!controller.signal.aborted) setCoachBusy(false);
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
      setCoachBusy(false);
    };
    // frame is read at fire time on purpose; re-run only when the verdict changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachKey, phase]);

  useEffect(() => {
    if (!voiceOn || coach.source === 'local' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(coach.message);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [coach, voiceOn]);

  /* ---------------------------- controls ------------------------------ */

  const goToStep = (index) => {
    engineRef.current.goToStep(index);
    lastSigRef.current = '';
    setFrame(engineRef.current.snapshot());
  };

  const restart = () => {
    engineRef.current.reset();
    lastSigRef.current = '';
    setFrame(engineRef.current.snapshot());
    setCoach(INITIAL_COACH);
  };

  const isWeaveStep = step.key === 'ALTERNATE_WEAVE' || step.key === 'WEAVE_COMPLETE';

  return (
    <div className="min-h-screen bg-sand-100 font-sans text-ink">
      <header className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-3 px-4 pb-8 pt-8 sm:px-6">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 rounded text-sm font-semibold text-ink/70 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            ← Back
          </button>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">Kalaverse practice</p>
          <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {tutorial.title}
          </h1>
        </div>
        <p className="flex items-center gap-2 text-sm text-ink/70">
          <span className={`h-2 w-2 rounded-full ${hasGeminiConfig() ? 'bg-[#7FA07A]' : 'bg-[#C9A24A]'}`} />
          {hasGeminiConfig() ? 'AI coach connected' : 'AI coach offline'}
        </p>
      </header>

      <main className="mx-auto grid max-w-[1120px] gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* ------------------------- Camera stage ------------------------- */}
        <section aria-label="Camera practice area" className="min-w-0">
          <div
            className={`relative w-full overflow-hidden rounded-[24px] bg-indigo-night ring-4 transition-[box-shadow] ${
              phase === 'running' ? resultUi.ring : 'ring-transparent'
            }`}
            style={{ aspectRatio: aspect }}
          >
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full -scale-x-100 object-fill"
              playsInline
              muted
              aria-hidden="true"
            />
            <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

            {phase === 'running' && (
              <>
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-indigo-night/85 px-3 py-1.5 text-sm text-white backdrop-blur"
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${resultUi.dot}`} />
                  <span className={resultUi.text}>{resultUi.label}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
                  <div
                    className="h-full bg-[#7FA07A] transition-[width] duration-200"
                    style={{ width: `${Math.round(frame.progress * 100)}%` }}
                  />
                </div>
              </>
            )}

            {phase !== 'running' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-sand-50">
                {phase === 'loading' ? (
                  <>
                    <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-[#7FA07A] motion-reduce:animate-none" />
                    <p>Opening camera and loading hand tracking…</p>
                  </>
                ) : (
                  <>
                    <p className="max-w-md font-serif text-3xl font-normal">
                      {phase === 'error' ? 'Camera didn’t start' : 'Place your sheet in view, then start'}
                    </p>
                    <p className="max-w-md text-sand-50/75">
                      {phase === 'error'
                        ? error
                        : 'Point the camera down at your work surface. Video stays on your device; only short step results go to the coach.'}
                    </p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="rounded-full bg-[#7FA07A] px-6 py-3 font-semibold text-ink hover:bg-[#93B38E] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {phase === 'error' ? 'Try again' : 'Start camera'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {phase === 'running' && (
              <ControlButton onClick={stopCamera}>Stop camera</ControlButton>
            )}
            <ControlButton onClick={restart}>Restart weaving</ControlButton>
            <ControlButton onClick={() => setVoiceOn((v) => !v)} pressed={voiceOn}>
              Read coach aloud
            </ControlButton>
            <ControlButton onClick={() => setShowDebug((v) => !v)} pressed={showDebug}>
              Tracking details
            </ControlButton>
          </div>

          {showDebug && (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-2xl bg-indigo-night p-4 text-sm text-sand-50 sm:grid-cols-4">
              <DebugItem label="Frame rate" value={`${debug.fps} fps`} />
              <DebugItem label="Hands seen" value={debug.hands} />
              <DebugItem
                label="Pinch ratio"
                value={debug.pinchRatio == null ? '–' : debug.pinchRatio.toFixed(2)}
              />
              <DebugItem label="Verdict" value={`${frame.result} / ${frame.reason}`} />
            </dl>
          )}
        </section>

        {/* -------------------------- Side panel -------------------------- */}
        <aside className="flex flex-col gap-5" aria-label="Lesson">
          <WovenStepTracker
            stepIndex={frame.stepIndex}
            progress={frame.progress}
            finished={frame.finished}
            onSelect={goToStep}
          />

          <article className="rounded-[22px] border border-sand-300 bg-sand-50 p-6 shadow-[var(--shadow-soft)]">
            <div className="flex gap-4">
              <div
                role="img"
                aria-label={`Expert reference photo for step ${step.id}`}
                className="aspect-[360/426] w-24 shrink-0 rounded-xl bg-no-repeat ring-1 ring-ink/15"
                style={{
                  backgroundImage: `url(${REFERENCE_IMAGE})`,
                  backgroundSize: '200% 300%',
                  backgroundPosition: `${(frame.stepIndex % 2) * 100}% ${Math.floor(frame.stepIndex / 2) * 50}%`,
                }}
              />
              <div className="min-w-0">
                <p className="text-sm text-ink/60">
                  Step {step.id} of {STEPS.length}
                </p>
                <h2 className="font-serif text-2xl font-normal leading-tight">
                  {frame.finished ? 'Weave complete' : step.title}
                </h2>
              </div>
            </div>
            <p className="mt-4 leading-relaxed text-ink/85">
              {frame.finished
                ? 'Every column is filled and the checkerboard is done. Restart to practise again.'
                : step.instruction}
            </p>

            {isWeaveStep && !frame.finished && (
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span>
                  Next side:{' '}
                  <strong className="font-semibold">
                    {frame.meta.expectedPosition === 'A' ? 'A (left half)' : 'B (right half)'}
                  </strong>
                </span>
                <span className="flex items-center gap-1.5" aria-label={`${frame.meta.alternations} of ${frame.meta.requiredAlternations} switches`}>
                  Switches
                  {Array.from({ length: frame.meta.requiredAlternations }, (_, i) => (
                    <span
                      key={i}
                      className={`h-3 w-3 rounded-[3px] ${
                        i < frame.meta.alternations ? 'bg-[#7FA07A]' : 'bg-ink/15'
                      }`}
                    />
                  ))}
                </span>
              </div>
            )}

            <ColumnMap completed={frame.completedColumns} target={frame.finished ? null : step.targetColumn} />
          </article>

          <CoachBox coach={coach} busy={coachBusy} />
        </aside>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function PracticeUnavailable({ tutorial }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-sand-100 px-4 font-sans text-ink">
      <div className="max-w-md rounded-[24px] border border-sand-300 bg-sand-50 p-10 shadow-[var(--shadow-soft)] text-center">
        <h1 className="font-serif text-3xl font-normal">
          {tutorial ? 'AR practice isn’t ready yet' : 'Tutorial not found'}
        </h1>
        <p className="mt-3 text-ink/75">
          {tutorial
            ? `“${tutorial.title}” doesn’t have live hand-tracking practice yet.`
            : 'This practice link doesn’t match any tutorial.'}
        </p>
        <Link
          to="/feed"
          className="mt-6 inline-block rounded-full bg-indigo-deep px-6 py-3 font-semibold text-sand-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24A]"
        >
          Back to feed
        </Link>
      </div>
    </div>
  );
}

/** Six steps drawn as a woven strip: alternate tiles sit over/under the line. */
function WovenStepTracker({ stepIndex, progress, finished, onSelect }) {
  return (
    <nav aria-label="Lesson steps" className="rounded-[22px] bg-indigo-night px-6 pb-6 pt-5 text-sand-50">
      <p className="mb-3 text-sm text-sand-50/70">
        {finished ? 'All six steps woven' : `Step ${stepIndex + 1}: in progress`}
      </p>
      <ol className="relative flex items-center justify-between">
        <span aria-hidden="true" className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-sand-50/15" />
        {STEPS.map((s, i) => {
          const done = finished || i < stepIndex;
          const current = !finished && i === stepIndex;
          const over = i % 2 === 0;
          return (
            <li key={s.id} className="relative">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={current ? 'step' : undefined}
                aria-label={`Step ${s.id}: ${s.title}${done ? ' (done)' : ''}`}
                className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-md text-sm font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24A] ${
                  over ? '-translate-y-1.5' : 'translate-y-1.5'
                } ${
                  done
                    ? 'bg-[#7FA07A] text-ink'
                    : current
                      ? 'bg-sand-50 text-ink ring-2 ring-[#7FA07A]'
                      : 'bg-sand-50/20 text-sand-50/80'
                }`}
              >
                {current && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 bg-[#7FA07A]/45 transition-[height] duration-200"
                    style={{ height: `${Math.round(progress * 100)}%` }}
                  />
                )}
                <span className="relative">{s.id}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Mini map of the five columns, right (C1) to left (C5), as on the sheet. */
function ColumnMap({ completed, target }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm text-ink/60">Columns on your sheet</p>
      <div className="flex flex-row-reverse justify-center gap-1.5 rounded-2xl bg-sand-100 p-3 ring-1 ring-sand-300">
        {COLUMN_ZONES.map((z) => {
          const done = completed.includes(z.index);
          const isTarget = z.index === target;
          return (
            <div
              key={z.id}
              className={`flex h-16 w-9 items-end justify-center rounded-sm pb-1 text-xs font-semibold ${
                done
                  ? 'bg-[#7FA07A] text-ink'
                  : isTarget
                    ? 'bg-[#7FA07A]/15 text-ink outline-dashed outline-2 outline-[#7FA07A]'
                    : 'bg-ink/[0.06] text-ink/50'
              }`}
            >
              {z.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoachBox({ coach, busy }) {
  return (
    <section
      aria-label="AI coach"
      aria-live="polite"
      className={`rounded-[22px] border border-sand-300 border-l-[6px] p-6 shadow-[var(--shadow-soft)] transition-colors ${TONE_UI[coach.tone] ?? TONE_UI.encourage}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-normal">Kala, your coach</h2>
        {busy && (
          <span className="flex items-center gap-1" aria-label="Coach is thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/50 motion-reduce:animate-none"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </div>
      <p className="text-lg leading-snug">{coach.message}</p>
      {coach.tip && <p className="mt-3 text-sm text-ink/70">Tip: {coach.tip}</p>}
      <p className="mt-4 text-xs text-ink/50">{SOURCE_LABEL[coach.source] ?? SOURCE_LABEL.local}</p>
    </section>
  );
}

function ControlButton({ onClick, pressed, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#C9A24A] ${
        pressed
          ? 'bg-indigo-deep text-sand-50 ring-indigo-deep'
          : 'bg-sand-50 text-ink ring-sand-300 hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
}

function DebugItem({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-sand-50/55">{label}</dt>
      <dd className="truncate font-semibold">{value}</dd>
    </div>
  );
}

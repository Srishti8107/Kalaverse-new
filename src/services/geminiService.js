/**
 * Kalaverse AI Coach — Gemini feedback service.
 *
 * Sends { instruction, result, reason, context } to Gemini and gets back a short,
 * beginner-friendly coaching message as structured JSON.
 *
 * Env (see vite.config.js → envPrefix includes 'GEMINI_'):
 *   GEMINI_API_KEY         required for live feedback (falls back to built-in messages otherwise)
 *   GEMINI_MODEL           optional, defaults to gemini-2.5-flash
 *   VITE_GEMINI_PROXY_URL  optional, POST the payload to your own backend instead (recommended in production)
 */

const API_KEY = import.meta.env.GEMINI_API_KEY;
const MODEL = import.meta.env.GEMINI_MODEL || 'gemini-2.5-flash';
const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL;
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 8000;
const CACHE_LIMIT = 60;

export const COACH_MODEL = MODEL;
export const hasGeminiConfig = () => Boolean(API_KEY || PROXY_URL);

const SYSTEM_PROMPT = `You are Kala, the friendly craft coach inside Kalaverse, an AR app that teaches beginners paper strip weaving.
A camera checks the learner's hand. You receive JSON with:
- instruction: what the expert asked the learner to do right now
- result: "correct", "incorrect" or "uncertain"
- reason: a machine code for what the camera saw
- context: step number, progress, and a plain-language meaning of the reason

Write ONE coaching message:
- 1–2 short sentences, at most 28 words, simple English a 12-year-old understands.
- Speak to the learner ("you"). Give one physical action they can do with their hands right now.
- correct: brief, specific praise, then what to do next. Celebrate warmly on step_complete and weave_complete.
- incorrect: never blame. Name the single most useful fix.
- uncertain: this is about the camera not seeing the hand clearly (lighting, framing, distance), not the learner's skill.
- Columns are C1 (right edge) to C5 (left). Side A is the left half of a column, side B the right half.
- Never mention codes, landmarks, tracking models, JSON or AI.
Also return tone ("celebrate", "encourage", "correct" or "camera") and an optional tip (max 14 words) with a practical craft hint, or an empty string.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    message: { type: 'STRING' },
    tone: { type: 'STRING', enum: ['celebrate', 'encourage', 'correct', 'camera'] },
    tip: { type: 'STRING' },
  },
  required: ['message', 'tone'],
};

/** Plain-language meaning of every reason code, sent to Gemini as context. */
const REASON_MEANING = {
  hand_in_zone: 'The hand is inside the craft area; the learner just needs to hold it there a moment.',
  pinch_detected: 'The learner is holding a strip between thumb and index finger and moving it.',
  target_reached: 'The pinched strip has reached the correct column.',
  weaving_in_progress: 'The learner is weaving the strip down the correct column.',
  alternation_registered: 'The learner correctly switched sides (over/under) in the column.',
  ready_to_release: 'The last strip is fully woven; the learner should open their fingers to let go.',
  step_complete: 'The learner finished this step successfully.',
  weave_complete: 'The whole weaving is finished and every column is filled.',
  hand_out_of_zone: 'The hand is outside the dotted craft area.',
  pinch_not_detected: 'Thumb and index finger are apart, so the strip is not being held.',
  wrong_column: 'The strip is in a different column than the one highlighted.',
  wrong_start_position: 'The strip started on the wrong side of the column; it must start opposite to its neighbour.',
  weaving_upward: 'The learner moved back up the column instead of working downward.',
  pinch_released_early: 'The learner let go of the strip before the column was finished.',
  strip_left_column: 'The strip moved outside the highlighted column while weaving.',
  zones_incomplete: 'Some columns were never woven, so the pattern is not complete yet.',
  hand_not_detected: 'The camera cannot see any hand.',
  hand_partially_visible: 'Part of the hand is outside the camera frame.',
  low_confidence: 'The camera can see something but is not sure it is a hand (lighting or blur).',
  tracking_unstable: 'The hand position jumped suddenly, probably blur or fast movement.',
  awaiting_action: 'The step just started; the learner is getting ready.',
};

const FALLBACK = {
  hand_in_zone: 'Nice! Keep your hand steady over the sheet for a moment.',
  pinch_detected: 'Good grip! Now carry the strip to the glowing column.',
  target_reached: 'Right column! Keep holding the strip there.',
  weaving_in_progress: 'Looking good. Keep weaving down the column, switching sides as you go.',
  alternation_registered: 'Nice switch! Now go to the other side as you move down.',
  ready_to_release: 'Beautiful, the last strip is in. Open your fingers to let it go.',
  step_complete: 'Step done, well woven! Get ready for the next one.',
  weave_complete: 'You did it! Your checkerboard weave is complete. Take a proud look at it.',
  hand_out_of_zone: 'Move your hand back inside the dotted craft area.',
  pinch_not_detected: 'Hold the strip between your thumb and index finger, pressing them close together.',
  wrong_column: 'That’s a neighbouring column. Slide the strip to the glowing one.',
  wrong_start_position: 'Start on the other side of this column, opposite to the strip next to it.',
  weaving_upward: 'Keep working downward. Move to the next slit below.',
  pinch_released_early: 'Oops, the strip slipped. Pinch it again and carry on down the column.',
  strip_left_column: 'Bring the strip back inside the glowing column.',
  zones_incomplete: 'Almost there! A few columns still need a strip. Fill the empty ones.',
  hand_not_detected: 'I can’t see your hand. Hold it over the sheet, in view of the camera.',
  hand_partially_visible: 'Part of your hand is off-screen. Move it a little toward the centre.',
  low_confidence: 'I can’t see your hand clearly. Try brighter light or move a bit closer.',
  tracking_unstable: 'Slow down a little so I can follow your hand.',
  awaiting_action: 'Take your time. Get your materials ready and start when you’re set.',
};

const TONE_BY_RESULT = { correct: 'encourage', incorrect: 'correct', uncertain: 'camera' };
const cache = new Map();

/** Build the structured payload sent to Gemini. */
export function buildFeedbackPayload(step, frame) {
  return {
    instruction: step.instruction,
    result: frame.result,
    reason: frame.reason,
    context: {
      stepNumber: step.id,
      totalSteps: 6,
      stepTitle: step.title,
      progressPercent: Math.round((frame.progress ?? 0) * 100),
      targetColumn: frame.meta?.targetColumn ?? null,
      expectedPosition: frame.meta?.expectedPosition ?? null,
      alternationsDone: frame.meta?.alternations ?? 0,
      alternationsRequired: frame.meta?.requiredAlternations ?? null,
      missingColumns: frame.meta?.missingColumns ?? [],
      wrongColumn: frame.meta?.wrongColumn ?? null,
      reasonMeaning: REASON_MEANING[frame.reason] ?? 'Unknown situation.',
    },
  };
}

/**
 * Get a coaching message. Never throws except on AbortError — on any other
 * failure it returns a built-in message so the UI always has guidance.
 * @returns {Promise<{message:string, tone:string, tip:string, source:'gemini'|'offline'|'fallback'}>}
 */
export async function getCoachFeedback(payload, { signal } = {}) {
  const key = [
    payload.context.stepNumber,
    payload.result,
    payload.reason,
    payload.context.expectedPosition,
    payload.context.missingColumns.join(','),
  ].join('|');
  if (cache.has(key)) return cache.get(key);

  if (!hasGeminiConfig()) return fallback(payload, 'offline');

  try {
    const text = PROXY_URL ? await callProxy(payload, signal) : await callGemini(payload, signal);
    const feedback = { ...parseCoachResponse(text, payload), source: 'gemini' };
    cache.set(key, feedback);
    if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
    return feedback;
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) throw err;
    console.warn('[Kalaverse] Gemini feedback failed, using built-in message.', err);
    return fallback(payload, 'fallback');
  }
}

async function callGemini(payload, signal) {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
      responseSchema: RESPONSE_SCHEMA,
      // Short coaching lines don't need reasoning; keeps latency low on 2.5 Flash models.
      ...(/2\.5-flash/.test(MODEL) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  };
  const res = await fetchWithTimeout(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini HTTP ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
  if (!text) {
    throw new Error(`Empty Gemini response (${data?.promptFeedback?.blockReason ?? data?.candidates?.[0]?.finishReason ?? 'no candidates'})`);
  }
  return text;
}

/** Your backend receives the same payload and should return Gemini's JSON text or {message, tone, tip}. */
async function callProxy(payload, signal) {
  const res = await fetchWithTimeout(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
  return res.text();
}

async function fetchWithTimeout(url, { signal, ...init }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onAbort);
  }
}

export function parseCoachResponse(text, payload) {
  const clean = String(text).replace(/```(?:json)?/gi, '').trim();
  const parsed = JSON.parse(clean);
  const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
  if (!message) throw new Error('Gemini response missing "message"');
  const tones = ['celebrate', 'encourage', 'correct', 'camera'];
  return {
    message: message.slice(0, 240),
    tone: tones.includes(parsed.tone) ? parsed.tone : TONE_BY_RESULT[payload.result] ?? 'encourage',
    tip: typeof parsed.tip === 'string' ? parsed.tip.trim().slice(0, 120) : '',
  };
}

function fallback(payload, source) {
  const celebrate = payload.reason === 'step_complete' || payload.reason === 'weave_complete';
  return {
    message: FALLBACK[payload.reason] ?? 'Keep going, you’re doing well.',
    tone: celebrate ? 'celebrate' : TONE_BY_RESULT[payload.result] ?? 'encourage',
    tip: '',
    source,
  };
}

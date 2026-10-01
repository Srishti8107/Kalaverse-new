/**
 * MediaPipe hand tracking for Kalaverse AR Practice.
 * - Loads the 21-point Hand Landmarker (GPU with CPU fallback), once per app.
 * - Starts/stops the browser webcam.
 * - Returns landmarks MIRRORED into display space so the rule engine and the
 *   canvas overlay work in the same coordinates as the selfie-style video.
 * - Draws zones, hand skeleton and pinch point on the overlay canvas.
 */
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

// Keep this in sync with the exact version pinned in package.json (JS and WASM must match).
export const MEDIAPIPE_VERSION = '1.0.1';
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // index
  [5, 9], [9, 10], [10, 11], [11, 12], // middle
  [9, 13], [13, 14], [14, 15], [15, 16], // ring
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17], // pinky + palm
];

let landmarkerPromise = null;

/** Create (or reuse) the HandLandmarker in VIDEO mode. */
export function initHandLandmarker({ numHands = 2 } = {}) {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      const options = {
        runningMode: 'VIDEO',
        numHands,
        minHandDetectionConfidence: 0.6,
        minHandPresenceConfidence: 0.6,
        minTrackingConfidence: 0.5,
      };
      try {
        return await HandLandmarker.createFromOptions(vision, {
          ...options,
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        });
      } catch (gpuError) {
        console.warn('[Kalaverse] GPU delegate unavailable, falling back to CPU.', gpuError);
        return HandLandmarker.createFromOptions(vision, {
          ...options,
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        });
      }
    })().catch((err) => {
      landmarkerPromise = null; // allow retry
      throw err;
    });
  }
  return landmarkerPromise;
}

export async function startWebcam(video, { width = 1280, height = 720 } = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error('Camera API not available');
    err.name = 'NotSupportedError';
    throw err;
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: width }, height: { ideal: height }, facingMode: 'user' },
    audio: false,
  });
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  if (video.readyState < 1) {
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
    });
  }
  await video.play();
  return stream;
}

export function stopWebcam(stream, video) {
  stream?.getTracks().forEach((t) => t.stop());
  if (video) video.srcObject = null;
}

/**
 * Run detection on the current video frame.
 * @returns {Array<{points:{x:number,y:number,z:number}[], score:number, label:string}>}
 */
export function detectHands(landmarker, video, timestampMs, { mirror = true } = {}) {
  const result = landmarker.detectForVideo(video, timestampMs);
  const handedness = result.handedness ?? result.handednesses ?? [];
  return (result.landmarks ?? []).map((landmarks, i) => {
    const category = handedness[i]?.[0];
    return {
      points: landmarks.map((p) => ({ x: mirror ? 1 - p.x : p.x, y: p.y, z: p.z })),
      score: category?.score ?? 0,
      label: category?.categoryName ?? 'Unknown',
    };
  });
}

export function describeCameraError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
      return 'Camera access is blocked. Allow camera access in your browser’s site settings, then start again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No usable camera was found. Connect a webcam and start again.';
    case 'NotReadableError':
      return 'Another app is using the camera. Close it, then start again.';
    case 'SecurityError':
    case 'NotSupportedError':
      return 'This browser can’t open the camera here. Use Chrome or Edge on https:// or localhost.';
    default:
      return `Hand tracking couldn’t start: ${err?.message ?? 'unknown error'}. Check your connection and start again.`;
  }
}

/* ------------------------------------------------------------------ */
/* Overlay drawing                                                     */
/* ------------------------------------------------------------------ */

const COLORS = {
  correct: '#7FA07A',
  incorrect: '#C8664A',
  uncertain: '#C9A24A',
  paper: 'rgba(251, 248, 243, 0.6)',
  faint: 'rgba(251, 248, 243, 0.18)',
  done: 'rgba(127, 160, 122, 0.32)',
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} hands  output of detectHands (display space)
 * @param {object} model output of CraftRuleEngine.getOverlayModel()
 */
export function drawOverlay(ctx, hands, model) {
  const { width: W, height: H } = ctx.canvas;
  ctx.clearRect(0, 0, W, H);
  if (!model) return;

  const accent = COLORS[model.result] ?? '#FBF8F3'; // must stay 6-digit hex (alpha suffixes appended below)
  const px = (z) => ({ x: z.x * W, y: z.y * H, w: z.w * W, h: z.h * H });
  const font = Math.max(12, Math.round(W / 64));
  ctx.font = `600 ${font}px "DM Sans", system-ui, sans-serif`;
  ctx.textBaseline = 'top';

  // Craft area
  const c = px(model.craftArea);
  ctx.save();
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = model.highlightCraftArea ? 3 : 2;
  ctx.strokeStyle = model.highlightCraftArea ? accent : COLORS.paper;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
  ctx.restore();
  ctx.fillStyle = COLORS.paper;
  ctx.fillText('Craft area', c.x + 8, c.y + 8);

  // Weaving columns
  for (const col of model.columns) {
    const r = px(col);
    ctx.save();
    if (col.state === 'done') {
      ctx.fillStyle = COLORS.done;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = COLORS.correct;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    } else if (col.state === 'target') {
      if (model.showSides && model.expectedPosition) {
        const half = r.w / 2;
        ctx.fillStyle = `${accent}33`;
        ctx.fillRect(model.expectedPosition === 'A' ? r.x : r.x + half, r.y, half, r.h);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = COLORS.paper;
        ctx.beginPath();
        ctx.moveTo(r.x + half, r.y);
        ctx.lineTo(r.x + half, r.y + r.h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = COLORS.paper;
        ctx.fillText('A', r.x + 6, r.y + r.h - font - 6);
        ctx.fillText('B', r.x + r.w - font, r.y + r.h - font - 6);
      } else {
        ctx.fillStyle = `${accent}22`;
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.lineWidth = 3;
      ctx.strokeStyle = accent;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = COLORS.faint;
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    }
    ctx.restore();
    ctx.fillStyle = col.state === 'idle' ? COLORS.faint : COLORS.paper;
    ctx.fillText(col.label, r.x + 6, r.y + 6);
  }

  // Hands
  hands.forEach((hand, i) => {
    const primary = i === model.primaryHandIndex;
    const pts = hand.points.map((p) => ({ x: p.x * W, y: p.y * H }));
    ctx.save();
    ctx.lineWidth = primary ? 3 : 2;
    ctx.strokeStyle = primary ? accent : COLORS.faint;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.moveTo(pts[a].x, pts[a].y);
      ctx.lineTo(pts[b].x, pts[b].y);
    }
    ctx.stroke();
    ctx.fillStyle = primary ? '#FBF8F3' : COLORS.faint;
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, primary ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  // Pinch point
  if (model.pinchPoint && model.primaryHandIndex >= 0) {
    const x = model.pinchPoint.x * W;
    const y = model.pinchPoint.y * H;
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = accent;
    ctx.fillStyle = model.isPinching ? accent : 'transparent';
    ctx.beginPath();
    ctx.arc(x, y, model.isPinching ? 9 : 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

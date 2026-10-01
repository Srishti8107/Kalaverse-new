/**
 * Kalaverse Craft Rule Engine — Paper Strip Weaving (6 steps)
 *
 * Evaluates MediaPipe hand landmarks every frame and returns one of three
 * verification states: `correct`, `incorrect`, `uncertain`, plus a reason code.
 *
 * Coordinate space: all points/zones are normalised [0..1] in DISPLAY space,
 * i.e. landmarks are already mirrored to match the selfie-style video
 * (see mediaPipeService.detectHands). "Right" means right on the user's screen.
 *
 * Weaving model (matches the expert reference photos):
 *   The slit base sheet is divided into 5 vertical columns, C1 (right edge)
 *   to C5 (left). Each green strip is woven into one column, alternating
 *   between Position A (left half of the column / over) and Position B
 *   (right half / under) as the hand works down the sheet. Neighbouring
 *   columns start on opposite positions, which creates the checkerboard.
 */

/* ------------------------------------------------------------------ */
/* Public constants                                                    */
/* ------------------------------------------------------------------ */

export const RESULT = Object.freeze({
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  UNCERTAIN: 'uncertain',
});

export const REASON = Object.freeze({
  // correct
  HAND_IN_ZONE: 'hand_in_zone',
  PINCH_DETECTED: 'pinch_detected',
  TARGET_REACHED: 'target_reached',
  WEAVING_IN_PROGRESS: 'weaving_in_progress',
  ALTERNATION_REGISTERED: 'alternation_registered',
  READY_TO_RELEASE: 'ready_to_release',
  STEP_COMPLETE: 'step_complete',
  WEAVE_COMPLETE: 'weave_complete',
  // incorrect
  HAND_OUT_OF_ZONE: 'hand_out_of_zone',
  PINCH_NOT_DETECTED: 'pinch_not_detected',
  WRONG_COLUMN: 'wrong_column',
  WRONG_START_POSITION: 'wrong_start_position',
  WEAVING_UPWARD: 'weaving_upward',
  PINCH_RELEASED_EARLY: 'pinch_released_early',
  STRIP_LEFT_COLUMN: 'strip_left_column',
  ZONES_INCOMPLETE: 'zones_incomplete',
  // uncertain
  HAND_NOT_DETECTED: 'hand_not_detected',
  HAND_PARTIALLY_VISIBLE: 'hand_partially_visible',
  LOW_CONFIDENCE: 'low_confidence',
  TRACKING_UNSTABLE: 'tracking_unstable',
  AWAITING_ACTION: 'awaiting_action',
});

export const POSITION = Object.freeze({ A: 'A', B: 'B' });

/** Tunable thresholds. Override per instance: new CraftRuleEngine({ PINCH_ON: 0.3 }) */
export const CONFIG = Object.freeze({
  // Pinch = thumb-tip/index-tip distance divided by hand size (wrist → middle MCP).
  // Hysteresis prevents flicker: engage below PINCH_ON, release above PINCH_OFF.
  PINCH_ON: 0.32,
  PINCH_OFF: 0.48,

  MIN_HAND_SCORE: 0.6, // handedness confidence below this → uncertain
  EDGE_MARGIN: 0.015, // landmarks this close to frame edge → hand cut off
  IN_ZONE_FRACTION: 0.85, // share of 21 landmarks that must be inside CRAFT_AREA
  JUMP_THRESHOLD: 0.22, // pinch point teleporting further than this → tracking glitch
  JUMP_WINDOW_MS: 120,

  LOST_GRACE_MS: 300, // keep last verdict briefly when tracking drops for a few frames
  START_GRACE_MS: 2000, // time to get ready at the start of a step before flagging errors
  ZONE_DWELL_MS: 1000, // step 1 hold time
  TARGET_DWELL_MS: 700, // step 2 hold time in the right start zone
  WRONG_ZONE_MS: 600, // lingering in a wrong column before flagging it
  WRONG_START_MS: 600, // lingering on the wrong starting side before flagging it
  PINCH_DROP_GRACE_MS: 250,
  LEAVE_COLUMN_MS: 300,
  RELEASE_HOLD_MS: 600,
  CELEBRATE_MS: 1400, // pause on "step complete" before advancing
  FLASH_MS: 450,

  CENTER_DEADBAND: 0.18, // fraction of column width either side of centre counted as neutral
  ZONE_SLACK: 0.03, // tolerance when checking the pinch is still in its column
  REQUIRED_ALTERNATIONS: 4, // A→B→A→B→A = 4 alternations
  MIN_DOWN_TRAVEL: 0.22, // fraction of column height the hand must travel downward
  UPWARD_TOLERANCE: 0.05,
});

/** The sheet sits inside this zone (normalised display coordinates). */
export const CRAFT_AREA = Object.freeze({ id: 'craft-area', x: 0.12, y: 0.08, w: 0.76, h: 0.84 });

const COLUMN_COUNT = 5;
const COLUMN_WIDTH = 0.105;
const COLUMN_RIGHT_EDGE = 0.8;

/** C1 is the right-most column (the "right start zone"); C5 is the left-most. */
export const COLUMN_ZONES = Object.freeze(
  Array.from({ length: COLUMN_COUNT }, (_, i) =>
    Object.freeze({
      id: `column-${i + 1}`,
      index: i,
      label: `C${i + 1}`,
      x: COLUMN_RIGHT_EDGE - (i + 1) * COLUMN_WIDTH,
      y: 0.14,
      w: COLUMN_WIDTH,
      h: 0.72,
    }),
  ),
);

export const RIGHT_START_ZONE = COLUMN_ZONES[0];

export const STEPS = Object.freeze([
  {
    id: 1,
    key: 'HAND_IN_ZONE',
    title: 'Set up the base sheet',
    instruction:
      'Lay the slit white sheet flat inside the dotted craft area, then hold your hand over it so the camera can see all of it.',
    targetColumn: null,
  },
  {
    id: 2,
    key: 'PINCH_AND_MOVE',
    title: 'Start the first strip on the right',
    instruction:
      'Pick up a green strip between your thumb and index finger and carry it to the right-most column (C1). Hold it there.',
    targetColumn: 0,
  },
  {
    id: 3,
    key: 'ALTERNATE_WEAVE',
    title: 'Weave the second strip',
    instruction:
      'Weave a strip into column C2. Start on side B, the opposite of the strip beside it, then alternate A, B, A, B as you work down the sheet.',
    targetColumn: 1,
    startPosition: POSITION.B,
  },
  {
    id: 4,
    key: 'ALTERNATE_WEAVE',
    title: 'Weave the third strip',
    instruction: 'Weave column C3. Start on side A, then alternate B, A, B while working down the sheet.',
    targetColumn: 2,
    startPosition: POSITION.A,
  },
  {
    id: 5,
    key: 'ALTERNATE_WEAVE',
    title: 'Weave the fourth strip',
    instruction: 'Weave column C4. Start on side B again and keep alternating down the sheet.',
    targetColumn: 3,
    startPosition: POSITION.B,
  },
  {
    id: 6,
    key: 'WEAVE_COMPLETE',
    title: 'Finish with the last strip',
    instruction:
      'Weave the final strip into column C5, starting on side A. When you reach the bottom, open your fingers to release the strip.',
    targetColumn: 4,
    startPosition: POSITION.A,
  },
]);

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

const LM = { WRIST: 0, THUMB_TIP: 4, INDEX_MCP: 5, INDEX_TIP: 8, MIDDLE_MCP: 9, RING_MCP: 13, PINKY_MCP: 17 };
const PALM_POINTS = [LM.WRIST, LM.INDEX_MCP, LM.MIDDLE_MCP, LM.RING_MCP, LM.PINKY_MCP];

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const opposite = (pos) => (pos === POSITION.A ? POSITION.B : POSITION.A);

export function inZone(pt, zone, slack = 0) {
  return (
    pt.x >= zone.x - slack &&
    pt.x <= zone.x + zone.w + slack &&
    pt.y >= zone.y - slack &&
    pt.y <= zone.y + zone.h + slack
  );
}

function isPartiallyVisible(points, m) {
  return points.some((p) => p.x < m || p.x > 1 - m || p.y < m || p.y > 1 - m);
}

/* ------------------------------------------------------------------ */
/* Engine                                                              */
/* ------------------------------------------------------------------ */

export class CraftRuleEngine {
  constructor(overrides = {}) {
    this.cfg = { ...CONFIG, ...overrides };
    this.aspect = 16 / 9;
    this.reset();
  }

  /** Width / height of the video, so distances are computed in true proportions. */
  setAspectRatio(aspect) {
    if (Number.isFinite(aspect) && aspect > 0) this.aspect = aspect;
  }

  reset() {
    this.stepIndex = 0;
    this.completedColumns = new Set();
    this.finished = false;
    this.isPinching = false;
    this.features = null;
    this.primaryIndex = -1;
    this.lastSeenAt = -Infinity;
    this.lastPinchPoint = null;
    this.lastPointAt = 0;
    this.lastResult = null;
    this._resetStepState();
  }

  /** Jump to a step (0-based). Columns from that step onward are un-marked. */
  goToStep(index) {
    const i = Math.max(0, Math.min(STEPS.length - 1, index));
    for (let s = i; s < STEPS.length; s += 1) {
      if (STEPS[s].targetColumn != null) this.completedColumns.delete(STEPS[s].targetColumn);
    }
    this.stepIndex = i;
    this.finished = false;
    this.lastResult = null;
    this._resetStepState();
  }

  get currentStep() {
    return STEPS[this.stepIndex];
  }

  /** Latest result without running a frame (used for initial UI state). */
  snapshot() {
    return this.lastResult ?? this._emit(RESULT.UNCERTAIN, REASON.AWAITING_ACTION, 0, 0);
  }

  /**
   * Evaluate one frame.
   * @param {Array<{points:{x,y,z}[], score:number}>} hands  from mediaPipeService.detectHands
   * @param {number} now  performance.now() timestamp
   */
  evaluate(hands, now = performance.now()) {
    const cfg = this.cfg;
    if (this.stepStartedAt == null) this.stepStartedAt = now;

    if (this.finished) return this._emit(RESULT.CORRECT, REASON.WEAVE_COMPLETE, 1, now);

    if (this.celebrateUntil != null) {
      if (now < this.celebrateUntil) return this._emit(RESULT.CORRECT, REASON.STEP_COMPLETE, 1, now);
      this._advance(now);
    }

    const picked = this._selectHand(hands);
    if (!picked) {
      this.primaryIndex = -1;
      if (this.lastResult && now - this.lastSeenAt < cfg.LOST_GRACE_MS) return this.lastResult;
      this._clearTimers();
      this.features = null;
      return this._emit(RESULT.UNCERTAIN, REASON.HAND_NOT_DETECTED, this._stepProgress(), now);
    }

    const { hand, index, features } = picked;
    this.primaryIndex = index;
    this.lastSeenAt = now;

    if (hand.score < cfg.MIN_HAND_SCORE) {
      return this._emit(RESULT.UNCERTAIN, REASON.LOW_CONFIDENCE, this._stepProgress(), now);
    }
    if (isPartiallyVisible(hand.points, cfg.EDGE_MARGIN)) {
      return this._emit(RESULT.UNCERTAIN, REASON.HAND_PARTIALLY_VISIBLE, this._stepProgress(), now);
    }

    // Tracking glitch: the pinch point teleported between consecutive frames.
    const jumped =
      this.lastPinchPoint &&
      now - this.lastPointAt < cfg.JUMP_WINDOW_MS &&
      this._dist(features.pinchPoint, this.lastPinchPoint) > cfg.JUMP_THRESHOLD;
    this.lastPinchPoint = features.pinchPoint;
    this.lastPointAt = now;
    if (jumped) return this._emit(RESULT.UNCERTAIN, REASON.TRACKING_UNSTABLE, this._stepProgress(), now);

    this.isPinching = this.isPinching ? features.pinchRatio < cfg.PINCH_OFF : features.pinchRatio < cfg.PINCH_ON;
    features.isPinching = this.isPinching;
    this.features = features;

    const step = this.currentStep;
    switch (step.key) {
      case 'HAND_IN_ZONE':
        return this._evalHandInZone(features, now);
      case 'PINCH_AND_MOVE':
        return this._evalPinchAndMove(features, now, step);
      case 'ALTERNATE_WEAVE':
      case 'WEAVE_COMPLETE':
        return this._evalWeave(features, now, step);
      default:
        return this._emit(RESULT.UNCERTAIN, REASON.AWAITING_ACTION, 0, now);
    }
  }

  /** Everything the canvas overlay needs to draw zones and highlights. */
  getOverlayModel() {
    const step = this.currentStep;
    const weaving = step.key === 'ALTERNATE_WEAVE' || step.key === 'WEAVE_COMPLETE';
    return {
      craftArea: CRAFT_AREA,
      highlightCraftArea: step.key === 'HAND_IN_ZONE',
      columns: COLUMN_ZONES.map((z) => ({
        ...z,
        state: this.completedColumns.has(z.index)
          ? 'done'
          : !this.finished && z.index === step.targetColumn
            ? 'target'
            : 'idle',
      })),
      showSides: weaving && !this.finished,
      expectedPosition: this._expectedPosition(),
      pinchPoint: this.features?.pinchPoint ?? null,
      isPinching: this.isPinching,
      result: this.lastResult?.result ?? null,
      primaryHandIndex: this.primaryIndex,
    };
  }

  /* -------------------------- step rules ---------------------------- */

  _evalHandInZone(f, now) {
    if (f.fractionInCraft >= this.cfg.IN_ZONE_FRACTION) {
      this.dwellStart ??= now;
      const p = (now - this.dwellStart) / this.cfg.ZONE_DWELL_MS;
      if (p >= 1) return this._completeStep(now);
      return this._emit(RESULT.CORRECT, REASON.HAND_IN_ZONE, p, now);
    }
    this.dwellStart = null;
    if (now - this.stepStartedAt < this.cfg.START_GRACE_MS) {
      return this._emit(RESULT.UNCERTAIN, REASON.AWAITING_ACTION, 0, now);
    }
    return this._emit(RESULT.INCORRECT, REASON.HAND_OUT_OF_ZONE, 0, now);
  }

  _evalPinchAndMove(f, now, step) {
    const blocked = this._approach(f, now, step);
    if (blocked) return blocked;

    this.dwellStart ??= now;
    const p = (now - this.dwellStart) / this.cfg.TARGET_DWELL_MS;
    if (p >= 1) {
      this.completedColumns.add(step.targetColumn);
      return this._completeStep(now);
    }
    return this._emit(RESULT.CORRECT, REASON.TARGET_REACHED, 0.3 + 0.7 * p, now);
  }

  _evalWeave(f, now, step) {
    const cfg = this.cfg;
    const col = COLUMN_ZONES[step.targetColumn];

    if (this.phase === 'release') return this._evalRelease(f, now);

    if (this.phase === 'approach') {
      const blocked = this._approach(f, now, step);
      if (blocked) return blocked;
      this.phase = 'weaving';
      this.weaveStartY = f.pinchPoint.y;
      this.maxY = f.pinchPoint.y;
      this.side = null;
      this.alternations = 0;
      this.lastRegY = null;
    }

    // --- weaving phase ---
    if (!f.isPinching) {
      this.pinchLostAt ??= now;
      const reason =
        now - this.pinchLostAt > cfg.PINCH_DROP_GRACE_MS ? REASON.PINCH_RELEASED_EARLY : REASON.WEAVING_IN_PROGRESS;
      const result = reason === REASON.PINCH_RELEASED_EARLY ? RESULT.INCORRECT : RESULT.CORRECT;
      return this._emit(result, reason, this._stepProgress(), now);
    }
    this.pinchLostAt = null;

    if (!inZone(f.pinchPoint, col, cfg.ZONE_SLACK)) {
      this.outOfColumnAt ??= now;
      if (now - this.outOfColumnAt > cfg.LEAVE_COLUMN_MS) {
        return this._emit(RESULT.INCORRECT, REASON.STRIP_LEFT_COLUMN, this._stepProgress(), now);
      }
      return this._emit(RESULT.CORRECT, REASON.WEAVING_IN_PROGRESS, this._stepProgress(), now);
    }
    this.outOfColumnAt = null;
    this.maxY = Math.max(this.maxY, f.pinchPoint.y);

    // Which half of the column is the pinch in? (neutral dead-band around the centre)
    const centre = col.x + col.w / 2;
    const band = col.w * cfg.CENTER_DEADBAND;
    const dx = f.pinchPoint.x - centre;
    const observed = dx < -band ? POSITION.A : dx > band ? POSITION.B : null;

    if (observed && observed !== this.side) {
      if (this.side === null && observed !== step.startPosition) {
        // Entering from the side is natural; only flag if they linger on the wrong start side.
        this.wrongStartAt ??= now;
        if (now - this.wrongStartAt > cfg.WRONG_START_MS) {
          return this._emit(RESULT.INCORRECT, REASON.WRONG_START_POSITION, this._stepProgress(), now, {
            observedPosition: observed,
          });
        }
        return this._emit(RESULT.CORRECT, REASON.TARGET_REACHED, this._stepProgress(), now);
      }
      if (this.lastRegY != null && f.pinchPoint.y < this.lastRegY - cfg.UPWARD_TOLERANCE) {
        return this._emit(RESULT.INCORRECT, REASON.WEAVING_UPWARD, this._stepProgress(), now);
      }
      if (this.side !== null) this.alternations += 1; // first registration is the start, not an alternation
      this.side = observed;
      this.lastRegY = f.pinchPoint.y;
      this.wrongStartAt = null;
      this.flashUntil = now + cfg.FLASH_MS;
    } else if (!observed && this.side === null) {
      this.wrongStartAt = null;
    }

    const travel = (this.maxY - this.weaveStartY) / col.h;
    if (this.alternations >= cfg.REQUIRED_ALTERNATIONS && travel >= cfg.MIN_DOWN_TRAVEL) {
      this.completedColumns.add(step.targetColumn);
      if (step.key === 'WEAVE_COMPLETE') {
        this.phase = 'release';
        this.releaseStart = null;
        return this._emit(RESULT.CORRECT, REASON.READY_TO_RELEASE, 0.95, now);
      }
      return this._completeStep(now);
    }

    const reason = now < this.flashUntil ? REASON.ALTERNATION_REGISTERED : REASON.WEAVING_IN_PROGRESS;
    return this._emit(RESULT.CORRECT, reason, this._stepProgress(), now);
  }

  _evalRelease(f, now) {
    if (f.isPinching) {
      this.releaseStart = null;
      return this._emit(RESULT.CORRECT, REASON.READY_TO_RELEASE, 0.95, now);
    }
    this.releaseStart ??= now;
    if (now - this.releaseStart < this.cfg.RELEASE_HOLD_MS) {
      return this._emit(RESULT.CORRECT, REASON.READY_TO_RELEASE, 0.97, now);
    }
    const missing = COLUMN_ZONES.filter((z) => !this.completedColumns.has(z.index)).map((z) => z.label);
    if (missing.length) {
      return this._emit(RESULT.INCORRECT, REASON.ZONES_INCOMPLETE, 0.97, now, { missingColumns: missing });
    }
    this.finished = true;
    return this._emit(RESULT.CORRECT, REASON.WEAVE_COMPLETE, 1, now);
  }

  /**
   * Shared "pinch the strip and bring it to the target column" rule.
   * Returns a result object while the hand is NOT yet pinching inside the target,
   * or null once it is (caller continues with its own logic).
   */
  _approach(f, now, step) {
    const cfg = this.cfg;
    const target = COLUMN_ZONES[step.targetColumn];
    const inCraft = inZone(f.pinchPoint, CRAFT_AREA) || f.fractionInCraft > 0.5;

    if (!f.isPinching) {
      this.dwellStart = null;
      this.wrongZoneStart = null;
      if (now - this.stepStartedAt < cfg.START_GRACE_MS) {
        return this._emit(RESULT.UNCERTAIN, REASON.AWAITING_ACTION, 0, now);
      }
      return this._emit(RESULT.INCORRECT, inCraft ? REASON.PINCH_NOT_DETECTED : REASON.HAND_OUT_OF_ZONE, 0, now);
    }

    if (inZone(f.pinchPoint, target)) {
      this.wrongZoneStart = null;
      return null;
    }

    this.dwellStart = null;
    const other = COLUMN_ZONES.find((z) => z !== target && inZone(f.pinchPoint, z));
    if (other) {
      this.wrongZoneStart ??= now;
      if (now - this.wrongZoneStart > cfg.WRONG_ZONE_MS) {
        return this._emit(RESULT.INCORRECT, REASON.WRONG_COLUMN, 0.15, now, {
          wrongColumn: other.label,
          targetColumn: target.label,
        });
      }
    } else {
      this.wrongZoneStart = null;
    }

    if (!inCraft) return this._emit(RESULT.INCORRECT, REASON.HAND_OUT_OF_ZONE, 0.1, now);
    return this._emit(RESULT.CORRECT, REASON.PINCH_DETECTED, 0.2, now);
  }

  /* -------------------------- internals ----------------------------- */

  _selectHand(hands) {
    if (!hands?.length) return null;
    let best = null;
    hands.forEach((hand, index) => {
      if (!hand?.points?.length) return;
      const features = this._features(hand.points);
      const rank =
        (features.pinchRatio < this.cfg.PINCH_ON ? 2 : 0) + features.fractionInCraft + (hand.score ?? 0) * 0.5;
      if (!best || rank > best.rank) best = { hand, index, features, rank };
    });
    return best;
  }

  _features(points) {
    const thumb = points[LM.THUMB_TIP];
    const index = points[LM.INDEX_TIP];
    const scale = Math.max(this._dist(points[LM.WRIST], points[LM.MIDDLE_MCP]), 1e-4);
    const palm = PALM_POINTS.reduce(
      (acc, i) => ({ x: acc.x + points[i].x / PALM_POINTS.length, y: acc.y + points[i].y / PALM_POINTS.length }),
      { x: 0, y: 0 },
    );
    return {
      pinchRatio: this._dist(thumb, index) / scale,
      pinchPoint: { x: (thumb.x + index.x) / 2, y: (thumb.y + index.y) / 2 },
      palm,
      fractionInCraft: points.filter((p) => inZone(p, CRAFT_AREA)).length / points.length,
      isPinching: false,
    };
  }

  /** Distance in true proportions (x scaled by aspect ratio). */
  _dist(a, b) {
    return Math.hypot((a.x - b.x) * this.aspect, a.y - b.y);
  }

  _expectedPosition() {
    const step = this.currentStep;
    if (!step.startPosition) return null;
    if (this.phase !== 'weaving' || this.side === null) return step.startPosition;
    return opposite(this.side);
  }

  _stepProgress() {
    const step = this.currentStep;
    if (step.key === 'HAND_IN_ZONE' || step.key === 'PINCH_AND_MOVE') return 0;
    if (this.phase === 'release') return 0.95;
    if (this.phase !== 'weaving') return 0;
    const col = COLUMN_ZONES[step.targetColumn];
    const alt = Math.min(1, this.alternations / this.cfg.REQUIRED_ALTERNATIONS);
    const travel = Math.min(1, (this.maxY - this.weaveStartY) / col.h / this.cfg.MIN_DOWN_TRAVEL);
    return 0.25 + 0.7 * (0.75 * alt + 0.25 * travel);
  }

  _completeStep(now) {
    this.celebrateUntil = now + this.cfg.CELEBRATE_MS;
    return this._emit(RESULT.CORRECT, REASON.STEP_COMPLETE, 1, now);
  }

  _advance(now) {
    this.stepIndex = Math.min(STEPS.length - 1, this.stepIndex + 1);
    this._resetStepState(now);
  }

  _resetStepState(now = null) {
    this.stepStartedAt = now;
    this.phase = 'approach';
    this.side = null;
    this.alternations = 0;
    this.weaveStartY = null;
    this.maxY = null;
    this.lastRegY = null;
    this.celebrateUntil = null;
    this.flashUntil = 0;
    this._clearTimers();
  }

  _clearTimers() {
    this.dwellStart = null;
    this.wrongZoneStart = null;
    this.wrongStartAt = null;
    this.pinchLostAt = null;
    this.outOfColumnAt = null;
    this.releaseStart = null;
    this.isPinching = false;
  }

  _emit(result, reason, progress, now, extra = {}) {
    const step = this.currentStep;
    const out = {
      stepIndex: this.stepIndex,
      stepId: step.id,
      stepKey: step.key,
      result,
      reason,
      progress: clamp01(progress),
      meta: {
        phase: this.phase,
        pinchRatio: this.features?.pinchRatio ?? null,
        isPinching: this.isPinching,
        alternations: this.alternations,
        requiredAlternations: this.cfg.REQUIRED_ALTERNATIONS,
        expectedPosition: this._expectedPosition(),
        targetColumn: step.targetColumn != null ? COLUMN_ZONES[step.targetColumn].label : null,
        ...extra,
      },
      completedColumns: [...this.completedColumns].sort((a, b) => a - b),
      finished: this.finished,
      timestamp: now,
    };
    this.lastResult = out;
    return out;
  }
}

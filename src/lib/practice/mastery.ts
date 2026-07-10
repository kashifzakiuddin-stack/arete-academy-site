/*
  Rolling mastery model — the heart of the tracking system.

  Design (agreed constants at the top so they can be tuned without
  touching logic):

  1. Each attempt produces a SCORE in [0, 1] that blends correctness
     with the pupil's own confidence rating. A confident wrong answer
     scores lower than an admitted guess gone wrong, because it points
     to a settled misconception rather than known uncertainty; a
     correct guess earns less than a correct certainty, because the
     skill is unconfirmed.

  2. Mastery is an exponential moving average of scores, with a larger
     effective weight for a pupil's first few attempts so the estimate
     converges quickly from no data, then stabilises.

  3. Mastery DECAYS with time since the last attempt (half-life below),
     so a skill mastered once and never revisited drifts back toward
     "due for review" — read via effectiveMastery(), which is what
     dashboards and the resurfacing engine use. The stored value is
     never rewritten by decay; decay is applied at read time.
*/

export type Confidence = "guess" | "fairly_sure" | "certain";

export const MASTERY_ALPHA = 0.35;
export const DECAY_HALF_LIFE_DAYS = 45;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const CORRECT_SCORE: Record<Confidence, number> = {
  certain: 1,
  fairly_sure: 0.9,
  guess: 0.6,
};

const INCORRECT_SCORE: Record<Confidence, number> = {
  certain: 0,
  fairly_sure: 0.1,
  guess: 0.2,
};

/** Score for a single attempt. `answered=false` means the timer ran out. */
export function attemptScore(input: {
  answered: boolean;
  correct: boolean;
  confidence: Confidence | null;
}): number {
  if (!input.answered) return 0.05; // timeout: weakest signal short of certain-wrong
  if (input.correct) {
    return input.confidence ? CORRECT_SCORE[input.confidence] : 0.85;
  }
  return input.confidence ? INCORRECT_SCORE[input.confidence] : 0.1;
}

export interface MasteryState {
  mastery: number; // raw stored value, 0..1
  attemptsCount: number;
}

/**
 * Fold one attempt score into the rolling estimate.
 * For the nth attempt the weight is max(alpha, 1/n), so the first
 * attempt sets the estimate outright and early attempts move it fast.
 */
export function updateMastery(
  prior: MasteryState | null,
  score: number
): MasteryState {
  const clamped = Math.min(1, Math.max(0, score));
  if (!prior || prior.attemptsCount <= 0) {
    return { mastery: clamped, attemptsCount: 1 };
  }
  const n = prior.attemptsCount + 1;
  const alpha = Math.max(MASTERY_ALPHA, 1 / n);
  const mastery = prior.mastery * (1 - alpha) + clamped * alpha;
  return {
    mastery: Math.min(1, Math.max(0, mastery)),
    attemptsCount: n,
  };
}

/**
 * Mastery as it should be read NOW: the stored value decayed by the
 * time since the last attempt (half-life DECAY_HALF_LIFE_DAYS).
 */
export function effectiveMastery(
  storedMastery: number,
  lastAttemptAt: Date,
  now: Date
): number {
  const elapsedDays = Math.max(0, now.getTime() - lastAttemptAt.getTime()) / MS_PER_DAY;
  const decay = Math.pow(0.5, elapsedDays / DECAY_HALF_LIFE_DAYS);
  return Math.min(1, Math.max(0, storedMastery * decay));
}

export type MasteryBand = "secure" | "strong" | "developing" | "fragile";

export function masteryBand(effective: number): MasteryBand {
  if (effective >= 0.85) return "secure";
  if (effective >= 0.65) return "strong";
  if (effective >= 0.4) return "developing";
  return "fragile";
}

export const BAND_LABELS: Record<MasteryBand, string> = {
  secure: "Secure",
  strong: "Strong",
  developing: "Developing",
  fragile: "Fragile",
};

/** Which question difficulty (1–3) a pupil should mostly see next. */
export function targetDifficulty(effective: number): 1 | 2 | 3 {
  if (effective < 0.4) return 1;
  if (effective < 0.7) return 2;
  return 3;
}

/**
 * Rebuild the mastery-over-time series for one skill from its full
 * attempt history (oldest first) — used for dashboard trend lines.
 * Returns one point per attempt: the rolling estimate after it.
 */
export function masterySeries(
  attempts: Array<{
    createdAt: Date;
    answered: boolean;
    correct: boolean;
    confidence: Confidence | null;
  }>
): Array<{ at: Date; mastery: number }> {
  let state: MasteryState | null = null;
  const series: Array<{ at: Date; mastery: number }> = [];
  for (const attempt of attempts) {
    state = updateMastery(state, attemptScore(attempt));
    series.push({ at: attempt.createdAt, mastery: state.mastery });
  }
  return series;
}

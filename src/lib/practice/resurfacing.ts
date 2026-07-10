/*
  Spaced resurfacing — "nothing gets quietly forgotten."

  When a pupil launches a quiz for a chosen skill, we fold in a small
  number of questions from OTHER skills that look due for review:

  * a skill is a candidate once it has been attempted at least once;
  * it is DUE when its time-decayed effective mastery has fallen below
    RESURFACE_THRESHOLD and enough days have passed since the last
    attempt — weaker skills come back sooner (interval scales with
    mastery, between MIN_ and MAX_INTERVAL_DAYS);
  * the weakest due skills are chosen first.

  Note that decay alone makes old "mastered" skills due again
  eventually: a skill at 0.9 decays through the threshold after a few
  half-lives without practice, and resurfaces without the pupil ever
  choosing it. That behaviour is intentional and covered by tests.
*/

import { effectiveMastery } from "./mastery";

export const RESURFACE_THRESHOLD = 0.7;
export const MIN_INTERVAL_DAYS = 1;
export const MAX_INTERVAL_DAYS = 13;
export const RESURFACED_PER_QUIZ = 2;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface SkillMasterySnapshot {
  skillId: string;
  mastery: number; // raw stored value
  lastAttemptAt: Date;
  attemptsCount: number;
}

/** Days to wait before a skill at this effective mastery re-appears. */
export function reviewIntervalDays(effective: number): number {
  const clamped = Math.min(1, Math.max(0, effective));
  return MIN_INTERVAL_DAYS + Math.round(clamped * (MAX_INTERVAL_DAYS - MIN_INTERVAL_DAYS));
}

export function isDueForResurfacing(
  snapshot: SkillMasterySnapshot,
  now: Date
): boolean {
  if (snapshot.attemptsCount <= 0) return false;
  const effective = effectiveMastery(snapshot.mastery, snapshot.lastAttemptAt, now);
  if (effective >= RESURFACE_THRESHOLD) return false;
  const daysSince = (now.getTime() - snapshot.lastAttemptAt.getTime()) / MS_PER_DAY;
  return daysSince >= reviewIntervalDays(effective);
}

/**
 * Pick which skills to fold into a quiz launched for `chosenSkillId`.
 * Returns up to `maxCount` skill ids, weakest first. Pure and
 * deterministic: same inputs, same answer.
 */
export function selectResurfacedSkills(
  snapshots: SkillMasterySnapshot[],
  chosenSkillId: string,
  now: Date,
  maxCount: number = RESURFACED_PER_QUIZ
): string[] {
  return snapshots
    .filter((s) => s.skillId !== chosenSkillId)
    .filter((s) => isDueForResurfacing(s, now))
    .map((s) => ({
      skillId: s.skillId,
      effective: effectiveMastery(s.mastery, s.lastAttemptAt, now),
    }))
    .sort((a, b) => a.effective - b.effective || a.skillId.localeCompare(b.skillId))
    .slice(0, Math.max(0, maxCount))
    .map((s) => s.skillId);
}

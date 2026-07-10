import { describe, expect, it } from "vitest";

import {
  isDueForResurfacing,
  MAX_INTERVAL_DAYS,
  reviewIntervalDays,
  selectResurfacedSkills,
  type SkillMasterySnapshot,
} from "./resurfacing";

const DAY = 24 * 60 * 60 * 1000;
const at = (day: number) => new Date(day * DAY);

function snapshot(partial: Partial<SkillMasterySnapshot>): SkillMasterySnapshot {
  return {
    skillId: "skill-x",
    mastery: 0.5,
    lastAttemptAt: at(0),
    attemptsCount: 3,
    ...partial,
  };
}

describe("reviewIntervalDays", () => {
  it("brings weaker skills back sooner than stronger ones", () => {
    expect(reviewIntervalDays(0)).toBeLessThan(reviewIntervalDays(0.6));
    expect(reviewIntervalDays(0)).toBe(1);
    expect(reviewIntervalDays(1)).toBe(1 + MAX_INTERVAL_DAYS - 1);
  });
});

describe("isDueForResurfacing", () => {
  it("never resurfaces a skill that has not been attempted", () => {
    expect(
      isDueForResurfacing(snapshot({ attemptsCount: 0, mastery: 0 }), at(100))
    ).toBe(false);
  });

  it("does not resurface a skill practised strongly today", () => {
    expect(
      isDueForResurfacing(
        snapshot({ mastery: 0.9, lastAttemptAt: at(100) }),
        at(100)
      )
    ).toBe(false);
  });

  it("resurfaces a weak skill after its (short) interval", () => {
    const weak = snapshot({ mastery: 0.2, lastAttemptAt: at(0) });
    expect(isDueForResurfacing(weak, at(0))).toBe(false); // same day: not yet
    expect(isDueForResurfacing(weak, at(3))).toBe(true); // days later: due
  });

  it("resurfaces a once-mastered skill after long neglect (decay)", () => {
    // 0.95 stored, untouched for 90 days: effective ≈ 0.24 — due again
    // without the pupil ever choosing it. "Nothing gets quietly forgotten."
    const neglected = snapshot({ mastery: 0.95, lastAttemptAt: at(0) });
    expect(isDueForResurfacing(neglected, at(90))).toBe(true);
  });
});

describe("selectResurfacedSkills", () => {
  it("excludes the skill the pupil chose for this quiz", () => {
    const chosen = snapshot({ skillId: "chosen", mastery: 0.1, lastAttemptAt: at(0) });
    const other = snapshot({ skillId: "other", mastery: 0.1, lastAttemptAt: at(0) });
    expect(selectResurfacedSkills([chosen, other], "chosen", at(30))).toEqual([
      "other",
    ]);
  });

  it("picks the weakest due skills first and respects the cap", () => {
    const now = at(30);
    const skills = [
      snapshot({ skillId: "weakest", mastery: 0.05, lastAttemptAt: at(0) }),
      snapshot({ skillId: "weak", mastery: 0.2, lastAttemptAt: at(0) }),
      snapshot({ skillId: "middling", mastery: 0.5, lastAttemptAt: at(0) }),
      snapshot({ skillId: "fresh-strong", mastery: 0.95, lastAttemptAt: at(29.9) }),
    ];
    expect(selectResurfacedSkills(skills, "some-other-skill", now, 2)).toEqual([
      "weakest",
      "weak",
    ]);
  });

  it("returns nothing when nothing is due", () => {
    const now = at(1);
    const skills = [
      snapshot({ skillId: "a", mastery: 0.9, lastAttemptAt: at(0.5) }),
      snapshot({ skillId: "b", mastery: 0.85, lastAttemptAt: at(0.9) }),
    ];
    expect(selectResurfacedSkills(skills, "c", now)).toEqual([]);
  });

  it("is deterministic when candidates tie", () => {
    const now = at(30);
    const skills = [
      snapshot({ skillId: "b-skill", mastery: 0.2, lastAttemptAt: at(0) }),
      snapshot({ skillId: "a-skill", mastery: 0.2, lastAttemptAt: at(0) }),
    ];
    const first = selectResurfacedSkills(skills, "x", now, 1);
    const second = selectResurfacedSkills(skills, "x", now, 1);
    expect(first).toEqual(second);
    expect(first).toEqual(["a-skill"]);
  });
});

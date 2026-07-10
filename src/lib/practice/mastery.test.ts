import { describe, expect, it } from "vitest";

import {
  attemptScore,
  DECAY_HALF_LIFE_DAYS,
  effectiveMastery,
  masteryBand,
  masterySeries,
  targetDifficulty,
  updateMastery,
} from "./mastery";

const DAY = 24 * 60 * 60 * 1000;
const at = (daysFromEpoch: number) => new Date(daysFromEpoch * DAY);

describe("attemptScore", () => {
  it("rewards confident correct answers most", () => {
    expect(attemptScore({ answered: true, correct: true, confidence: "certain" })).toBe(1);
    expect(
      attemptScore({ answered: true, correct: true, confidence: "certain" })
    ).toBeGreaterThan(
      attemptScore({ answered: true, correct: true, confidence: "guess" })
    );
  });

  it("penalises a confident wrong answer more than an admitted guess gone wrong", () => {
    const certainWrong = attemptScore({ answered: true, correct: false, confidence: "certain" });
    const guessWrong = attemptScore({ answered: true, correct: false, confidence: "guess" });
    expect(certainWrong).toBeLessThan(guessWrong);
    expect(certainWrong).toBe(0);
  });

  it("scores every wrong answer below every right answer", () => {
    const worstRight = attemptScore({ answered: true, correct: true, confidence: "guess" });
    const bestWrong = attemptScore({ answered: true, correct: false, confidence: "guess" });
    expect(bestWrong).toBeLessThan(worstRight);
  });

  it("treats a timeout as a very weak signal, not a zero", () => {
    const timeout = attemptScore({ answered: false, correct: false, confidence: null });
    expect(timeout).toBeGreaterThan(0);
    expect(timeout).toBeLessThan(0.1);
  });
});

describe("updateMastery", () => {
  it("sets the estimate from the first attempt outright", () => {
    expect(updateMastery(null, 0.9)).toEqual({ mastery: 0.9, attemptsCount: 1 });
    expect(updateMastery(null, 0)).toEqual({ mastery: 0, attemptsCount: 1 });
  });

  it("is a rolling estimate, not last-attempt-wins", () => {
    // Three perfect answers, then one slip: mastery should dip but stay
    // well above what a single wrong answer would suggest.
    let state = updateMastery(null, 1);
    state = updateMastery(state, 1);
    state = updateMastery(state, 1);
    const beforeSlip = state.mastery;
    state = updateMastery(state, 0.1);
    expect(state.mastery).toBeLessThan(beforeSlip);
    expect(state.mastery).toBeGreaterThan(0.5);
    expect(state.attemptsCount).toBe(4);
  });

  it("converges upward with sustained correct answers after a bad start", () => {
    let state = updateMastery(null, 0);
    for (let i = 0; i < 8; i++) state = updateMastery(state, 1);
    expect(state.mastery).toBeGreaterThan(0.9);
  });

  it("weights early attempts more heavily than later ones", () => {
    // Second attempt carries weight 1/2 — a big correction…
    let early = updateMastery(null, 1);
    early = updateMastery(early, 0);
    expect(early.mastery).toBeCloseTo(0.5, 5);

    // …whereas by the tenth attempt one score moves the needle far less.
    let late = updateMastery(null, 1);
    for (let i = 0; i < 8; i++) late = updateMastery(late, 1);
    const before = late.mastery;
    late = updateMastery(late, 0);
    expect(before - late.mastery).toBeLessThan(0.4);
  });

  it("clamps scores into [0, 1]", () => {
    expect(updateMastery(null, 2).mastery).toBe(1);
    expect(updateMastery(null, -1).mastery).toBe(0);
  });
});

describe("effectiveMastery (time decay)", () => {
  it("applies no decay immediately after practice", () => {
    expect(effectiveMastery(0.8, at(100), at(100))).toBeCloseTo(0.8, 10);
  });

  it("halves the estimate after one half-life", () => {
    expect(
      effectiveMastery(0.8, at(0), at(DECAY_HALF_LIFE_DAYS))
    ).toBeCloseTo(0.4, 10);
  });

  it("means a skill mastered once and never revisited does NOT stay mastered", () => {
    const justMastered = effectiveMastery(0.95, at(0), at(0));
    expect(masteryBand(justMastered)).toBe("secure");
    const sixMonthsLater = effectiveMastery(0.95, at(0), at(180));
    expect(masteryBand(sixMonthsLater)).toBe("fragile");
  });

  it("never goes negative and ignores clock skew into the past", () => {
    expect(effectiveMastery(0.5, at(10), at(5))).toBeCloseTo(0.5, 10);
    expect(effectiveMastery(0, at(0), at(1000))).toBe(0);
  });
});

describe("bands and difficulty targeting", () => {
  it("maps effective mastery onto the four bands", () => {
    expect(masteryBand(0.9)).toBe("secure");
    expect(masteryBand(0.7)).toBe("strong");
    expect(masteryBand(0.5)).toBe("developing");
    expect(masteryBand(0.1)).toBe("fragile");
  });

  it("serves easier questions to weaker skills and harder to stronger", () => {
    expect(targetDifficulty(0.1)).toBe(1);
    expect(targetDifficulty(0.5)).toBe(2);
    expect(targetDifficulty(0.9)).toBe(3);
  });
});

describe("masterySeries", () => {
  it("rebuilds the trend line from history, one point per attempt", () => {
    const series = masterySeries([
      { createdAt: at(0), answered: true, correct: false, confidence: "certain" },
      { createdAt: at(1), answered: true, correct: true, confidence: "fairly_sure" },
      { createdAt: at(2), answered: true, correct: true, confidence: "certain" },
    ]);
    expect(series).toHaveLength(3);
    expect(series[0].mastery).toBe(0);
    expect(series[1].mastery).toBeGreaterThan(series[0].mastery);
    expect(series[2].mastery).toBeGreaterThan(series[1].mastery);
  });
});

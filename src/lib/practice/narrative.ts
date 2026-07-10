/*
  Plain-English narrative summaries for dashboards — the brief is
  explicit that parents get sentences, not visuals alone. Generated
  from real aggregates; restrained house tone (no exclamation marks,
  no superlatives).
*/

import { BAND_LABELS, masteryBand } from "./mastery";

export interface SkillNarrativeRow {
  skillName: string;
  category: "essential" | "extension";
  effective: number; // decayed mastery, 0..1
  attemptsCount: number;
  daysSinceLastAttempt: number;
}

export interface MisconceptionCount {
  label: string;
  count: number;
}

export function buildNarrative(
  childName: string,
  rows: SkillNarrativeRow[],
  recentMisconceptions: MisconceptionCount[]
): string[] {
  const practised = rows.filter((r) => r.attemptsCount > 0);
  if (practised.length === 0) {
    return [
      `${childName} has not attempted any practice quizzes yet. Once a few sessions are complete, this summary will describe strengths, gaps, and what to work on next in plain terms.`,
    ];
  }

  const sentences: string[] = [];
  const byStrength = [...practised].sort((a, b) => b.effective - a.effective);
  const strongest = byStrength[0];
  const weakest = byStrength[byStrength.length - 1];

  const attempts = practised.reduce((sum, r) => sum + r.attemptsCount, 0);
  sentences.push(
    `${childName} has answered ${attempts} question${attempts === 1 ? "" : "s"} across ${practised.length} skill${practised.length === 1 ? "" : "s"}.`
  );

  if (strongest && weakest && strongest.skillName !== weakest.skillName) {
    sentences.push(
      `The most secure area at the moment is ${strongest.skillName} (${BAND_LABELS[masteryBand(strongest.effective)].toLowerCase()}); the area most in need of attention is ${weakest.skillName} (${BAND_LABELS[masteryBand(weakest.effective)].toLowerCase()}), which would be the natural focus of the next few sessions.`
    );
  } else if (strongest) {
    sentences.push(
      `${strongest.skillName} currently stands at ${BAND_LABELS[masteryBand(strongest.effective)].toLowerCase()}.`
    );
  }

  // Skills that were once strong but have gone stale (decay at work).
  const stale = practised.filter(
    (r) => r.daysSinceLastAttempt >= 21 && r.effective < 0.65 && r.attemptsCount >= 3
  );
  if (stale.length > 0) {
    const names = stale
      .slice(0, 3)
      .map((r) => r.skillName)
      .join(", ");
    sentences.push(
      `${names} ${stale.length === 1 ? "has" : "have"} not been practised for a few weeks and ${stale.length === 1 ? "is" : "are"} due a refresher; the system will fold ${stale.length === 1 ? "it" : "them"} back into upcoming quizzes automatically.`
    );
  }

  const topMisconception = recentMisconceptions
    .filter((m) => m.count >= 2)
    .sort((a, b) => b.count - a.count)[0];
  if (topMisconception) {
    sentences.push(
      `Looking at the wrong answers rather than just the marks, the most common recent pattern is “${topMisconception.label.toLowerCase()}” (${topMisconception.count} times) — a specific, fixable habit rather than a general weakness, and a useful thing to mention to a tutor.`
    );
  }

  return sentences;
}

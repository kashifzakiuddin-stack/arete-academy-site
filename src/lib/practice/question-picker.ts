/*
  Question selection within one quiz. Pure so it can be tested; the
  API route supplies the pools from the database.

  Rules:
  * questions at the pupil's target difficulty are preferred, then the
    nearest difficulty either side;
  * questions attempted recently (ids in `recentQuestionIds`) are
    avoided while unseen alternatives remain;
  * deterministic given the same inputs — ordering ties break on id.
*/

export interface PickableQuestion {
  id: string;
  difficulty: 1 | 2 | 3;
}

export function pickQuestions<T extends PickableQuestion>(
  pool: T[],
  target: 1 | 2 | 3,
  count: number,
  recentQuestionIds: ReadonlySet<string> = new Set()
): T[] {
  const ranked = [...pool].sort((a, b) => {
    const seenA = recentQuestionIds.has(a.id) ? 1 : 0;
    const seenB = recentQuestionIds.has(b.id) ? 1 : 0;
    if (seenA !== seenB) return seenA - seenB; // unseen first
    const distA = Math.abs(a.difficulty - target);
    const distB = Math.abs(b.difficulty - target);
    if (distA !== distB) return distA - distB; // closest band first
    return a.id.localeCompare(b.id);
  });
  return ranked.slice(0, Math.max(0, count));
}

export const QUESTIONS_FROM_CHOSEN_SKILL = 5;

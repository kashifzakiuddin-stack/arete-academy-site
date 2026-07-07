/*
  Mock question bank for the Diagnostic demo.

  TODO: PHASE 2 — persist to backend, tie to real taxonomy. These twelve
  questions stand in for the full 41-skill question bank; skill codes below
  imitate the taxonomy format (area + strand + difficulty band) but are
  illustrative only.
*/

export type SkillArea = "NUM" | "ALG";

export type Difficulty = 1 | 2 | 3;

export interface DiagnosticQuestion {
  id: string;
  skill: SkillArea;
  skillLabel: string;
  code: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answerIndex: number;
  timeLimitSeconds: number;
  explanation: string;
}

export const SKILL_LABELS: Record<SkillArea, string> = {
  NUM: "Number",
  ALG: "Algebra",
};

export const QUESTION_BANK: DiagnosticQuestion[] = [
  // ——— Number ———
  {
    id: "num-1a",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-1.1",
    difficulty: 1,
    prompt: "What is 348 + 267?",
    options: ["515", "605", "615", "625"],
    answerIndex: 2,
    timeLimitSeconds: 45,
    explanation:
      "Add the ones (8 + 7 = 15, carry 1), the tens (4 + 6 + 1 = 11, carry 1), then the hundreds (3 + 2 + 1 = 6), giving 615.",
  },
  {
    id: "num-1b",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-1.2",
    difficulty: 1,
    prompt: "What is 804 − 356?",
    options: ["448", "458", "452", "548"],
    answerIndex: 0,
    timeLimitSeconds: 45,
    explanation:
      "Count up from 356: add 44 to reach 400, then 404 more to reach 804. 44 + 404 = 448.",
  },
  {
    id: "num-2a",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-2.1",
    difficulty: 2,
    prompt:
      "A bar of chocolate has 24 squares. Ellie eats three eighths of it. How many squares remain?",
    options: ["9", "12", "15", "16"],
    answerIndex: 2,
    timeLimitSeconds: 60,
    explanation:
      "One eighth of 24 is 3, so three eighths is 9 squares eaten. 24 − 9 = 15 squares remain.",
  },
  {
    id: "num-2b",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-2.2",
    difficulty: 2,
    prompt: "What is 3.6 × 4?",
    options: ["12.4", "13.6", "14.4", "14.8"],
    answerIndex: 2,
    timeLimitSeconds: 60,
    explanation:
      "3 × 4 = 12 and 0.6 × 4 = 2.4; together they make 14.4.",
  },
  {
    id: "num-3a",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-3.1",
    difficulty: 3,
    prompt:
      "A train leaves at 09:47 and arrives at 11:23. How long is the journey?",
    options: ["1 hour 24 minutes", "1 hour 36 minutes", "1 hour 46 minutes", "2 hours 36 minutes"],
    answerIndex: 1,
    timeLimitSeconds: 75,
    explanation:
      "From 09:47 it is 13 minutes to 10:00, then 1 hour to 11:00, then 23 minutes more: 13 + 60 + 23 = 96 minutes, or 1 hour 36 minutes.",
  },
  {
    id: "num-3b",
    skill: "NUM",
    skillLabel: "Number",
    code: "NUM-3.2",
    difficulty: 3,
    prompt: "Which of these is the largest?",
    options: ["2⁄3", "0.6", "65%", "7⁄12"],
    answerIndex: 0,
    timeLimitSeconds: 75,
    explanation:
      "Convert everything to decimals: 2⁄3 ≈ 0.667, 0.6, 65% = 0.65, and 7⁄12 ≈ 0.583. The largest is 2⁄3.",
  },

  // ——— Algebra ———
  {
    id: "alg-1a",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-1.1",
    difficulty: 1,
    prompt: "If n + 7 = 15, what is n?",
    options: ["6", "7", "8", "22"],
    answerIndex: 2,
    timeLimitSeconds: 45,
    explanation: "Subtract 7 from both sides: n = 15 − 7 = 8.",
  },
  {
    id: "alg-1b",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-1.2",
    difficulty: 1,
    prompt: "What is the next number in the sequence 4, 7, 10, 13, …?",
    options: ["15", "16", "17", "14"],
    answerIndex: 1,
    timeLimitSeconds: 45,
    explanation: "The sequence increases by 3 each time, so 13 + 3 = 16.",
  },
  {
    id: "alg-2a",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-2.1",
    difficulty: 2,
    prompt: "If 3y = 27, what is y + 4?",
    options: ["9", "12", "13", "31"],
    answerIndex: 2,
    timeLimitSeconds: 60,
    explanation: "3y = 27 means y = 9, so y + 4 = 13.",
  },
  {
    id: "alg-2b",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-2.2",
    difficulty: 2,
    prompt:
      "A sequence follows the rule “double, then subtract 1”. It starts at 3. What is the third term?",
    options: ["7", "9", "11", "17"],
    answerIndex: 1,
    timeLimitSeconds: 60,
    explanation:
      "Start at 3. Second term: 3 × 2 − 1 = 5. Third term: 5 × 2 − 1 = 9.",
  },
  {
    id: "alg-3a",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-3.1",
    difficulty: 3,
    prompt: "If 2a + 3 = 17, what is 3a?",
    options: ["7", "14", "21", "24"],
    answerIndex: 2,
    timeLimitSeconds: 75,
    explanation:
      "2a + 3 = 17 gives 2a = 14, so a = 7 and 3a = 21.",
  },
  {
    id: "alg-3b",
    skill: "ALG",
    skillLabel: "Algebra",
    code: "ALG-3.2",
    difficulty: 3,
    prompt:
      "p and q are whole numbers. p × q = 24 and p − q = 5. What is p + q?",
    options: ["8", "10", "11", "14"],
    answerIndex: 2,
    timeLimitSeconds: 75,
    explanation:
      "The factor pair of 24 with a difference of 5 is 8 and 3, so p + q = 11.",
  },
];

export const QUIZ_LENGTH = 8;
export const STARTING_DIFFICULTY: Difficulty = 2;

"use client";

/*
  The Diagnostic — front-end demonstration only.

  TODO: PHASE 2 — persist to backend, tie to real taxonomy. Everything below
  (question selection, adaptive weighting, response capture, results) lives
  in React state for the session only and is deliberately simple: it is a
  demo of the *experience*, not the real adaptive engine.
*/

import * as React from "react";
import { CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";

import {
  QUESTION_BANK,
  QUIZ_LENGTH,
  SKILL_LABELS,
  STARTING_DIFFICULTY,
  type Difficulty,
  type DiagnosticQuestion,
  type SkillArea,
} from "@/lib/diagnostic-questions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

type Confidence = "guess" | "fairly-sure" | "certain";

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  guess: "A guess",
  "fairly-sure": "Fairly sure",
  certain: "Certain",
};

const BAND_LABELS: Record<Difficulty, string> = {
  1: "Foundation",
  2: "Intermediate",
  3: "Extension",
};

interface Response {
  question: DiagnosticQuestion;
  selectedIndex: number | null; // null = ran out of time
  correct: boolean;
  responseSeconds: number;
  confidence: Confidence | null;
}

type Phase = "intro" | "question" | "confidence" | "reveal" | "results";

/*
  Simple adaptive logic for the demo: each skill area has a live difficulty
  band. A correct answer moves that skill up a band; an incorrect answer (or
  a timeout) moves it down. Skills alternate so both areas are sampled.
  TODO: PHASE 2 — replace with the real adaptive weighting engine.
*/
function clampDifficulty(d: number): Difficulty {
  return Math.max(1, Math.min(3, d)) as Difficulty;
}

function pickQuestion(
  skill: SkillArea,
  difficulty: Difficulty,
  usedIds: ReadonlySet<string>
): DiagnosticQuestion | null {
  const unused = QUESTION_BANK.filter(
    (q) => q.skill === skill && !usedIds.has(q.id)
  );
  if (unused.length === 0) return null;
  // Prefer the target band, then the nearest available band.
  const byDistance = [...unused].sort(
    (a, b) =>
      Math.abs(a.difficulty - difficulty) - Math.abs(b.difficulty - difficulty)
  );
  return byDistance[0];
}

function otherSkill(skill: SkillArea): SkillArea {
  return skill === "NUM" ? "ALG" : "NUM";
}

interface SkillSummary {
  skill: SkillArea;
  attempted: number;
  correct: number;
  masteryPercent: number; // difficulty-weighted
  finalBand: Difficulty;
  averageSeconds: number;
}

function summariseSkill(
  skill: SkillArea,
  responses: Response[],
  finalBand: Difficulty
): SkillSummary | null {
  const own = responses.filter((r) => r.question.skill === skill);
  if (own.length === 0) return null;
  const weightEarned = own.reduce(
    (sum, r) => sum + (r.correct ? r.question.difficulty : 0),
    0
  );
  const weightAvailable = own.reduce((sum, r) => sum + r.question.difficulty, 0);
  return {
    skill,
    attempted: own.length,
    correct: own.filter((r) => r.correct).length,
    masteryPercent: Math.round((weightEarned / weightAvailable) * 100),
    finalBand,
    averageSeconds:
      Math.round(
        (own.reduce((sum, r) => sum + r.responseSeconds, 0) / own.length) * 10
      ) / 10,
  };
}

/* A plain-English narrative, generated from the session's data. */
function buildNarrative(summaries: SkillSummary[], responses: Response[]) {
  const sentences: string[] = [];

  const sorted = [...summaries].sort(
    (a, b) => b.masteryPercent - a.masteryPercent
  );
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  if (strongest && weakest && strongest.skill !== weakest.skill) {
    sentences.push(
      `${SKILL_LABELS[strongest.skill]} is currently the stronger area: ` +
        `${strongest.correct} of ${strongest.attempted} answered correctly, finishing in the ${BAND_LABELS[strongest.finalBand].toLowerCase()} band. ` +
        `${SKILL_LABELS[weakest.skill]} finished in the ${BAND_LABELS[weakest.finalBand].toLowerCase()} band and would be the natural first focus of tuition.`
    );
  } else if (strongest) {
    sentences.push(
      `Across both areas the working level is similar, finishing in the ${BAND_LABELS[strongest.finalBand].toLowerCase()} band.`
    );
  }

  const certainButWrong = responses.filter(
    (r) => r.confidence === "certain" && !r.correct && r.selectedIndex !== null
  );
  if (certainButWrong.length > 0) {
    const codes = certainButWrong.map((r) => r.question.code).join(", ");
    sentences.push(
      `On ${certainButWrong.length === 1 ? "one question" : `${certainButWrong.length} questions`} (${codes}) the answer was given with certainty but was incorrect — the most useful kind of finding, since it usually points to a settled misconception rather than a slip, and it is exactly what a tutor would address first.`
    );
  }

  const luckyGuesses = responses.filter(
    (r) => r.confidence === "guess" && r.correct
  );
  if (luckyGuesses.length > 0) {
    sentences.push(
      `${luckyGuesses.length === 1 ? "One correct answer" : `${luckyGuesses.length} correct answers`} came from a self-declared guess, so the underlying skill should be treated as unconfirmed rather than secure.`
    );
  }

  const timeouts = responses.filter((r) => r.selectedIndex === null);
  if (timeouts.length > 0) {
    sentences.push(
      `${timeouts.length === 1 ? "One question" : `${timeouts.length} questions`} ran out of time, which suggests working pace — not ability — is worth attention.`
    );
  }

  if (sentences.length <= 1) {
    sentences.push(
      "Confidence ratings matched the results well, which suggests the child has an accurate sense of what they know — a good foundation for targeted practice."
    );
  }

  return sentences;
}

export function DiagnosticQuiz() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [responses, setResponses] = React.useState<Response[]>([]);
  const [current, setCurrent] = React.useState<DiagnosticQuestion | null>(null);
  const [difficultyBySkill, setDifficultyBySkill] = React.useState<
    Record<SkillArea, Difficulty>
  >({ NUM: STARTING_DIFFICULTY, ALG: STARTING_DIFFICULTY });
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);
  const [confidence, setConfidence] = React.useState<Confidence | null>(null);
  const [responseSeconds, setResponseSeconds] = React.useState(0);

  const questionNumber = responses.length + (current ? 1 : 0);

  const serveNext = React.useCallback(
    (
      prevResponses: Response[],
      difficulties: Record<SkillArea, Difficulty>
    ) => {
      if (prevResponses.length >= QUIZ_LENGTH) {
        setCurrent(null);
        setPhase("results");
        return;
      }
      const used = new Set(prevResponses.map((r) => r.question.id));
      const lastSkill =
        prevResponses.length > 0
          ? prevResponses[prevResponses.length - 1].question.skill
          : "ALG"; // so the first question is Number
      const nextSkill = otherSkill(lastSkill);
      const question =
        pickQuestion(nextSkill, difficulties[nextSkill], used) ??
        pickQuestion(lastSkill, difficulties[lastSkill], used);
      if (!question) {
        setCurrent(null);
        setPhase("results");
        return;
      }
      setCurrent(question);
      setSecondsLeft(question.timeLimitSeconds);
      setSelectedIndex(null);
      setConfidence(null);
      setResponseSeconds(0);
      setPhase("question");
    },
    []
  );

  const begin = () => {
    setResponses([]);
    setDifficultyBySkill({ NUM: STARTING_DIFFICULTY, ALG: STARTING_DIFFICULTY });
    serveNext([], { NUM: STARTING_DIFFICULTY, ALG: STARTING_DIFFICULTY });
  };

  const recordResponse = React.useCallback(
    (answerIndex: number | null, conf: Confidence | null, elapsed: number) => {
      if (!current) return;
      const correct =
        answerIndex !== null && answerIndex === current.answerIndex;
      const response: Response = {
        question: current,
        selectedIndex: answerIndex,
        correct,
        responseSeconds: elapsed,
        confidence: conf,
      };
      setResponses((prev) => [...prev, response]);
      setDifficultyBySkill((prev) => ({
        ...prev,
        [current.skill]: clampDifficulty(
          prev[current.skill] + (correct ? 1 : -1)
        ),
      }));
      setPhase("reveal");
    },
    [current]
  );

  // Countdown timer — runs only while a question is open for answering.
  React.useEffect(() => {
    if (phase !== "question" || !current) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Time expired: no answer, no confidence rating.
          recordResponse(null, null, current.timeLimitSeconds);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, current, recordResponse]);

  const chooseAnswer = (index: number) => {
    if (!current || phase !== "question") return;
    setSelectedIndex(index);
    setResponseSeconds(current.timeLimitSeconds - secondsLeft);
    setPhase("confidence"); // timer stops; confidence is asked before reveal
  };

  const revealAnswer = () => {
    if (selectedIndex === null || confidence === null) return;
    recordResponse(selectedIndex, confidence, responseSeconds);
  };

  const next = () => serveNext(responses, difficultyBySkill);

  /* ——————————————————— Screens ——————————————————— */

  if (phase === "intro") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Sample Diagnostic — Mathematics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed text-ink/85">
          <p>
            This short demonstration samples two skill areas —{" "}
            <strong>Number</strong> and <strong>Algebra</strong> — across{" "}
            {QUIZ_LENGTH} questions. It behaves like the real Diagnostic in
            miniature: questions adapt to how you answer, each has its own
            time limit, and before each answer is revealed you will be asked
            how confident you were.
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="border-l-2 border-brass-soft/60 pl-3">
              Answer well and the questions step up a band; struggle and they
              ease off. There is no penalty for the questions easing — the
              point is to find the true working level.
            </li>
            <li className="border-l-2 border-brass-soft/60 pl-3">
              The confidence rating matters: a wrong answer given with
              certainty tells a tutor more than the mark itself.
            </li>
            <li className="border-l-2 border-brass-soft/60 pl-3">
              Nothing is saved or sent anywhere — this is a demonstration,
              and the results exist only on this page until you leave it.
            </li>
          </ul>
          <div className="pt-2 text-center">
            <Button size="lg" onClick={begin}>
              Begin the sample
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === "results") {
    const summaries = (["NUM", "ALG"] as const)
      .map((skill) =>
        summariseSkill(skill, responses, difficultyBySkill[skill])
      )
      .filter((s): s is SkillSummary => s !== null);
    const narrative = buildNarrative(summaries, responses);
    const totalCorrect = responses.filter((r) => r.correct).length;

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader className="text-center">
            <p className="inscription">Results</p>
            <CardTitle className="text-2xl">
              {totalCorrect} of {responses.length} answered correctly
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Per-skill mastery visual */}
            <div className="space-y-6">
              {summaries.map((summary) => (
                <div key={summary.skill}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-serif text-lg text-navy">
                      {SKILL_LABELS[summary.skill]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      finished in the{" "}
                      <span className="font-semibold text-brass">
                        {BAND_LABELS[summary.finalBand]}
                      </span>{" "}
                      band
                    </p>
                  </div>
                  <Progress
                    value={summary.masteryPercent}
                    className="mt-2 h-2.5"
                    aria-label={`${SKILL_LABELS[summary.skill]} mastery ${summary.masteryPercent} per cent`}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {summary.correct} of {summary.attempted} correct ·
                    difficulty-weighted mastery {summary.masteryPercent}% ·
                    average response {summary.averageSeconds}s
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Plain-English narrative summary */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg text-navy">In plain English</h3>
              {narrative.map((sentence, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink/85">
                  {sentence}
                </p>
              ))}
            </div>

            <Separator />

            {/* Question-by-question detail: time and confidence shown back */}
            <div>
              <h3 className="font-serif text-lg text-navy">
                Question by question
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[26rem] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                      <th scope="col" className="py-2 pr-3 font-medium">Skill</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Band</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Result</th>
                      <th scope="col" className="py-2 pr-3 font-medium">Time</th>
                      <th scope="col" className="py-2 font-medium">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((r, i) => (
                      <tr key={i} className="border-b border-border/60">
                        <td className="py-2 pr-3">{r.question.code}</td>
                        <td className="py-2 pr-3">
                          {BAND_LABELS[r.question.difficulty]}
                        </td>
                        <td className="py-2 pr-3">
                          {r.selectedIndex === null ? (
                            <span className="text-muted-foreground">
                              Out of time
                            </span>
                          ) : r.correct ? (
                            <span className="inline-flex items-center gap-1 text-navy">
                              <CheckCircle2 className="size-4 text-mid-blue" />
                              Correct
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-destructive">
                              <XCircle className="size-4" />
                              Incorrect
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-3">{r.responseSeconds}s</td>
                        <td className="py-2">
                          {r.confidence ? CONFIDENCE_LABELS[r.confidence] : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              In the full Diagnostic these results persist across sittings,
              cover the complete 41-skill taxonomy, and feed a parent
              dashboard with trends over time.
              {/* TODO: PHASE 2 — persist results to backend; add error-type
                  tagging and skill decay across repeated sittings. */}
            </p>

            <div className="text-center">
              <Button onClick={begin} variant="outline">
                <RotateCcw className="size-4" /> Take the sample again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  const isReveal = phase === "reveal";
  const lastResponse = isReveal ? responses[responses.length - 1] : null;
  const timerPercent = (secondsLeft / current.timeLimitSeconds) * 100;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Question {Math.min(questionNumber, QUIZ_LENGTH)} of {QUIZ_LENGTH}
          </p>
          <p className="text-xs text-muted-foreground">
            {current.skillLabel} · {current.code} ·{" "}
            {BAND_LABELS[current.difficulty]} band
          </p>
        </div>

        {/* Countdown timer */}
        {phase === "question" ? (
          <div className="mt-2" aria-live="polite">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> Time remaining
              </span>
              <span
                className={cn(
                  "tabular-nums",
                  secondsLeft <= 10 && "font-semibold text-destructive"
                )}
              >
                {secondsLeft}s
              </span>
            </div>
            <Progress
              value={timerPercent}
              className="mt-1.5 h-1.5"
              indicatorClassName={cn(secondsLeft <= 10 && "bg-destructive")}
              aria-hidden="true"
            />
          </div>
        ) : null}

        <CardTitle className="mt-4 text-xl leading-relaxed">
          {current.prompt}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-2.5" role="group" aria-label="Answer options">
          {current.options.map((option, index) => {
            const chosen = selectedIndex === index;
            const isAnswer = index === current.answerIndex;
            return (
              <button
                key={index}
                type="button"
                disabled={phase !== "question"}
                onClick={() => chooseAnswer(index)}
                aria-pressed={chosen}
                className={cn(
                  "rounded-md border bg-white px-4 py-3 text-left text-sm transition-colors",
                  phase === "question" &&
                    "hover:border-mid-blue hover:bg-mist/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  chosen && !isReveal && "border-mid-blue bg-mist/50",
                  isReveal && isAnswer && "border-mid-blue bg-mist/60 font-medium",
                  isReveal &&
                    chosen &&
                    !isAnswer &&
                    "border-destructive/60 bg-destructive/5"
                )}
              >
                <span className="mr-2 font-serif text-brass">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
                {isReveal && isAnswer ? (
                  <span className="ml-2 text-xs text-mid-blue">— correct answer</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Confidence self-rating, captured before the answer is revealed */}
        {phase === "confidence" ? (
          <fieldset className="rounded-md border bg-mist/30 p-4">
            <legend className="px-1 text-sm font-medium text-navy">
              Before we mark it — how sure were you?
            </legend>
            <RadioGroup
              className="mt-2 gap-2.5"
              value={confidence ?? undefined}
              onValueChange={(value) => setConfidence(value as Confidence)}
            >
              {(Object.keys(CONFIDENCE_LABELS) as Confidence[]).map((key) => (
                <div key={key} className="flex items-center gap-2.5">
                  <RadioGroupItem value={key} id={`confidence-${key}`} />
                  <Label htmlFor={`confidence-${key}`} className="font-normal">
                    {CONFIDENCE_LABELS[key]}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button
              className="mt-4"
              onClick={revealAnswer}
              disabled={confidence === null}
            >
              Reveal the answer
            </Button>
          </fieldset>
        ) : null}

        {/* Reveal */}
        {isReveal && lastResponse ? (
          <div
            className={cn(
              "rounded-md border p-4",
              lastResponse.correct
                ? "border-mid-blue/40 bg-mist/40"
                : "border-destructive/30 bg-destructive/5"
            )}
          >
            <p className="flex items-center gap-2 font-serif text-lg text-navy">
              {lastResponse.selectedIndex === null ? (
                <>
                  <Clock className="size-5 text-muted-foreground" /> Out of time
                </>
              ) : lastResponse.correct ? (
                <>
                  <CheckCircle2 className="size-5 text-mid-blue" /> Correct
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" /> Not quite
                </>
              )}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink/85">
              {current.explanation}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Answered in {lastResponse.responseSeconds}s
              {lastResponse.confidence
                ? ` · confidence: ${CONFIDENCE_LABELS[lastResponse.confidence].toLowerCase()}`
                : ""}
            </p>
            <Button className="mt-4" onClick={next}>
              {responses.length >= QUIZ_LENGTH
                ? "See the results"
                : "Next question"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

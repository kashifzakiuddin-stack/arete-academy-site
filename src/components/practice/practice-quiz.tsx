"use client";

/*
  The practice quiz runner. All grading happens on the server — this
  component never sees a correct answer until the pupil has committed
  to theirs. Flow per question:

    answer (timer running, optional working shown)
      → confidence rating (timer stopped, answer locked)
        → reveal (marked result + full worked solution + misconception)
          → next

  A timeout skips confidence and reveals directly.
*/

import * as React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

type Confidence = "guess" | "fairly_sure" | "certain";

const CONFIDENCE_LABELS: Record<Confidence, string> = {
  guess: "A guess",
  fairly_sure: "Fairly sure",
  certain: "Certain",
};

interface ServedQuestion {
  questionId: string;
  skillId: string;
  skillName: string;
  resurfaced: boolean;
  prompt: string;
  timeLimitSeconds: number;
  options: Array<{ id: string; body: string }>;
}

interface AnswerResult {
  correct: boolean;
  answered: boolean;
  correctOptionId: string | null;
  workedSolution: string;
  misconception: { label: string; description: string } | null;
}

interface FinishedQuestion {
  question: ServedQuestion;
  result: AnswerResult;
  confidence: Confidence | null;
  responseMs: number;
}

type Phase =
  | { name: "intro" }
  | { name: "loading" }
  | { name: "error"; message: string }
  | { name: "question" }
  | { name: "confidence" }
  | { name: "reveal"; result: AnswerResult }
  | { name: "done" };

export function PracticeQuiz(props: {
  childId: string;
  childName: string;
  skillId: string;
  skillName: string;
  skillCode: string;
}) {
  const [phase, setPhase] = React.useState<Phase>({ name: "intro" });
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<ServedQuestion[]>([]);
  const [index, setIndex] = React.useState(0);
  const [secondsLeft, setSecondsLeft] = React.useState(0);
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
  const [confidence, setConfidence] = React.useState<Confidence | null>(null);
  const [working, setWorking] = React.useState("");
  const [responseMs, setResponseMs] = React.useState(0);
  const [finished, setFinished] = React.useState<FinishedQuestion[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  const current: ServedQuestion | undefined = questions[index];

  async function begin() {
    setPhase({ name: "loading" });
    const response = await fetch("/api/quiz/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: props.childId, skillId: props.skillId }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setPhase({
        name: "error",
        message:
          payload.error === "No questions available for this skill yet"
            ? "There are no questions in the bank for this skill yet. Please choose another skill for now."
            : "The quiz could not be started. Please try again in a moment.",
      });
      return;
    }
    const payload = (await response.json()) as {
      sessionId: string;
      questions: ServedQuestion[];
    };
    setSessionId(payload.sessionId);
    setQuestions(payload.questions);
    setIndex(0);
    setFinished([]);
    startQuestion(payload.questions[0]);
  }

  function startQuestion(question: ServedQuestion) {
    setSelectedOptionId(null);
    setConfidence(null);
    setWorking("");
    setResponseMs(0);
    setSecondsLeft(question.timeLimitSeconds);
    setPhase({ name: "question" });
  }

  const submitAnswer = React.useCallback(
    async (
      optionId: string | null,
      conf: Confidence | null,
      elapsedMs: number,
      workingText: string
    ) => {
      if (!sessionId || !current) return;
      setSubmitting(true);
      const response = await fetch("/api/quiz/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: current.questionId,
          optionId,
          confidence: conf,
          responseMs: elapsedMs,
          working: workingText || undefined,
        }),
      });
      setSubmitting(false);
      if (!response.ok) {
        setPhase({
          name: "error",
          message: "Your answer could not be saved. Please try the quiz again.",
        });
        return;
      }
      const result = (await response.json()) as AnswerResult;
      setFinished((prev) => [
        ...prev,
        { question: current, result, confidence: conf, responseMs: elapsedMs },
      ]);
      setPhase({ name: "reveal", result });
    },
    [sessionId, current]
  );

  // Countdown — only while the question is open.
  React.useEffect(() => {
    if (phase.name !== "question" || !current) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Time up: no answer, no confidence, straight to the marking.
          void submitAnswer(null, null, current.timeLimitSeconds * 1000, working);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // `working` is intentionally read at timeout-time via closure refresh
    // on each render cycle of this effect's dependencies.
  }, [phase.name, current, submitAnswer, working]);

  function chooseOption(optionId: string) {
    if (phase.name !== "question" || !current) return;
    setSelectedOptionId(optionId);
    setResponseMs((current.timeLimitSeconds - secondsLeft) * 1000);
    setPhase({ name: "confidence" });
  }

  async function next() {
    if (index + 1 < questions.length) {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      startQuestion(questions[nextIndex]);
      return;
    }
    if (sessionId) {
      void fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
    }
    setPhase({ name: "done" });
  }

  /* ————— screens ————— */

  if (phase.name === "intro") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <p className="inscription">
            {props.skillCode} · {props.childName}
          </p>
          <CardTitle className="text-2xl">{props.skillName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed text-ink/85">
          <ul className="space-y-2 text-muted-foreground">
            <li className="border-l-2 border-brass-soft/60 pl-3">
              A short quiz on this skill, sometimes with a question or two
              from topics due a revisit.
            </li>
            <li className="border-l-2 border-brass-soft/60 pl-3">
              Each question has its own timer. Before the marking you&rsquo;ll
              be asked how sure you were — answer honestly; it genuinely
              helps.
            </li>
            <li className="border-l-2 border-brass-soft/60 pl-3">
              After every question you&rsquo;ll see the full worked solution,
              not just the answer.
            </li>
          </ul>
          <div className="pt-2 text-center">
            <Button size="lg" onClick={() => void begin()}>
              Begin
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase.name === "loading") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          Preparing the quiz…
        </CardContent>
      </Card>
    );
  }

  if (phase.name === "error") {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="space-y-6 py-12 text-center">
          <p className="text-sm text-ink/85">{phase.message}</p>
          <Button asChild variant="outline">
            <Link href={`/portal/children/${props.childId}/practice`}>
              Choose another skill
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase.name === "done") {
    const correct = finished.filter((f) => f.result.correct).length;
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <p className="inscription">Quiz complete</p>
          <CardTitle className="text-2xl">
            {correct} of {finished.length} answered correctly
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            Every answer has been recorded in {props.childName}&rsquo;s
            history and folded into their mastery picture — the dashboard
            updates straight away.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href={`/portal/children/${props.childId}`}>
                See {props.childName}&rsquo;s progress
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/portal/children/${props.childId}/practice`}>
                <RotateCcw className="size-4" /> Practise another skill
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!current) return null;

  const isReveal = phase.name === "reveal";
  const revealResult = isReveal ? phase.result : null;
  const timerPercent = (secondsLeft / current.timeLimitSeconds) * 100;

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Question {index + 1} of {questions.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {current.skillName}
            {current.resurfaced ? " · back for a revisit" : ""}
          </p>
        </div>

        {phase.name === "question" ? (
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

        <CardTitle className="mt-4 text-xl leading-relaxed">{current.prompt}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-2.5" role="group" aria-label="Answer options">
          {current.options.map((option, i) => {
            const chosen = selectedOptionId === option.id;
            const isAnswer = revealResult?.correctOptionId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                disabled={phase.name !== "question"}
                onClick={() => chooseOption(option.id)}
                aria-pressed={chosen}
                className={cn(
                  "rounded-md border bg-white px-4 py-3 text-left text-sm transition-colors",
                  phase.name === "question" &&
                    "hover:border-mid-blue hover:bg-mist/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  chosen && !isReveal && "border-mid-blue bg-mist/50",
                  isReveal && isAnswer && "border-mid-blue bg-mist/60 font-medium",
                  isReveal && chosen && !isAnswer && "border-destructive/60 bg-destructive/5"
                )}
              >
                <span className="mr-2 font-serif text-brass">
                  {String.fromCharCode(65 + i)}.
                </span>
                {option.body}
                {isReveal && isAnswer ? (
                  <span className="ml-2 text-xs text-mid-blue">— correct answer</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {phase.name === "question" ? (
          <div className="space-y-2">
            <Label htmlFor="working" className="text-muted-foreground">
              Show your working{" "}
              <span className="font-normal">(optional — your tutor can see it)</span>
            </Label>
            <Textarea
              id="working"
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              rows={3}
              placeholder="Jot your method here if you'd like to…"
            />
          </div>
        ) : null}

        {phase.name === "confidence" ? (
          <fieldset className="rounded-md border bg-mist/30 p-4">
            <legend className="px-1 text-sm font-medium text-navy">
              Before we mark it — how sure were you?
            </legend>
            <RadioGroup
              className="mt-2 gap-2.5"
              value={confidence ?? undefined}
              onValueChange={(v) => setConfidence(v as Confidence)}
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
              disabled={confidence === null || submitting}
              onClick={() =>
                void submitAnswer(selectedOptionId, confidence, responseMs, working)
              }
            >
              {submitting ? "Marking…" : "Reveal the answer"}
            </Button>
          </fieldset>
        ) : null}

        {isReveal && revealResult ? (
          <div
            className={cn(
              "rounded-md border p-4",
              revealResult.correct
                ? "border-mid-blue/40 bg-mist/40"
                : "border-destructive/30 bg-destructive/5"
            )}
          >
            <p className="flex items-center gap-2 font-serif text-lg text-navy">
              {!revealResult.answered ? (
                <>
                  <Clock className="size-5 text-muted-foreground" /> Out of time
                </>
              ) : revealResult.correct ? (
                <>
                  <CheckCircle2 className="size-5 text-mid-blue" /> Correct
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" /> Not quite
                </>
              )}
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-brass uppercase">
                Worked solution
              </p>
              <p className="text-sm leading-relaxed text-ink/85">
                {revealResult.workedSolution}
              </p>
            </div>

            {revealResult.misconception ? (
              <div className="mt-3 rounded-sm bg-white/70 p-3">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  What this wrong answer usually means
                </p>
                <p className="mt-1 text-sm text-ink/85">
                  <span className="font-medium text-navy">
                    {revealResult.misconception.label}.
                  </span>{" "}
                  {revealResult.misconception.description}
                </p>
              </div>
            ) : null}

            <Button className="mt-4" onClick={() => void next()}>
              {index + 1 < questions.length ? (
                <>
                  Next question <ArrowRight className="size-4" />
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

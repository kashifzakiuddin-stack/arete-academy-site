import { NextResponse } from "next/server";
import { z } from "zod";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import {
  AccessDeniedError,
  requireChildAccess,
  requireUser,
} from "@/lib/practice/authz";
import { attemptScore, updateMastery } from "@/lib/practice/mastery";

const BodySchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  // null = the timer ran out before an answer was chosen
  optionId: z.string().uuid().nullable(),
  confidence: z.enum(["guess", "fairly_sure", "certain"]).nullable(),
  responseMs: z.number().int().min(0).max(30 * 60 * 1000),
  working: z.string().max(4000).optional(),
});

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    const userClient = await createSupabaseServerClient();
    await requireUser(userClient);

    // The session row is only visible through RLS if the caller is the
    // child's parent or an assigned tutor — this read IS the access check.
    const { data: session } = await userClient
      .from("quiz_sessions")
      .select("id, child_id, skill_id, completed_at")
      .eq("id", body.sessionId)
      .maybeSingle();
    if (!session) throw new AccessDeniedError();
    if (session.completed_at) {
      return NextResponse.json({ error: "Session already completed" }, { status: 409 });
    }
    await requireChildAccess(userClient, session.child_id);

    const service = createSupabaseServiceClient();

    const { data: question } = await service
      .from("questions")
      .select(
        "id, skill_id, worked_solution, question_options (id, is_correct, misconception_id)"
      )
      .eq("id", body.questionId)
      .maybeSingle();
    if (!question) {
      return NextResponse.json({ error: "Unknown question" }, { status: 404 });
    }

    // One answer per question per session — history is append-only and
    // a second submission must not double-count.
    const { data: existing } = await service
      .from("question_attempts")
      .select("id")
      .eq("session_id", body.sessionId)
      .eq("question_id", body.questionId)
      .limit(1);
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: "Question already answered" }, { status: 409 });
    }

    const options = question.question_options as Array<{
      id: string;
      is_correct: boolean;
      misconception_id: string | null;
    }>;
    const correctOption = options.find((o) => o.is_correct);
    const selectedOption = body.optionId
      ? options.find((o) => o.id === body.optionId)
      : null;
    if (body.optionId && !selectedOption) {
      return NextResponse.json({ error: "Option does not belong to question" }, { status: 400 });
    }

    const answered = selectedOption != null;
    const isCorrect = answered && selectedOption.is_correct;
    const misconceptionId = answered ? selectedOption.misconception_id : null;

    const { error: insertError } = await service.from("question_attempts").insert({
      session_id: body.sessionId,
      child_id: session.child_id,
      question_id: question.id,
      skill_id: question.skill_id,
      resurfaced: question.skill_id !== session.skill_id,
      selected_option_id: body.optionId,
      is_correct: isCorrect,
      misconception_id: misconceptionId,
      confidence: answered ? body.confidence : null,
      response_ms: body.responseMs,
      working: body.working?.trim() ? body.working.trim() : null,
    });
    if (insertError) {
      return NextResponse.json({ error: "Could not record attempt" }, { status: 500 });
    }

    // Fold the attempt into the rolling mastery estimate.
    const { data: masteryRow } = await service
      .from("skill_mastery")
      .select("mastery, attempts_count, correct_count")
      .eq("child_id", session.child_id)
      .eq("skill_id", question.skill_id)
      .maybeSingle();

    const score = attemptScore({
      answered,
      correct: isCorrect,
      confidence: answered ? body.confidence : null,
    });
    const updated = updateMastery(
      masteryRow
        ? { mastery: masteryRow.mastery, attemptsCount: masteryRow.attempts_count }
        : null,
      score
    );
    await service.from("skill_mastery").upsert({
      child_id: session.child_id,
      skill_id: question.skill_id,
      mastery: updated.mastery,
      attempts_count: updated.attemptsCount,
      correct_count: (masteryRow?.correct_count ?? 0) + (isCorrect ? 1 : 0),
      last_attempt_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Misconception feedback, when the chosen wrong answer carries a tag.
    let misconception: { label: string; description: string } | null = null;
    if (misconceptionId) {
      const { data: mc } = await service
        .from("misconceptions")
        .select("label, description")
        .eq("id", misconceptionId)
        .maybeSingle();
      if (mc) misconception = { label: mc.label, description: mc.description };
    }

    return NextResponse.json({
      correct: isCorrect,
      answered,
      correctOptionId: correctOption?.id ?? null,
      workedSolution: question.worked_solution,
      misconception,
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw error;
  }
}

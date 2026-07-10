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
import { effectiveMastery, targetDifficulty } from "@/lib/practice/mastery";
import { selectResurfacedSkills } from "@/lib/practice/resurfacing";
import {
  pickQuestions,
  QUESTIONS_FROM_CHOSEN_SKILL,
} from "@/lib/practice/question-picker";

const BodySchema = z.object({
  childId: z.string().uuid(),
  skillId: z.string().uuid(),
});

const RECENT_QUESTION_WINDOW_DAYS = 14;

interface ServedOption {
  id: string;
  body: string;
}

interface ServedQuestion {
  questionId: string;
  skillId: string;
  skillName: string;
  resurfaced: boolean;
  prompt: string;
  timeLimitSeconds: number;
  options: ServedOption[];
}

type QuestionRow = {
  id: string;
  skill_id: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  time_limit_seconds: number;
  question_options: Array<{ id: string; position: number; body: string }>;
};

export async function POST(request: Request) {
  try {
    const body = BodySchema.parse(await request.json());
    const userClient = await createSupabaseServerClient();
    await requireUser(userClient);
    // Ownership gate: resolves via the caller's own client, so RLS decides.
    await requireChildAccess(userClient, body.childId);

    const service = createSupabaseServiceClient();
    const now = new Date();

    const { data: chosenSkill } = await service
      .from("skills")
      .select("id, name, active")
      .eq("id", body.skillId)
      .maybeSingle();
    if (!chosenSkill || !chosenSkill.active) {
      return NextResponse.json({ error: "Unknown skill" }, { status: 404 });
    }

    // Mastery snapshots drive difficulty targeting and resurfacing.
    const { data: masteryRows } = await userClient
      .from("skill_mastery")
      .select("skill_id, mastery, attempts_count, last_attempt_at")
      .eq("child_id", body.childId);

    const snapshots = (masteryRows ?? []).map((row) => ({
      skillId: row.skill_id,
      mastery: row.mastery,
      lastAttemptAt: new Date(row.last_attempt_at),
      attemptsCount: row.attempts_count,
    }));

    const chosenSnapshot = snapshots.find((s) => s.skillId === body.skillId);
    const chosenEffective = chosenSnapshot
      ? effectiveMastery(chosenSnapshot.mastery, chosenSnapshot.lastAttemptAt, now)
      : 0.45; // sensible starting band for a first visit
    const target = targetDifficulty(chosenEffective);

    // Avoid re-serving questions seen in the last fortnight where possible.
    const since = new Date(now.getTime() - RECENT_QUESTION_WINDOW_DAYS * 86400000);
    const { data: recentAttempts } = await userClient
      .from("question_attempts")
      .select("question_id")
      .eq("child_id", body.childId)
      .gte("created_at", since.toISOString());
    const recentIds = new Set((recentAttempts ?? []).map((r) => r.question_id));

    async function questionPool(skillId: string): Promise<QuestionRow[]> {
      const { data } = await service
        .from("questions")
        .select(
          "id, skill_id, difficulty, prompt, time_limit_seconds, question_options (id, position, body)"
        )
        .eq("skill_id", skillId)
        .eq("active", true);
      return (data ?? []) as QuestionRow[];
    }

    const served: ServedQuestion[] = [];

    const chosenPool = await questionPool(body.skillId);
    for (const q of pickQuestions(chosenPool, target, QUESTIONS_FROM_CHOSEN_SKILL, recentIds)) {
      served.push(toServed(q, chosenSkill.name, false));
    }

    // Spaced resurfacing: fold in weak/stale skills automatically.
    const resurfacedSkillIds = selectResurfacedSkills(snapshots, body.skillId, now);
    if (resurfacedSkillIds.length > 0) {
      const { data: resurfacedSkills } = await service
        .from("skills")
        .select("id, name, active")
        .in("id", resurfacedSkillIds);
      for (const skill of resurfacedSkills ?? []) {
        if (!skill.active) continue;
        const snapshot = snapshots.find((s) => s.skillId === skill.id);
        const skillTarget = targetDifficulty(
          snapshot
            ? effectiveMastery(snapshot.mastery, snapshot.lastAttemptAt, now)
            : 0
        );
        const pool = await questionPool(skill.id);
        const [question] = pickQuestions(pool, skillTarget, 1, recentIds);
        if (question) served.push(toServed(question, skill.name, true));
      }
    }

    if (served.length === 0) {
      return NextResponse.json(
        { error: "No questions available for this skill yet" },
        { status: 409 }
      );
    }

    const { data: session, error: sessionError } = await service
      .from("quiz_sessions")
      .insert({ child_id: body.childId, skill_id: body.skillId })
      .select("id")
      .single();
    if (sessionError || !session) {
      return NextResponse.json({ error: "Could not start session" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id, questions: served });
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

function toServed(
  q: QuestionRow,
  skillName: string,
  resurfaced: boolean
): ServedQuestion {
  return {
    questionId: q.id,
    skillId: q.skill_id,
    skillName,
    resurfaced,
    prompt: q.prompt,
    timeLimitSeconds: q.time_limit_seconds,
    options: [...q.question_options]
      .sort((a, b) => a.position - b.position)
      // Only id and body leave the server — never is_correct or
      // misconception tags.
      .map((option) => ({ id: option.id, body: option.body })),
  };
}

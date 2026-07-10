import { NextResponse } from "next/server";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { getRole, requireUser, AccessDeniedError } from "@/lib/practice/authz";

/*
  Tutor-only CSV export of the full attempt history for their assigned
  pupils. All pupil-data reads use the tutor's OWN client, so RLS
  guarantees the export can never contain an unassigned family's data;
  the service client only joins in question text.
*/

function csvField(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(request: Request) {
  try {
    const userClient = await createSupabaseServerClient();
    const user = await requireUser(userClient);
    const role = await getRole(userClient, user.id);
    if (role !== "tutor") throw new AccessDeniedError();

    const url = new URL(request.url);
    const onlyChild = url.searchParams.get("child");

    // RLS scope: assigned pupils only.
    let childQuery = userClient.from("children").select("id, first_name, year_group");
    if (onlyChild) childQuery = childQuery.eq("id", onlyChild);
    const { data: children } = await childQuery;
    const childIds = (children ?? []).map((c) => c.id);
    if (childIds.length === 0) {
      return new NextResponse("No assigned pupils to export.\n", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const [{ data: attempts }, { data: skills }, { data: misconceptions }] =
      await Promise.all([
        userClient
          .from("question_attempts")
          .select(
            "child_id, session_id, question_id, skill_id, resurfaced, selected_option_id, is_correct, confidence, response_ms, working, misconception_id, created_at"
          )
          .in("child_id", childIds)
          .order("created_at", { ascending: true }),
        userClient.from("skills").select("id, code, name, category"),
        userClient.from("misconceptions").select("id, code, label"),
      ]);

    const service = createSupabaseServiceClient();
    const questionIds = [...new Set((attempts ?? []).map((a) => a.question_id))];
    const { data: questions } = questionIds.length
      ? await service.from("questions").select("id, prompt, difficulty").in("id", questionIds)
      : { data: [] as Array<{ id: string; prompt: string; difficulty: number }> };

    const childById = new Map((children ?? []).map((c) => [c.id, c]));
    const skillById = new Map((skills ?? []).map((s) => [s.id, s]));
    const misconceptionById = new Map((misconceptions ?? []).map((m) => [m.id, m]));
    const questionById = new Map((questions ?? []).map((q) => [q.id, q]));

    const header = [
      "pupil_first_name",
      "year_group",
      "attempted_at",
      "session_id",
      "skill_code",
      "skill_name",
      "skill_category",
      "question_difficulty",
      "question_prompt",
      "resurfaced",
      "answered",
      "correct",
      "confidence",
      "response_seconds",
      "misconception_code",
      "misconception_label",
      "working",
    ];

    const lines = [header.join(",")];
    for (const attempt of attempts ?? []) {
      const child = childById.get(attempt.child_id);
      const skill = skillById.get(attempt.skill_id);
      const question = questionById.get(attempt.question_id);
      const misconception = attempt.misconception_id
        ? misconceptionById.get(attempt.misconception_id)
        : null;
      lines.push(
        [
          csvField(child?.first_name),
          csvField(child?.year_group),
          csvField(attempt.created_at),
          csvField(attempt.session_id),
          csvField(skill?.code),
          csvField(skill?.name),
          csvField(skill?.category),
          csvField(question?.difficulty),
          csvField(question?.prompt),
          csvField(attempt.resurfaced),
          csvField(attempt.selected_option_id !== null),
          csvField(attempt.is_correct),
          csvField(attempt.confidence ?? ""),
          csvField(Math.round(attempt.response_ms / 100) / 10),
          csvField(misconception?.code ?? ""),
          csvField(misconception?.label ?? ""),
          csvField(attempt.working ?? ""),
        ].join(",")
      );
    }

    const filename = onlyChild
      ? `arete-pupil-export-${onlyChild.slice(0, 8)}.csv`
      : "arete-pupils-export.csv";

    return new NextResponse(lines.join("\r\n") + "\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    throw error;
  }
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";
import { loadChildDashboard } from "@/lib/practice/dashboard-data";
import { ChildDashboard } from "@/components/practice/child-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function TutorPupilPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "tutor") redirect("/portal");

  // RLS: returns data only if this tutor is assigned to this child.
  const data = await loadChildDashboard(supabase, childId);
  if (!data) notFound();

  // High-resolution attempt log. The caller's access was just proven via
  // RLS above; the service client is used only to join in content the
  // browser must not read directly (prompts, option text).
  const { data: attempts } = await supabase
    .from("question_attempts")
    .select(
      "id, question_id, skill_id, selected_option_id, is_correct, resurfaced, confidence, response_ms, working, misconception_id, created_at"
    )
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(100);

  const service = createSupabaseServiceClient();
  const questionIds = [...new Set((attempts ?? []).map((a) => a.question_id))];
  const optionIds = [
    ...new Set((attempts ?? []).flatMap((a) => (a.selected_option_id ? [a.selected_option_id] : []))),
  ];
  const [{ data: questions }, { data: options }, { data: misconceptions }, { data: skills }] =
    await Promise.all([
      questionIds.length
        ? service.from("questions").select("id, prompt").in("id", questionIds)
        : Promise.resolve({ data: [] as Array<{ id: string; prompt: string }> }),
      optionIds.length
        ? service.from("question_options").select("id, body").in("id", optionIds)
        : Promise.resolve({ data: [] as Array<{ id: string; body: string }> }),
      supabase.from("misconceptions").select("id, label"),
      supabase.from("skills").select("id, code"),
    ]);

  const promptById = new Map((questions ?? []).map((q) => [q.id, q.prompt]));
  const optionById = new Map((options ?? []).map((o) => [o.id, o.body]));
  const misconceptionById = new Map((misconceptions ?? []).map((m) => [m.id, m.label]));
  const skillCodeById = new Map((skills ?? []).map((s) => [s.id, s.code]));

  const CONFIDENCE_LABEL: Record<string, string> = {
    guess: "Guess",
    fairly_sure: "Fairly sure",
    certain: "Certain",
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inscription">Tutor view · pupil</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{data.child.firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.child.yearGroup || "Year group not set"} · {data.totalAttempts} questions answered
          </p>
        </div>
        <a
          href={`/api/tutor/export?child=${childId}`}
          className="text-sm font-medium text-mid-blue hover:text-brass"
        >
          Export this pupil (CSV) →
        </a>
      </header>

      <ChildDashboard data={data} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Attempt log</CardTitle>
          <CardDescription>
            The last {Math.min(100, (attempts ?? []).length)} answers in full —
            including confidence, timing, diagnosed misconceptions, and any
            written working.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead>
                <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                  <th scope="col" className="py-2 pr-3 font-medium">When</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Skill</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Question</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Answer given</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Result</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Confidence</th>
                  <th scope="col" className="py-2 pr-3 font-medium">Time</th>
                  <th scope="col" className="py-2 font-medium">Diagnosis / working</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {(attempts ?? []).map((attempt) => (
                  <tr key={attempt.id} className="border-b border-border/60">
                    <td className="py-2.5 pr-3 whitespace-nowrap text-muted-foreground">
                      {dateTimeFormat.format(new Date(attempt.created_at))}
                    </td>
                    <td className="py-2.5 pr-3 font-mono text-xs">
                      {skillCodeById.get(attempt.skill_id) ?? "—"}
                      {attempt.resurfaced ? " ↻" : ""}
                    </td>
                    <td className="max-w-[16rem] py-2.5 pr-3 text-xs leading-snug">
                      {promptById.get(attempt.question_id) ?? "—"}
                    </td>
                    <td className="py-2.5 pr-3 text-xs">
                      {attempt.selected_option_id
                        ? optionById.get(attempt.selected_option_id) ?? "—"
                        : "(out of time)"}
                    </td>
                    <td className="py-2.5 pr-3">
                      {attempt.is_correct ? (
                        <span className="text-mid-blue">Correct</span>
                      ) : (
                        <span className="text-destructive">Incorrect</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap">
                      {attempt.confidence ? CONFIDENCE_LABEL[attempt.confidence] : "—"}
                    </td>
                    <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">
                      {(attempt.response_ms / 1000).toFixed(0)}s
                    </td>
                    <td className="max-w-[18rem] py-2.5 text-xs leading-snug">
                      {attempt.misconception_id ? (
                        <span className="font-medium text-navy">
                          {misconceptionById.get(attempt.misconception_id)}
                        </span>
                      ) : null}
                      {attempt.working ? (
                        <span className="mt-0.5 block whitespace-pre-wrap text-muted-foreground">
                          “{attempt.working}”
                        </span>
                      ) : null}
                      {!attempt.misconception_id && !attempt.working ? "—" : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm">
        <Link href="/portal/tutor" className="font-medium text-mid-blue hover:text-brass">
          ← All pupils
        </Link>
      </p>
    </div>
  );
}

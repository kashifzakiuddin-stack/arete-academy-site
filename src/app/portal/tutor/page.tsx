import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function TutorHomePage() {
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

  // RLS scope for a tutor: exactly the children assigned to them.
  const { data: pupils } = await supabase
    .from("children")
    .select("id, first_name, year_group, created_at")
    .order("first_name");

  const pupilIds = (pupils ?? []).map((p) => p.id);
  const { data: masteryRows } = pupilIds.length
    ? await supabase
        .from("skill_mastery")
        .select("child_id, attempts_count, last_attempt_at")
        .in("child_id", pupilIds)
    : { data: [] as Array<{ child_id: string; attempts_count: number; last_attempt_at: string }> };

  const statsFor = (childId: string) => {
    const rows = (masteryRows ?? []).filter((m) => m.child_id === childId);
    const attempts = rows.reduce((sum, r) => sum + r.attempts_count, 0);
    const lastActive = rows.length
      ? new Date(Math.max(...rows.map((r) => new Date(r.last_attempt_at).getTime())))
      : null;
    return { attempts, lastActive };
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inscription">Tutor view</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">Your pupils</h1>
        </div>
        <Button asChild variant="outline">
          <a href="/api/tutor/export">Export all data (CSV)</a>
        </Button>
      </header>

      {pupils && pupils.length > 0 ? (
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="py-2 pr-3 font-medium">Pupil</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Year</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Questions answered</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Last active</th>
                    <th scope="col" className="py-2 font-medium"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {pupils.map((pupil) => {
                    const stats = statsFor(pupil.id);
                    return (
                      <tr key={pupil.id} className="border-b border-border/60">
                        <td className="py-2.5 pr-3 font-medium text-navy">{pupil.first_name}</td>
                        <td className="py-2.5 pr-3">{pupil.year_group || "—"}</td>
                        <td className="py-2.5 pr-3 tabular-nums">{stats.attempts}</td>
                        <td className="py-2.5 pr-3 whitespace-nowrap">
                          {stats.lastActive ? dateFormat.format(stats.lastActive) : "Never"}
                        </td>
                        <td className="py-2.5">
                          <Link
                            href={`/portal/tutor/pupils/${pupil.id}`}
                            className="font-medium text-mid-blue hover:text-brass"
                          >
                            Open →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">No pupils assigned yet</CardTitle>
            <CardDescription>
              Pupils appear here once assigned to you. For now, assignments
              are managed in the Supabase dashboard (SQL editor) — see
              README-PHASE2.md for the one-line query.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

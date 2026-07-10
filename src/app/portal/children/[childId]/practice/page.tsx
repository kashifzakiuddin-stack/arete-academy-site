import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  effectiveMastery,
  masteryBand,
  BAND_LABELS,
  type MasteryBand,
} from "@/lib/practice/mastery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BAND_CHIP: Record<MasteryBand, string> = {
  secure: "bg-navy text-white",
  strong: "bg-mid-blue text-white",
  developing: "bg-mist text-navy",
  fragile: "bg-destructive/10 text-destructive",
};

interface SkillListItem {
  id: string;
  code: string;
  name: string;
}

function SkillList({
  items,
  childId,
  bands,
}: {
  items: SkillListItem[];
  childId: string;
  bands: ReadonlyMap<string, MasteryBand>;
}) {
  return (
    <ul className="divide-y divide-border">
      {items.map((skill) => {
        const band = bands.get(skill.id) ?? null;
        return (
          <li key={skill.id}>
            <Link
              href={`/portal/children/${childId}/practice/${skill.id}`}
              className="flex items-center justify-between gap-4 px-1 py-3 transition-colors hover:bg-mist/30"
            >
              <span>
                <span className="mr-2 font-mono text-xs text-muted-foreground">
                  {skill.code}
                </span>
                <span className="text-sm font-medium text-navy">{skill.name}</span>
              </span>
              {band ? (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${BAND_CHIP[band]}`}
                >
                  {BAND_LABELS[band]}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Not started</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default async function PracticeSelectionPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const supabase = await createSupabaseServerClient();

  // RLS: returns the child only to their parent or an assigned tutor.
  const { data: child } = await supabase
    .from("children")
    .select("id, first_name")
    .eq("id", childId)
    .maybeSingle();
  if (!child) notFound();

  const [{ data: skills }, { data: masteryRows }] = await Promise.all([
    supabase
      .from("skills")
      .select("id, code, name, category, difficulty_band")
      .eq("subject_id", "maths")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("skill_mastery")
      .select("skill_id, mastery, last_attempt_at")
      .eq("child_id", childId),
  ]);

  const now = new Date();
  const bands = new Map(
    (masteryRows ?? []).map((row) => [
      row.skill_id,
      masteryBand(effectiveMastery(row.mastery, new Date(row.last_attempt_at), now)),
    ])
  );

  const essential = (skills ?? []).filter((s) => s.category === "essential");
  const extension = (skills ?? []).filter((s) => s.category === "extension");

  return (
    <div className="space-y-8">
      <header>
        <p className="inscription">Practice · {child.first_name}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Choose a skill</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Pick the skill to work on. Each quiz is short — a handful of
          questions on your chosen skill, plus one or two from topics that
          are due a quiet revisit. Nothing gets forgotten.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Essential Skills</CardTitle>
            <CardDescription>
              The core, high-frequency topics every paper leans on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillList items={essential} childId={childId} bands={bands} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Extension Skills</CardTitle>
            <CardDescription>
              The harder, less common topics that distinguish top performers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SkillList items={extension} childId={childId} bands={bands} />
          </CardContent>
        </Card>
      </div>

      <p className="text-sm">
        <Link
          href={`/portal/children/${childId}`}
          className="font-medium text-mid-blue hover:text-brass"
        >
          ← Back to {child.first_name}&rsquo;s progress
        </Link>
      </p>
    </div>
  );
}

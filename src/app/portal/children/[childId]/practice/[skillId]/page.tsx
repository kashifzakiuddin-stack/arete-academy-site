import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PracticeQuiz } from "@/components/practice/practice-quiz";

export default async function PracticeQuizPage({
  params,
}: {
  params: Promise<{ childId: string; skillId: string }>;
}) {
  const { childId, skillId } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: child }, { data: skill }] = await Promise.all([
    supabase
      .from("children")
      .select("id, first_name")
      .eq("id", childId)
      .maybeSingle(),
    supabase
      .from("skills")
      .select("id, name, code, category")
      .eq("id", skillId)
      .maybeSingle(),
  ]);
  if (!child || !skill) notFound();

  return (
    <PracticeQuiz
      childId={child.id}
      childName={child.first_name}
      skillId={skill.id}
      skillName={skill.name}
      skillCode={skill.code}
    />
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadChildDashboard } from "@/lib/practice/dashboard-data";
import { ChildDashboard } from "@/components/practice/child-dashboard";
import { Button } from "@/components/ui/button";

export default async function ChildProgressPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const supabase = await createSupabaseServerClient();

  // RLS answers the ownership question: no row, no page.
  const data = await loadChildDashboard(supabase, childId);
  if (!data) notFound();

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inscription">Progress</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{data.child.firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.child.yearGroup || "Year group not set"} · {data.totalAttempts}{" "}
            question{data.totalAttempts === 1 ? "" : "s"} answered so far
          </p>
        </div>
        <Button asChild>
          <Link href={`/portal/children/${childId}/practice`}>Practise now</Link>
        </Button>
      </header>

      <ChildDashboard data={data} />

      <p className="text-sm">
        <Link href="/portal" className="font-medium text-mid-blue hover:text-brass">
          ← All children
        </Link>
      </p>
    </div>
  );
}

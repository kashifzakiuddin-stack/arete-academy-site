import { buildNarrative } from "@/lib/practice/narrative";
import type { ChildDashboardData } from "@/lib/practice/dashboard-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MasteryHeatmap } from "./mastery-heatmap";
import { TrendSparkline } from "./trend-sparkline";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function ChildDashboard({
  data,
  now = new Date(),
}: {
  data: ChildDashboardData;
  now?: Date;
}) {
  const narrative = buildNarrative(
    data.child.firstName,
    data.skills
      .filter((s) => s.attemptsCount > 0)
      .map((s) => ({
        skillName: s.name,
        category: s.category,
        effective: s.effective ?? 0,
        attemptsCount: s.attemptsCount,
        daysSinceLastAttempt: s.lastAttemptAt
          ? Math.floor((now.getTime() - s.lastAttemptAt.getTime()) / 86400000)
          : 0,
      })),
    data.recentMisconceptions
  );

  const trending = data.skills.filter((s) => s.series.length >= 2);

  return (
    <div className="space-y-6">
      {/* Plain-English narrative — the brief insists on sentences, not visuals alone. */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">In plain English</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {narrative.map((sentence, i) => (
            <p key={i} className="text-sm leading-relaxed text-ink/85">
              {sentence}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Skill mastery at a glance</CardTitle>
          <CardDescription>
            Mastery fades without practice, so these cells reflect today —
            not the best day there has ever been.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MasteryHeatmap rows={data.skills} />
        </CardContent>
      </Card>

      {trending.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Trends over time</CardTitle>
            <CardDescription>
              The rolling mastery estimate after each attempt, per skill.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {trending.map((skill) => (
                <div key={skill.skillId}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-navy">{skill.name}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">
                      {Math.round((skill.effective ?? 0) * 100)}%
                    </p>
                  </div>
                  <TrendSparkline series={skill.series} name={skill.name} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {data.sessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[24rem] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                    <th scope="col" className="py-2 pr-3 font-medium">Date</th>
                    <th scope="col" className="py-2 pr-3 font-medium">Skill</th>
                    <th scope="col" className="py-2 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sessions.map((session) => (
                    <tr key={session.id} className="border-b border-border/60">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {dateFormat.format(session.startedAt)}
                      </td>
                      <td className="py-2 pr-3">{session.skillName}</td>
                      <td className="py-2 tabular-nums">
                        {session.correct} / {session.answered}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

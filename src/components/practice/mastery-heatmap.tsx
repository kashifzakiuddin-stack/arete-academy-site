import { BAND_LABELS, type MasteryBand } from "@/lib/practice/mastery";
import type { SkillDashboardRow } from "@/lib/practice/dashboard-data";

/*
  Skill-mastery heatmap. Sequential encoding: one blue hue, light → dark
  with rising mastery (brand ramp, lightness-monotonic). Every cell
  carries its band as TEXT, so colour is never the only signal, and
  "not started" is a neutral outline rather than a ramp step.
*/

const CELL_STYLE: Record<MasteryBand, string> = {
  fragile: "bg-[#D6E4F0] text-navy",
  developing: "bg-[#A9C6E2] text-navy",
  strong: "bg-mid-blue text-white",
  secure: "bg-navy text-white",
};

function HeatCell({ row }: { row: SkillDashboardRow }) {
  const label = row.band ? BAND_LABELS[row.band] : "Not started";
  const percent = row.effective === null ? null : Math.round(row.effective * 100);
  return (
    <div
      className={`rounded-md border border-border/70 p-3 ${
        row.band ? CELL_STYLE[row.band] : "bg-transparent text-muted-foreground"
      }`}
      role="figure"
      aria-label={`${row.name}: ${label}${percent !== null ? `, ${percent} per cent` : ""}`}
      title={`${row.name} — ${label}${percent !== null ? ` (${percent}%)` : ""}`}
    >
      <p className="text-xs font-medium leading-snug">{row.name}</p>
      <p className="mt-1.5 text-[11px] opacity-90">
        {label}
        {percent !== null ? ` · ${percent}%` : ""}
      </p>
    </div>
  );
}

export function MasteryHeatmap({ rows }: { rows: SkillDashboardRow[] }) {
  const essential = rows.filter((r) => r.category === "essential");
  const extension = rows.filter((r) => r.category === "extension");

  return (
    <div className="space-y-6">
      {[
        { title: "Essential Skills", items: essential },
        { title: "Extension Skills", items: extension },
      ].map((group) =>
        group.items.length > 0 ? (
          <div key={group.title}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {group.items.map((row) => (
                <HeatCell key={row.skillId} row={row} />
              ))}
            </div>
          </div>
        ) : null
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        <span className="font-medium">Key:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border/70 bg-[#D6E4F0]" /> Fragile
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border/70 bg-[#A9C6E2]" /> Developing
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-mid-blue" /> Strong
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-navy" /> Secure
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-border" /> Not started
        </span>
      </div>
    </div>
  );
}

/*
  Per-skill mastery trend: a small single-series SVG line (2px, brand
  mid-blue) over the attempt history, dot on the latest point with its
  value labelled in ink — selective direct labelling, no legend needed
  for a single named series. Native <title> gives per-chart hover.
*/

const WIDTH = 220;
const HEIGHT = 48;
const PAD = 6;

export function TrendSparkline({
  series,
  name,
}: {
  series: Array<{ at: Date; mastery: number }>;
  name: string;
}) {
  if (series.length < 2) return null;

  const first = series[0].at.getTime();
  const last = series[series.length - 1].at.getTime();
  const span = Math.max(1, last - first);

  const x = (t: number) => PAD + ((t - first) / span) * (WIDTH - PAD * 2);
  const y = (m: number) => HEIGHT - PAD - m * (HEIGHT - PAD * 2);

  const points = series
    .map((p) => `${x(p.at.getTime()).toFixed(1)},${y(p.mastery).toFixed(1)}`)
    .join(" ");
  const latest = series[series.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-12 w-full max-w-[220px]"
      role="img"
      aria-label={`${name}: mastery trend across ${series.length} attempts, currently ${Math.round(latest.mastery * 100)} per cent`}
    >
      <title>
        {name} — {series.length} attempts, now {Math.round(latest.mastery * 100)}%
      </title>
      {/* baseline, recessive */}
      <line
        x1={PAD}
        x2={WIDTH - PAD}
        y1={HEIGHT - PAD}
        y2={HEIGHT - PAD}
        stroke="var(--border)"
        strokeWidth="1"
      />
      <polyline
        points={points}
        fill="none"
        stroke="var(--mid-blue)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={x(latest.at.getTime())}
        cy={y(latest.mastery)}
        r="3.5"
        fill="var(--mid-blue)"
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

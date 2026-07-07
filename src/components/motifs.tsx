import { cn } from "@/lib/utils";

/*
  Brand motifs per the brief (Section 2): laurel wreath mark and Greek key
  (meander) divider, used lightly as accents — never as wallpaper.
  Pure line-art SVG; no external images.
*/

const LEAF_PATH = "M0 0 Q3.8 -5.3 0 -13 Q-3.8 -5.3 0 0";

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export function LaurelMark({ className }: { className?: string }) {
  const cx = 32;
  const cy = 32;
  const r = 20;

  // Two branches tied at the bottom, tips open at the top; leaves sit
  // tangent to the stem with a slight outward tilt.
  const leftLeaves = [100, 120, 140, 160, 180, 200, 220].map((deg) => ({
    ...polar(cx, cy, r, deg),
    rot: deg + 150,
  }));
  const rightLeaves = leftLeaves.map((leaf) => ({
    x: 2 * cx - leaf.x,
    y: leaf.y,
    rot: 360 - leaf.rot,
  }));

  const stemStart = polar(cx, cy, r, 95);
  const stemEnd = polar(cx, cy, r, 235);

  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className={cn("size-10", className)}
      fill="none"
    >
      <path
        d={`M${stemStart.x.toFixed(2)} ${stemStart.y.toFixed(2)} A${r} ${r} 0 0 1 ${stemEnd.x.toFixed(2)} ${stemEnd.y.toFixed(2)}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M${(2 * cx - stemStart.x).toFixed(2)} ${stemStart.y.toFixed(2)} A${r} ${r} 0 0 0 ${(2 * cx - stemEnd.x).toFixed(2)} ${stemEnd.y.toFixed(2)}`}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[...leftLeaves, ...rightLeaves].map((leaf, i) => (
        <path
          key={i}
          d={LEAF_PATH}
          fill="currentColor"
          transform={`translate(${leaf.x.toFixed(2)} ${leaf.y.toFixed(2)}) rotate(${leaf.rot.toFixed(1)})`}
        />
      ))}
    </svg>
  );
}

export function GreekKeyDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center justify-center gap-4 text-brass-soft", className)}
    >
      <span className="h-px w-16 bg-current sm:w-24" />
      <svg viewBox="0 0 90 18" className="h-[18px] w-[90px]" fill="none">
        {[0, 18, 36, 54, 72].map((x) => (
          <path
            key={x}
            d={`M${x + 1} 17 V1 h16 v10 h-10 V7 h6`}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <span className="h-px w-16 bg-current sm:w-24" />
    </div>
  );
}

export function ColumnMark({ className }: { className?: string }) {
  // Restrained column line drawing for empty-image slots.
  return (
    <svg
      viewBox="0 0 48 64"
      aria-hidden="true"
      className={cn("size-12", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M6 6 H42 M10 12 H38" />
      <path d="M16 12 V52 M24 12 V52 M32 12 V52" />
      <path d="M10 52 H38 M6 58 H42" />
    </svg>
  );
}

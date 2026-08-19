import React from "react";

// Polar helper: point on a circle of radius r centered at (cx, cy) for angle
// in degrees, measured from the 9 o'clock position sweeping clockwise.
function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarPoint(cx, cy, r, startAngle);
  const end = polarPoint(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const ZONES = [
  { from: 0, to: 40, color: "#34D399" },
  { from: 40, to: 70, color: "#FBBF24" },
  { from: 70, to: 100, color: "#F87171" },
];

export default function RiskGauge({ probabilityPct, riskLevel, animate }) {
  const cx = 120;
  const cy = 118;
  const r = 92;
  const needleAngle = (Math.min(100, Math.max(0, probabilityPct)) / 100) * 180;

  const tip = polarPoint(cx, cy, r - 22, needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 240 150" className="w-full max-w-[280px]">
        {/* track */}
        <path
          d={arcPath(cx, cy, r, 0, 180)}
          fill="none"
          stroke="#242A35"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {ZONES.map((z) => (
          <path
            key={z.from}
            d={arcPath(cx, cy, r, z.from * 1.8, z.to * 1.8)}
            fill="none"
            stroke={z.color}
            strokeWidth="14"
            strokeLinecap="butt"
            opacity="0.9"
          />
        ))}
        {/* tick marks every 10% */}
        {Array.from({ length: 11 }).map((_, i) => {
          const a = i * 18;
          const outer = polarPoint(cx, cy, r + 12, a);
          const inner = polarPoint(cx, cy, r + 4, a);
          return (
            <line
              key={i}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke="#3A4152"
              strokeWidth="1.5"
            />
          );
        })}
        {/* needle */}
        <g
          style={{
            transition: animate ? "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={tip.x}
            y2={tip.y}
            stroke="#EAEDF2"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6.5" fill="#EAEDF2" />
          <circle cx={cx} cy={cy} r="3" fill="#0E1116" />
        </g>
      </svg>

      <div className="-mt-2 text-center">
        <div className="font-mono text-5xl font-bold tracking-tight text-ink2-primary tabular-nums">
          {probabilityPct.toFixed(1)}
          <span className="text-2xl text-ink2-muted">%</span>
        </div>
        <div className="mt-1 font-body text-xs uppercase tracking-[0.2em] text-ink2-faint">
          Churn probability
        </div>
      </div>
    </div>
  );
}

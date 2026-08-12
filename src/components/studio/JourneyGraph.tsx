import { useMemo, useState } from "react";
import { activity, activityLabels } from "./data";

const ranges = ["7D", "30D", "3M", "1Y", "ALL"] as const;

export function JourneyGraph() {
  const [range, setRange] = useState<(typeof ranges)[number]>("1Y");
  const data = activity[range] ?? [];

  const { area, line, points } = useMemo(() => {
    const w = 1000;
    const h = 260;
    const max = Math.max(...data) * 1.15;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => [i * step, h - (v / max) * h] as const);

    const curve = pts
      .map((p, i) => {
        if (i === 0) return `M ${p[0]} ${p[1]}`;
        const prev = pts[i - 1]!;
        const cx = (prev[0] + p[0]) / 2;
        return `C ${cx} ${prev[1]} ${cx} ${p[1]} ${p[0]} ${p[1]}`;
      })
      .join(" ");

    return { line: curve, area: `${curve} L ${w} ${h} L 0 ${h} Z`, points: pts };
  }, [data]);

  return (
    <section className="glass rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Progress timeline</p>
          <h2 className="display-title mt-2 text-3xl md:text-4xl">Your journey</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-3 py-1.5 text-xs tracking-wide transition-colors duration-300 ${
                range === r
                  ? "bg-accent-soft text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <svg viewBox="0 0 1000 260" preserveAspectRatio="none" className="h-56 w-full md:h-64">
          <defs>
            <linearGradient id="journeyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1="0"
              x2="1000"
              y1={(260 / 3) * i}
              y2={(260 / 3) * i}
              stroke="currentColor"
              className="text-border"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="url(#journeyFill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="6"
              fill="var(--accent)"
              className="opacity-0 transition-opacity duration-300 hover:opacity-100"
            />
          ))}
        </svg>

        <div className="mt-4 flex justify-between text-[0.68rem] tracking-widest text-muted-foreground uppercase">
          {(activityLabels[range] ?? []).map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

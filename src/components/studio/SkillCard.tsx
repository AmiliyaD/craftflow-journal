import { formatHours, type SkillStat } from "@/lib/sessions";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 24 - ((v - min) / span) * 22;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 26" preserveAspectRatio="none" className="h-6 w-20">
      <path
        d={d}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        className="opacity-70"
      />
    </svg>
  );
}

export function SkillCard({ skill }: { skill: SkillStat }) {
  const time = formatHours(skill.totalMs);
  const hasData = skill.totalMs > 0;

  return (
    <div className="glass card-hover group rounded-2xl p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm tracking-tight">{skill.name}</h3>
        <span className="display-title text-2xl tabular-nums">{time.label}</span>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${Math.min(skill.share, 100)}%` }}
        />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <p className="text-xs text-muted-foreground">
          {hasData
            ? `${skill.sessions} session${skill.sessions === 1 ? "" : "s"} · ${skill.share}% of practice`
            : "No practice yet"}
        </p>
        {hasData && <Sparkline values={skill.spark} />}
      </div>
    </div>
  );
}

import type { Skill } from "./data";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * 100;
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

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="glass card-hover group rounded-2xl p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm tracking-tight">{skill.name}</h3>
        <span className="display-title text-2xl">{skill.value}%</span>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
          style={{ width: `${skill.value}%` }}
        />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span
          className={`text-xs ${skill.change >= 0 ? "text-success" : "text-muted-foreground"}`}
        >
          {skill.change >= 0 ? "+" : ""}
          {skill.change}% this month
        </span>
        <Sparkline values={skill.spark} />
      </div>
    </div>
  );
}

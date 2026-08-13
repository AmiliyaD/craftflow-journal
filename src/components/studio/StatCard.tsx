import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  unit,
  change,
  icon: Icon,
  positive = true,
}: {
  label: string;
  value: string;
  unit?: string;
  change?: string;
  icon: LucideIcon;
  positive?: boolean;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{label}</p>
        <Icon size={16} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <p className="display-title mt-6 text-4xl">
        {value}
        {unit ? <span className="ml-1 text-lg text-muted-foreground">{unit}</span> : null}
      </p>
      {change ? (
        <div
          className={`mt-3 inline-flex items-center gap-1 text-xs ${
            positive ? "text-success" : "text-muted-foreground"
          }`}
        >
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          <span>{change}</span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      ) : null}
    </div>
  );
}

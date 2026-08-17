import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass motion-surface flex flex-col items-center rounded-2xl px-8 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border-strong bg-secondary/50">
        <Icon size={18} strokeWidth={1.4} className="text-accent" />
      </span>
      <p className="display-title mt-5 text-2xl">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

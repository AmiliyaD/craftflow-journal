import { Pause, Play, Square, Trash2 } from "lucide-react";
import { formatDuration, type ActiveSession } from "@/lib/sessions";

export function CurrentSessionCard({
  active,
  elapsedMs,
  isRunning,
  onPause,
  onResume,
  onFinish,
  onDiscard,
}: {
  active: ActiveSession;
  elapsedMs: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onDiscard: () => void;
}) {
  return (
    <section className="glass relative overflow-hidden rounded-3xl border-accent/25 p-6 md:p-8">
      <div className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Current session</p>
          <p className="display-title mt-3 text-5xl tabular-nums md:text-6xl">
            {formatDuration(elapsedMs)}
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isRunning ? "animate-pulse bg-accent" : "bg-muted-foreground"
              }`}
            />
            {isRunning ? "Drawing now" : "Paused"}
          </p>
          {active.skills.length > 0 && (
            <p className="mt-2 text-xs tracking-wide text-foreground/80">
              {active.skills.join(" · ")}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRunning ? (
            <button
              onClick={onPause}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:border-border-strong"
            >
              <Pause size={14} /> Pause
            </button>
          ) : (
            <button
              onClick={onResume}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:border-border-strong"
            >
              <Play size={14} /> Resume
            </button>
          )}
          <button
            onClick={onFinish}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Square size={13} /> Finish session
          </button>
          <button
            onClick={onDiscard}
            title="Discard this session"
            className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

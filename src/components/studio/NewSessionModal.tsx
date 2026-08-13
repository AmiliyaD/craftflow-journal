import { useState } from "react";
import { Play } from "lucide-react";
import { FOCUS_AREAS, formatDuration } from "@/lib/sessions";
import { ModalShell } from "./ModalShell";

export function NewSessionModal({
  open,
  onClose,
  onStart,
}: {
  open: boolean;
  onClose: () => void;
  onStart: (skills: string[]) => void;
}) {
  const [skills, setSkills] = useState<string[]>([]);

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const start = () => {
    onStart(skills);
    setSkills([]);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Track your practice"
      title="New drawing session"
      label="New drawing session"
    >
      <div className="mt-7">
        <p className="eyebrow">Activity / focus</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FOCUS_AREAS.map((f) => {
            const on = skills.includes(f);
            return (
              <button
                key={f}
                onClick={() => toggleSkill(f)}
                className={`rounded-full border px-3.5 py-1.5 text-xs tracking-wide transition-all duration-300 ${
                  on
                    ? "border-accent/40 bg-accent-soft text-accent"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-border p-6 text-center">
        <p className="eyebrow">Drawing timer</p>
        <p className="display-title mt-3 text-5xl tabular-nums">{formatDuration(0)}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          The timer keeps running while you browse other pages.
        </p>
      </div>

      <div className="mt-7 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={start}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
        >
          <Play size={14} /> Start session
        </button>
      </div>
    </ModalShell>
  );
}

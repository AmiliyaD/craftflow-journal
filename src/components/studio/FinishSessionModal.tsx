import { useState } from "react";
import { MOODS, formatDuration, type Mood } from "@/lib/sessions";
import { ModalShell } from "./ModalShell";

export function FinishSessionModal({
  open,
  onClose,
  durationMs,
  skills,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  durationMs: number;
  skills: string[];
  onSave: (mood: Mood | null, notes: string) => void;
}) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");

  const save = () => {
    onSave(mood, notes);
    setMood(null);
    setNotes("");
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      eyebrow="Nice work"
      title="Session complete"
      label="Session complete"
    >
      <div className="mt-7 rounded-2xl border border-border p-6 text-center">
        <p className="eyebrow">Total drawing time</p>
        <p className="display-title mt-3 text-5xl tabular-nums">{formatDuration(durationMs)}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {skills.length > 0 ? skills.join(" · ") : "No practice area selected"}
        </p>
      </div>

      <div className="mt-7">
        <p className="eyebrow">Mood</p>
        <div className="mt-3 flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.key}
              title={m.label}
              onClick={() => setMood(mood === m.key ? null : m.key)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-lg transition-all duration-300 ${
                mood === m.key
                  ? "border-accent/40 bg-accent-soft scale-105"
                  : "border-border hover:border-border-strong"
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <p className="eyebrow">What did you learn today?</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Notes, mistakes, breakthroughs…"
          className="mt-3 w-full resize-none rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-border-strong"
        />
      </div>

      <div className="mt-7 flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Keep drawing
        </button>
        <button
          onClick={save}
          className="rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
        >
          Save session
        </button>
      </div>
    </ModalShell>
  );
}

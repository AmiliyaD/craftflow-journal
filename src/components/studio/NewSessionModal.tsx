import { useEffect, useRef, useState } from "react";
import { Pause, Play, Square, X } from "lucide-react";
import {
  FOCUS_AREAS,
  MOODS,
  createSession,
  formatDuration,
  type Mood,
  type Session,
} from "@/lib/sessions";

type Phase = "idle" | "running" | "paused" | "finished";

export function NewSessionModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (session: Session) => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const startedAt = useRef<Date | null>(null);
  const tickBase = useRef<{ at: number; acc: number }>({ at: 0, acc: 0 });

  useEffect(() => {
    if (phase !== "running") return;
    const id = window.setInterval(() => {
      setElapsed(tickBase.current.acc + (Date.now() - tickBase.current.at));
    }, 200);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const reset = () => {
    setPhase("idle");
    setElapsed(0);
    setSkills([]);
    setMood(null);
    setNotes("");
    startedAt.current = null;
    tickBase.current = { at: 0, acc: 0 };
  };

  const start = () => {
    startedAt.current = new Date();
    tickBase.current = { at: Date.now(), acc: 0 };
    setPhase("running");
  };
  const pause = () => {
    tickBase.current = { at: 0, acc: tickBase.current.acc + (Date.now() - tickBase.current.at) };
    setElapsed(tickBase.current.acc);
    setPhase("paused");
  };
  const resume = () => {
    tickBase.current = { at: Date.now(), acc: tickBase.current.acc };
    setPhase("running");
  };
  const finish = () => {
    if (phase === "running") pause();
    setPhase("finished");
  };

  const save = () => {
    const durationMs =
      phase === "running" ? tickBase.current.acc + (Date.now() - tickBase.current.at) : elapsed;
    if (durationMs < 1000) return;
    const started = startedAt.current ?? new Date(Date.now() - durationMs);
    onSave(
      createSession({
        startedAt: started.toISOString(),
        endedAt: new Date(started.getTime() + durationMs).toISOString(),
        durationMs,
        skills,
        mood,
        notes: notes.trim(),
      })
    );
    reset();
    onClose();
  };

  const toggleSkill = (s: string) =>
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const canSave = elapsed >= 1000 || phase === "running";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10 md:items-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New drawing session"
        className="glass animate-in fade-in zoom-in-95 relative w-full max-w-xl rounded-3xl p-7 duration-300 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Track your practice</p>
            <h2 className="display-title mt-2 text-3xl">New drawing session</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <X size={15} />
          </button>
        </div>

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
          <p className="display-title mt-3 text-5xl tabular-nums">{formatDuration(elapsed)}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {phase === "idle" && (
              <button
                onClick={start}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Play size={14} /> Start session
              </button>
            )}
            {phase === "running" && (
              <button
                onClick={pause}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:border-border-strong"
              >
                <Pause size={14} /> Pause
              </button>
            )}
            {phase === "paused" && (
              <button
                onClick={resume}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Play size={14} /> Resume
              </button>
            )}
            {(phase === "running" || phase === "paused") && (
              <button
                onClick={finish}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                <Square size={13} /> Finish
              </button>
            )}
            {phase === "finished" && (
              <p className="text-xs text-muted-foreground">
                Session stopped · review and save below
              </p>
            )}
          </div>
        </div>

        <div className="mt-7">
          <p className="eyebrow">How did it go?</p>
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
          <p className="eyebrow">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="What did you learn today?"
            className="mt-3 w-full resize-none rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-border-strong"
          />
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!canSave}
            className="rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Finish &amp; save session
          </button>
        </div>
      </div>
    </div>
  );
}

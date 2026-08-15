import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { MOODS, formatDuration, type Mood } from "@/lib/sessions";
import { ModalShell } from "./ModalShell";

/**
 * Two-step completion flow: capture mood/notes, then optionally offer to save
 * an artwork result produced during the session.
 */
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
  /** `withArtwork` requests the artwork form after the session is stored. */
  onSave: (mood: Mood | null, notes: string, withArtwork: boolean) => void;
}) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"details" | "artwork">("details");

  useEffect(() => {
    if (!open) return;
    setMood(null);
    setNotes("");
    setStep("details");
  }, [open]);

  const finish = (withArtwork: boolean) => onSave(mood, notes, withArtwork);

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

      {step === "details" ? (
        <>
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
              onClick={() => setStep("artwork")}
              className="rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
            >
              Save session
            </button>
          </div>
        </>
      ) : (
        <div className="mt-7">
          <p className="text-sm">Did you create an artwork during this session?</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Optional — you can always add it later from the Artwork page.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={() => finish(false)}
              className="rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              Nothing to add
            </button>
            <button
              onClick={() => finish(true)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
            >
              <ImagePlus size={15} /> Add artwork result
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

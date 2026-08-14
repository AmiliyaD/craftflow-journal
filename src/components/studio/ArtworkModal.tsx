import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { Field, GhostButton, PrimaryButton, TagPicker, inputClass } from "./form";
import { ARTWORK_TOPICS, type Artwork, type ArtworkInput } from "@/lib/artworks";
import { useImageUrl } from "@/lib/image-store";
import { MOODS, type Mood } from "@/lib/sessions";

const ACCEPT = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export type ArtworkPrefill = {
  topics?: string[];
  durationMs?: number;
  date?: string;
  mood?: Mood | null;
  notes?: string;
  sourceSessionId?: string | null;
};

function todayInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ArtworkModal({
  open,
  onClose,
  initial,
  prefill,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Artwork | null;
  prefill?: ArtworkPrefill;
  onSubmit: (input: ArtworkInput) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [date, setDate] = useState(todayInput());
  const [mood, setMood] = useState<Mood | null>(null);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const existingUrl = useImageUrl(initial?.imageId ?? null);

  useEffect(() => {
    if (!open) return;
    const ms = initial?.durationMs ?? prefill?.durationMs ?? 0;
    const total = Math.round(ms / 60000);
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setTopics(initial?.topics ?? prefill?.topics ?? []);
    setHours(String(Math.floor(total / 60)));
    setMinutes(String(total % 60));
    setDate(initial?.date ?? prefill?.date ?? todayInput());
    setMood(initial?.mood ?? prefill?.mood ?? null);
    setNotes(initial?.notes ?? prefill?.notes ?? "");
    setFile(null);
    setSaving(false);
  }, [open, initial, prefill]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const accept = (f: File | undefined | null) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) return;
    setFile(f);
  };

  const shown = previewUrl ?? existingUrl;

  const save = async () => {
    setSaving(true);
    const durationMs =
      (Math.max(0, Number(hours) || 0) * 60 + Math.max(0, Number(minutes) || 0)) * 60000;
    await onSubmit({
      title,
      description,
      date,
      durationMs,
      topics,
      mood,
      notes,
      file,
      sourceSessionId: initial?.sourceSessionId ?? prefill?.sourceSessionId ?? null,
    });
    setSaving(false);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      size="lg"
      eyebrow={initial ? "Edit" : "New piece"}
      title={initial ? "Edit artwork" : "Add artwork"}
      label={initial ? "Edit artwork" : "Add artwork"}
    >
      <div className="mt-7 grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              accept(e.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex aspect-[4/5] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors ${
              dragging ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong"
            }`}
          >
            {shown ? (
              <img src={shown} alt="Artwork preview" className="h-full w-full object-cover" />
            ) : (
              <div className="px-6 text-center">
                <ImagePlus size={22} strokeWidth={1.4} className="mx-auto text-accent" />
                <p className="mt-3 text-sm">Drop an image here</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG or WEBP</p>
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT.join(",")}
            className="hidden"
            onChange={(e) => accept(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Upload size={13} /> {shown ? "Replace image" : "Choose file"}
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Portrait study #24"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="What were you exploring?"
            />
          </Field>
          <Field label="Practice topics">
            <TagPicker options={ARTWORK_TOPICS} value={topics} onChange={setTopics} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Drawing time">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={inputClass}
                />
                <span className="text-xs text-muted-foreground">h</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className={inputClass}
                />
                <span className="text-xs text-muted-foreground">m</span>
              </div>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Mood">
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  title={m.label}
                  onClick={() => setMood(mood === m.key ? null : m.key)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-base transition-all duration-300 ${
                    mood === m.key
                      ? "scale-105 border-accent/40 bg-accent-soft"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Mistakes, breakthroughs…"
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <GhostButton onClick={onClose}>Cancel</GhostButton>
        <PrimaryButton onClick={save} disabled={saving}>
          {initial ? "Save changes" : "Save artwork"}
        </PrimaryButton>
      </div>
    </ModalShell>
  );
}

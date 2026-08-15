import { Clock, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { ModalShell } from "./ModalShell";
import { formatArtworkTime, type Artwork } from "@/lib/artworks";
import { formatDay } from "@/lib/challenges";
import { useImageUrl } from "@/lib/image-store";
import { MOODS } from "@/lib/sessions";

export function ArtworkDetailModal({
  artwork,
  onClose,
  onEdit,
  onDelete,
}: {
  artwork: Artwork | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const url = useImageUrl(artwork?.imageId ?? null);
  const mood = MOODS.find((m) => m.key === artwork?.mood);

  return (
    <ModalShell
      open={Boolean(artwork)}
      onClose={onClose}
      size="lg"
      eyebrow={artwork ? formatDay(artwork.date) : ""}
      title={artwork?.title ?? ""}
      label="Artwork detail"
    >
      {artwork && (
        <div className="mt-7 grid gap-7 md:grid-cols-[minmax(0,340px)_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border">
            {url ? (
              <img src={url} alt={artwork.title} className="w-full object-cover" />
            ) : (
              <span className="flex aspect-[4/5] items-center justify-center bg-secondary/40">
                <ImageIcon size={22} strokeWidth={1.3} className="text-muted-foreground" />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock size={14} strokeWidth={1.6} className="text-accent" />
                {formatArtworkTime(artwork.durationMs)}
              </span>
              {mood && (
                <span className="text-muted-foreground">
                  <span className="mr-1.5 text-base">{mood.emoji}</span>
                  {mood.label}
                </span>
              )}
              {artwork.sourceSessionId && (
                <span className="rounded-full border border-border px-2.5 py-1 text-[0.68rem] tracking-wide text-muted-foreground">
                  From a session
                </span>
              )}
            </div>

            {artwork.topics.length > 0 && (
              <div>
                <p className="eyebrow">Topics</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {artwork.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {artwork.description && (
              <div>
                <p className="eyebrow">Description</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {artwork.description}
                </p>
              </div>
            )}

            {artwork.notes && (
              <div>
                <p className="eyebrow">Notes</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;{artwork.notes}&rdquo;
                </p>
              </div>
            )}

            <div className="mt-auto flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

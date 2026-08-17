import { Clock, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { formatArtworkTime, type Artwork } from "@/lib/artworks";
import { formatDay } from "@/lib/challenges";
import { useImageUrl } from "@/lib/image-store";

export function ArtworkCard({
  art,
  index = 0,
  onOpen,
  onEdit,
  onDelete,
}: {
  art: Artwork;
  index?: number;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const url = useImageUrl(art.imageId);

  return (
    <figure className="group motion-item" style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}>
      <div className="relative overflow-hidden rounded-2xl border border-border transition-[border-color,box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-border-strong group-hover:shadow-[var(--shadow-lift)]">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${art.title}`}
          className="block w-full cursor-pointer transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.995]"
        >
          {url ? (
            <img
              src={url}
              alt={art.title}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex aspect-[4/5] w-full items-center justify-center bg-secondary/40">
              <ImageIcon size={22} strokeWidth={1.3} className="text-muted-foreground" />
            </span>
          )}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background/60 px-2.5 py-1 text-[0.68rem] tracking-wide backdrop-blur-md">
            <Clock size={11} strokeWidth={1.6} className="text-accent" />
            {formatArtworkTime(art.durationMs)}
          </span>
        </button>

        {(onEdit || onDelete) && (
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit ${art.title}`}
                className="press-sm rounded-full border border-border-strong bg-background/70 p-2 text-muted-foreground backdrop-blur-md hover:text-foreground"
              >
                <Pencil size={13} strokeWidth={1.6} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete ${art.title}`}
                className="press-sm rounded-full border border-border-strong bg-background/70 p-2 text-muted-foreground backdrop-blur-md hover:text-destructive"
              >
                <Trash2 size={13} strokeWidth={1.6} />
              </button>
            )}
          </div>
        )}
      </div>

      <figcaption className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-sm tracking-tight">{art.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{formatDay(art.date)}</span>
        </div>
        {art.topics.length > 0 && (
          <p className="mt-1.5 truncate text-xs text-muted-foreground">{art.topics.join(" · ")}</p>
        )}
      </figcaption>
    </figure>
  );
}

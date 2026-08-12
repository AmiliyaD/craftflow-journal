import { Clock } from "lucide-react";
import type { Artwork } from "./data";

export function ArtworkCard({ art }: { art: Artwork }) {
  return (
    <figure className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-2xl border border-border transition-colors duration-500 group-hover:border-border-strong">
        <img
          src={art.image}
          alt={art.title}
          loading="lazy"
          width={900}
          height={1100}
          className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-70" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background/60 px-2.5 py-1 text-[0.68rem] tracking-wide backdrop-blur-md">
          <Clock size={11} strokeWidth={1.6} className="text-accent" />
          {art.duration}
        </span>
      </div>

      <figcaption className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm tracking-tight">{art.title}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">{art.date}</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{art.tags.join(" · ")}</p>
      </figcaption>
    </figure>
  );
}

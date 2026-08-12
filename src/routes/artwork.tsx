import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/studio/Shell";
import { ArtworkCard } from "@/components/studio/ArtworkCard";
import { artworks } from "@/components/studio/data";

export const Route = createFileRoute("/artwork")({
  head: () => ({
    meta: [
      { title: "Artwork Gallery — ART//PROGRESS" },
      {
        name: "description",
        content: "Every study, portrait and character design collected in one calm gallery.",
      },
      { property: "og:title", content: "Artwork Gallery — ART//PROGRESS" },
      {
        property: "og:description",
        content: "Browse your studies with durations, dates and skill tags.",
      },
    ],
  }),
  component: ArtworkPage,
});

function ArtworkPage() {
  const all = [...artworks, ...artworks].map((a, i) => ({ ...a, title: `${a.title}` , key: i }));

  return (
    <Shell>
      <p className="eyebrow">Portfolio</p>
      <h1 className="display-title mt-3 text-4xl md:text-5xl">Artwork</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {all.length} pieces · 127h 34m of recorded practice
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {all.map((a) => (
          <ArtworkCard key={a.key} art={a} />
        ))}
      </div>
    </Shell>
  );
}

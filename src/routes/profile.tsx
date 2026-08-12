import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/studio/Shell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Emily Marsh · ART//PROGRESS" },
      {
        name: "description",
        content: "Artist profile with lifetime practice statistics and focus areas.",
      },
      { property: "og:title", content: "Profile — Emily Marsh · ART//PROGRESS" },
      { property: "og:description", content: "Lifetime practice statistics and current focus." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <Shell>
      <div className="flex items-center gap-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border-strong bg-secondary text-sm tracking-widest">
          EM
        </span>
        <div>
          <h1 className="display-title text-4xl">Emily Marsh</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Illustrator · Drawing daily since March 2024
          </p>
        </div>
      </div>

      <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        {[
          ["Lifetime hours", "127h 34m"],
          ["Artworks", "83"],
          ["Longest streak", "41 days"],
        ].map(([label, value]) => (
          <div key={label} className="glass card-hover rounded-2xl p-5">
            <p className="eyebrow">{label}</p>
            <p className="display-title mt-4 text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Currently focused on hand construction and figure lighting. Aiming for 200 recorded hours
        before the end of the year.
      </p>
    </Shell>
  );
}

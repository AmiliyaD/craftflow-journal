import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/studio/Shell";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Challenges — ART//PROGRESS" },
      {
        name: "description",
        content: "Structured drawing challenges with daily progress and streak calendars.",
      },
      { property: "og:title", content: "Challenges — ART//PROGRESS" },
      {
        property: "og:description",
        content: "30 days of hands, perspective sprints and other focused practice runs.",
      },
    ],
  }),
  component: ChallengesPage,
});

const challenges = [
  { name: "30 Days of Hands", done: 19, total: 30, status: "Active" },
  { name: "Perspective Sprint", done: 30, total: 30, status: "Completed" },
  { name: "50 Head Angles", done: 12, total: 50, status: "Active" },
];

function ChallengesPage() {
  return (
    <Shell>
      <p className="eyebrow">Focused practice</p>
      <h1 className="display-title mt-3 text-4xl md:text-5xl">Challenges</h1>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {challenges.map((c) => (
          <section key={c.name} className="glass card-hover rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm tracking-[0.16em] uppercase">{c.name}</h2>
              <span className="text-[0.68rem] tracking-widest text-muted-foreground uppercase">
                {c.status}
              </span>
            </div>
            <p className="display-title mt-4 text-3xl">
              {c.done} <span className="text-lg text-muted-foreground">/ {c.total} days</span>
            </p>
            <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(c.done / c.total) * 100}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-10 gap-1.5">
              {Array.from({ length: c.total }, (_, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-[3px] ${
                    i < c.done ? "bg-accent/70" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </Shell>
  );
}

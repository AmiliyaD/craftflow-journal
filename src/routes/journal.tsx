import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Shell } from "@/components/studio/Shell";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — ART//PROGRESS" },
      {
        name: "description",
        content: "Record mistakes, breakthroughs and insights from every drawing session.",
      },
      { property: "og:title", content: "Journal — ART//PROGRESS" },
      {
        property: "og:description",
        content: "A quiet place for the notes that make the next study better.",
      },
    ],
  }),
  component: JournalPage,
});

const entries = [
  {
    date: "Aug 12, 2026",
    text: "I keep making the hands too small. Need to practice hand construction from different angles.",
  },
  {
    date: "Aug 9, 2026",
    text: "Warm bounce light on the shadow side made the character read as solid. Keep the shadow value range narrow.",
  },
  {
    date: "Aug 5, 2026",
    text: "Blocking in the silhouette before details saved almost an hour. Do this every time.",
  },
];

function JournalPage() {
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Notes</p>
          <h1 className="display-title mt-3 text-4xl md:text-5xl">Journal</h1>
        </div>
        <button className="press inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm text-accent-foreground hover:opacity-90">
          <Plus size={15} /> Add insight
        </button>
      </div>

      <div className="mt-10 flex max-w-3xl flex-col gap-4">
        {entries.map((e, i) => (
          <article
            key={e.date}
            className="glass card-hover motion-item rounded-2xl p-6"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <p className="eyebrow">{e.date}</p>
            <p className="display-title mt-3 text-xl leading-snug">{e.text}</p>
          </article>
        ))}
      </div>
    </Shell>
  );
}

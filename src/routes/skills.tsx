import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/studio/Shell";
import { SkillCard } from "@/components/studio/SkillCard";
import { skills } from "@/components/studio/data";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skill Development — ART//PROGRESS" },
      {
        name: "description",
        content: "Track anatomy, perspective, lighting, color and more as measurable skills.",
      },
      { property: "og:title", content: "Skill Development — ART//PROGRESS" },
      {
        property: "og:description",
        content: "Individual art skills with progress, monthly change and trend sparklines.",
      },
    ],
  }),
  component: SkillsPage,
});

function SkillsPage() {
  return (
    <Shell>
      <p className="eyebrow">Practice areas</p>
      <h1 className="display-title mt-3 text-4xl md:text-5xl">Skills</h1>
      <p className="mt-2 max-w-lg text-sm text-muted-foreground">
        Growth is slow up close and obvious from a distance. These are the eight areas you are
        actively training.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((s) => (
          <SkillCard key={s.name} skill={s} />
        ))}
      </div>
    </Shell>
  );
}

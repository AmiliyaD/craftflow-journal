import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock3,
  ImageIcon,
  Flame,
  Activity,
  Plus,
  ArrowRight,
  Award,
} from "lucide-react";
import { Shell } from "@/components/studio/Shell";
import { StatCard } from "@/components/studio/StatCard";
import { JourneyGraph } from "@/components/studio/JourneyGraph";
import { SkillCard } from "@/components/studio/SkillCard";
import { ArtworkCard } from "@/components/studio/ArtworkCard";
import { BeforeAfter } from "@/components/studio/BeforeAfter";
import { artworks, skills } from "@/components/studio/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ART//PROGRESS Art Practice Tracker" },
      {
        name: "description",
        content:
          "Track drawing hours, skill growth, studies and challenges in one calm, premium studio dashboard.",
      },
      { property: "og:title", content: "ART//PROGRESS — Your art practice, beautifully tracked" },
      {
        property: "og:description",
        content: "Drawing time, skill development, artwork gallery and before/after progress.",
      },
    ],
  }),
  component: Dashboard,
});

const achievements = ["100 Hours", "First Portrait", "30 Day Streak", "100 Hand Studies"];

function Dashboard() {
  return (
    <Shell>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Wednesday, August 12 · 21:13</p>
          <h1 className="display-title mt-3 text-4xl md:text-5xl">Good evening, Emily.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s see how your art is evolving.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm text-accent-foreground transition-opacity duration-300 hover:opacity-90">
          <Plus size={15} strokeWidth={2} />
          New session
        </button>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Drawing time"
          value="127h"
          unit="34m"
          change="+8h 12m"
          icon={Clock3}
        />
        <StatCard label="Artworks" value="83" change="+6" icon={ImageIcon} />
        <StatCard label="Current streak" value="12" unit="days" change="+4" icon={Flame} />
        <StatCard label="Sessions" value="146" change="+11" icon={Activity} />
      </div>

      <div className="mt-6">
        <JourneyGraph />
      </div>

      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Practice areas</p>
            <h2 className="display-title mt-2 text-3xl md:text-4xl">Skill development</h2>
          </div>
          <Link
            to="/skills"
            className="hidden items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            All skills <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2 className="display-title mt-2 text-3xl md:text-4xl">Recent work</h2>
          </div>
          <Link
            to="/artwork"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs transition-colors duration-300 hover:border-border-strong"
          >
            View all artwork <ArrowRight size={13} />
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {artworks.map((a) => (
            <ArtworkCard key={a.title} art={a} />
          ))}
        </div>
      </section>

      <div className="mt-16">
        <BeforeAfter />
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <section className="glass card-hover rounded-2xl p-6">
          <p className="eyebrow">Today&apos;s insight</p>
          <p className="display-title mt-4 text-xl leading-snug">
            &ldquo;I keep making the hands too small. Need to practice hand construction from
            different angles.&rdquo;
          </p>
          <button className="mt-6 inline-flex items-center gap-2 text-xs text-accent transition-opacity hover:opacity-80">
            <Plus size={13} /> Add insight
          </button>
        </section>

        <section className="glass card-hover rounded-2xl p-6">
          <p className="eyebrow">Active challenge</p>
          <h3 className="mt-4 text-sm tracking-[0.18em] uppercase">30 days of hands</h3>
          <p className="display-title mt-3 text-3xl">
            19 <span className="text-lg text-muted-foreground">/ 30 days</span>
          </p>
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-[63%] rounded-full bg-accent" />
          </div>
          <div className="mt-5 grid grid-cols-10 gap-1.5">
            {Array.from({ length: 30 }, (_, i) => (
              <span
                key={i}
                className={`aspect-square rounded-[3px] ${
                  i < 19 ? "bg-accent/70" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        </section>

        <section className="glass card-hover rounded-2xl p-6">
          <p className="eyebrow">Achievements</p>
          <div className="mt-5 flex flex-col gap-2.5">
            {achievements.map((a) => (
              <div
                key={a}
                className="flex items-center gap-3 rounded-xl border border-border px-3.5 py-2.5 transition-colors duration-300 hover:border-border-strong"
              >
                <Award size={14} strokeWidth={1.5} className="text-accent" />
                <span className="text-xs tracking-[0.16em] uppercase">{a}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
        ART//PROGRESS · Personal studio of Emily Marsh
      </footer>
    </Shell>
  );
}

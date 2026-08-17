import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { NewSessionModal } from "@/components/studio/NewSessionModal";
import { FinishSessionModal } from "@/components/studio/FinishSessionModal";
import { CurrentSessionCard } from "@/components/studio/CurrentSessionCard";
import { RecentSessions } from "@/components/studio/RecentSessions";
import { useArtworks } from "@/lib/artworks";
import {
  formatHours,
  useSessions,
  useActiveSession,
  computeSkillStats,
  MOODS,
} from "@/lib/sessions";

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
  const [open, setOpen] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const { sessions, addSession, stats } = useSessions();
  const { artworks } = useArtworks();
  const activeSession = useActiveSession();
  const { active, elapsedMs, isRunning } = activeSession;

  const total = formatHours(stats.totalMs);
  const skillStats = useMemo(() => computeSkillStats(sessions), [sessions]);
  const topSkills = skillStats.slice(0, 4);
  const latest = sessions[0];
  const latestMood = latest ? MOODS.find((m) => m.key === latest.mood) : undefined;

  const handleStart = (skills: string[]) => {
    activeSession.start(skills);
    toast.success("Session started");
  };

  const handleDiscard = () => {
    if (window.confirm("Discard this session? The tracked time will be lost.")) {
      activeSession.discard();
      toast("Session discarded");
    }
  };

  const handleFinishSave = (mood: Parameters<typeof addSession>[0]["mood"], notes: string) => {
    const session = activeSession.toSession(mood, notes);
    if (session) addSession(session);
    activeSession.clear();
    setFinishing(false);
    toast.success("Session saved");
  };

  return (
    <Shell>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Your studio</p>
          <h1 className="display-title mt-3 text-4xl md:text-5xl">Good evening, Emily.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Let&apos;s see how your art is evolving.
          </p>
        </div>
        <button
          onClick={() => (active ? setFinishing(true) : setOpen(true))}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm text-accent-foreground transition-opacity duration-300 hover:opacity-90"
        >
          <Plus size={15} strokeWidth={2} />
          {active ? "Finish session" : "New session"}
        </button>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Drawing time"
          value={`${total.hours}h`}
          unit={`${total.minutes}m`}
          icon={Clock3}
        />
        <StatCard label="Artworks" value={String(artworks.length)} icon={ImageIcon} />
        <StatCard
          label="Current streak"
          value={String(stats.streak)}
          unit="days"
          icon={Flame}
        />
        <StatCard label="Sessions" value={String(stats.count)} icon={Activity} />
      </div>

      {active && (
        <div className="mt-6">
          <CurrentSessionCard
            active={active}
            elapsedMs={elapsedMs}
            isRunning={isRunning}
            onPause={activeSession.pause}
            onResume={activeSession.resume}
            onFinish={() => setFinishing(true)}
            onDiscard={handleDiscard}
          />
        </div>
      )}

      <div className="mt-6">
        <JourneyGraph sessions={sessions} />
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
          {topSkills.map((s) => (
            <SkillCard key={s.name} skill={s} />
          ))}
        </div>
      </section>

      <div className="mt-16">
        <RecentSessions sessions={sessions} />
      </div>

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
        {artworks.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No artwork yet — add your first piece from the Artwork page.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {artworks.slice(0, 4).map((a) => (
              <ArtworkCard key={a.id} art={a} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-16">
        <BeforeAfter />
      </div>

      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        <section className="glass card-hover rounded-2xl p-6">
          <p className="eyebrow">Today&apos;s insight</p>
          <p className="display-title mt-4 text-xl leading-snug">
            {latest?.notes
              ? `\u201C${latest.notes}\u201D`
              : "No notes yet — finish a session to capture what you learned."}
          </p>
          {latest && (
            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {latestMood && <span className="text-base">{latestMood.emoji}</span>}
              <span>{formatHours(latest.durationMs).label} session</span>
              {latest.skills.length > 0 && <span>· {latest.skills.join(", ")}</span>}
            </p>
          )}
          <button
            onClick={() => (active ? setFinishing(true) : setOpen(true))}
            className="mt-6 inline-flex items-center gap-2 text-xs text-accent transition-opacity hover:opacity-80"
          >
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

      <NewSessionModal open={open} onClose={() => setOpen(false)} onStart={handleStart} />
      <FinishSessionModal
        open={finishing}
        onClose={() => setFinishing(false)}
        durationMs={elapsedMs}
        skills={active?.skills ?? []}
        onSave={handleFinishSave}
      />

      <footer className="mt-20 border-t border-border pt-6 text-xs text-muted-foreground">
        ART//PROGRESS · Personal studio of Emily Marsh
      </footer>
    </Shell>
  );
}

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { challengeProgress, useChallenges, type Challenge } from "./challenges";
import { useArtworks, type Artwork } from "./artworks";
import { useSessions, type Session } from "./sessions";
import { createCollectionStore, nowIso, type Entity } from "./local-store";

export type AchievementCategory = "sessions" | "time" | "challenges" | "artwork";

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  /** Target count for the unlock condition. */
  target: number;
  /** Real, derived progress toward the target. */
  progress: (ctx: AchievementContext) => number;
};

export type AchievementContext = {
  sessions: Session[];
  challenges: Challenge[];
  artworks: Artwork[];
};

export type AchievementUnlock = Entity & { id: string; unlockedAt: string };

export type Achievement = AchievementDef & {
  unlocked: boolean;
  unlockedAt: string | null;
  current: number;
};

const HOUR = 60 * 60 * 1000;

const totalMs = (s: Session[]) => s.reduce((acc, x) => acc + x.durationMs, 0);
const completedChallenges = (c: Challenge[]) =>
  c.filter((x) => x.tasks.length > 0 && x.tasks.every((t) => t.completed));

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first-session",
    title: "First Session",
    description: "Complete 1 drawing session.",
    icon: "play",
    category: "sessions",
    target: 1,
    progress: (c) => c.sessions.length,
  },
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Complete 5 drawing sessions.",
    icon: "activity",
    category: "sessions",
    target: 5,
    progress: (c) => c.sessions.length,
  },
  {
    id: "dedicated",
    title: "Dedicated",
    description: "Complete 10 drawing sessions.",
    icon: "activity",
    category: "sessions",
    target: 10,
    progress: (c) => c.sessions.length,
  },
  {
    id: "first-hour",
    title: "First Hour",
    description: "Accumulate 1 hour of drawing time.",
    icon: "clock",
    category: "time",
    target: 1,
    progress: (c) => Math.floor(totalMs(c.sessions) / HOUR),
  },
  {
    id: "ten-hours",
    title: "10 Hours",
    description: "Accumulate 10 hours of drawing time.",
    icon: "clock",
    category: "time",
    target: 10,
    progress: (c) => Math.floor(totalMs(c.sessions) / HOUR),
  },
  {
    id: "hundred-hours",
    title: "100 Hours",
    description: "Accumulate 100 hours of drawing time.",
    icon: "clock",
    category: "time",
    target: 100,
    progress: (c) => Math.floor(totalMs(c.sessions) / HOUR),
  },
  {
    id: "challenge-accepted",
    title: "Challenge Accepted",
    description: "Complete 1 challenge.",
    icon: "target",
    category: "challenges",
    target: 1,
    progress: (c) => completedChallenges(c.challenges).length,
  },
  {
    id: "challenge-veteran",
    title: "Challenge Veteran",
    description: "Complete 5 challenges.",
    icon: "target",
    category: "challenges",
    target: 5,
    progress: (c) => completedChallenges(c.challenges).length,
  },
  {
    id: "challenge-master",
    title: "Challenge Master",
    description: "Complete 10 challenges.",
    icon: "trophy",
    category: "challenges",
    target: 10,
    progress: (c) => completedChallenges(c.challenges).length,
  },
  {
    id: "seven-day-challenge",
    title: "First 7-Day Challenge",
    description: "Complete a challenge with at least 7 tasks.",
    icon: "flame",
    category: "challenges",
    target: 1,
    progress: (c) => completedChallenges(c.challenges).filter((x) => x.tasks.length >= 7).length,
  },
  {
    id: "thirty-day-commitment",
    title: "30-Day Commitment",
    description: "Complete a challenge with at least 30 tasks.",
    icon: "flame",
    category: "challenges",
    target: 1,
    progress: (c) => completedChallenges(c.challenges).filter((x) => x.tasks.length >= 30).length,
  },
  {
    id: "first-artwork",
    title: "First Artwork",
    description: "Save your first artwork.",
    icon: "image",
    category: "artwork",
    target: 1,
    progress: (c) => c.artworks.length,
  },
  {
    id: "ten-artworks",
    title: "Ten Pieces",
    description: "Save 10 artworks to your library.",
    icon: "image",
    category: "artwork",
    target: 10,
    progress: (c) => c.artworks.length,
  },
];

function isUnlock(v: unknown): v is AchievementUnlock {
  if (!v || typeof v !== "object") return false;
  const u = v as Partial<AchievementUnlock>;
  return typeof u.id === "string" && typeof u.unlockedAt === "string";
}

const store = createCollectionStore<AchievementUnlock>("artprogress.achievements.v1", isUnlock);

export const loadUnlocks = store.read;

export function evaluateAchievements(
  ctx: AchievementContext,
  unlocks: AchievementUnlock[]
): Achievement[] {
  const byId = new Map(unlocks.map((u) => [u.id, u.unlockedAt]));
  return ACHIEVEMENTS.map((def) => {
    const current = Math.max(0, def.progress(ctx));
    const met = current >= def.target;
    const unlockedAt = byId.get(def.id) ?? null;
    return { ...def, current, unlocked: met, unlockedAt };
  });
}

/**
 * Derives achievement state from real session/challenge/artwork data and
 * persists the unlock timestamps. Mount once (in the app shell) so the
 * unlock notification is not duplicated per page section.
 */
export function useAchievements({ notify = false }: { notify?: boolean } = {}) {
  const { sessions } = useSessions();
  const { challenges, ready: challengesReady } = useChallenges();
  const { artworks, ready: artworksReady } = useArtworks();
  const { items: unlocks, ready: unlocksReady } = store.useCollection();
  const announced = useRef<Set<string>>(new Set());
  const ready = challengesReady && artworksReady && unlocksReady;

  const achievements = useMemo(
    () => evaluateAchievements({ sessions, challenges, artworks }, unlocks),
    [sessions, challenges, artworks, unlocks]
  );

  useEffect(() => {
    if (!ready) return;
    const known = new Set(unlocks.map((u) => u.id));
    const fresh = achievements.filter((a) => a.unlocked && !known.has(a.id));
    if (fresh.length === 0) return;
    const at = nowIso();
    store.commit([...store.read(), ...fresh.map((a) => ({ id: a.id, unlockedAt: at }))]);
    if (!notify) return;
    for (const a of fresh) {
      if (announced.current.has(a.id)) continue;
      announced.current.add(a.id);
      toast.success(`Achievement unlocked — ${a.title}`, { description: a.description });
    }
  }, [achievements, unlocks, ready, notify]);

  const unlocked = achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => (b.unlockedAt ?? "").localeCompare(a.unlockedAt ?? ""));
  const locked = achievements.filter((a) => !a.unlocked);

  return { achievements, unlocked, locked, ready };
}

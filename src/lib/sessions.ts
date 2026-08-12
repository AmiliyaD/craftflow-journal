import { useCallback, useEffect, useState } from "react";

export type Mood = "rough" | "flat" | "ok" | "good" | "fire";

export const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: "rough", emoji: "😣", label: "Rough" },
  { key: "flat", emoji: "😐", label: "Flat" },
  { key: "ok", emoji: "🙂", label: "Okay" },
  { key: "good", emoji: "😊", label: "Good" },
  { key: "fire", emoji: "🔥", label: "On fire" },
];

export const FOCUS_AREAS = [
  "Anatomy",
  "Portrait",
  "Character",
  "Perspective",
  "Color",
  "Lighting",
  "Composition",
  "Hands",
  "Clothing",
  "Free drawing",
] as const;

export type FocusArea = (typeof FOCUS_AREAS)[number];

/** A single recorded practice session. Shape is DB-ready. */
export type Session = {
  id: string;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMs: number;
  skills: string[];
  mood: Mood | null;
  notes: string;
  createdAt: string; // ISO
};

const STORAGE_KEY = "artprogress.sessions.v1";

export function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

function persist(sessions: Session[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* storage unavailable */
  }
}

const EVENT = "artprogress:sessions";

export function createSession(input: Omit<Session, "id" | "createdAt">): Session {
  return {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
}

export function formatDuration(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatHours(ms: number) {
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m` : `${Math.max(1, Math.round(ms / 1000))}s`;
  return { hours: h, minutes: m, label };
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days ending today (or yesterday) that contain at least one session. */
export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  const cursor = new Date();
  if (!days.has(dayKey(cursor.toISOString()))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor.toISOString()))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type SessionStats = {
  count: number;
  totalMs: number;
  streak: number;
  minutesByDay: Record<string, number>;
};

export function computeStats(sessions: Session[]): SessionStats {
  const minutesByDay: Record<string, number> = {};
  let totalMs = 0;
  for (const s of sessions) {
    totalMs += s.durationMs;
    const k = dayKey(s.startedAt);
    minutesByDay[k] = (minutesByDay[k] ?? 0) + s.durationMs / 60000;
  }
  return { count: sessions.length, totalMs, streak: computeStreak(sessions), minutesByDay };
}

/** Reactive access to locally persisted sessions. */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
    const sync = () => setSessions(loadSessions());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addSession = useCallback((session: Session) => {
    const next = [session, ...loadSessions()];
    persist(next);
    setSessions(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { sessions, addSession, stats: computeStats(sessions) };
}

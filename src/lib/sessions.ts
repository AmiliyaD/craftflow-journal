import { useCallback, useEffect, useRef, useState } from "react";

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

/** A session currently in progress. Timestamp based so it survives reloads. */
export type ActiveSession = {
  id: string;
  startedAt: string; // ISO
  skills: string[];
  /** Drawing time accumulated before the current running segment. */
  accumulatedMs: number;
  /** Epoch ms the current running segment started, or null when paused. */
  runningSince: number | null;
};

const SESSIONS_KEY = "artprogress.sessions.v1";
const ACTIVE_KEY = "artprogress.active-session.v1";
const SESSIONS_EVENT = "artprogress:sessions";
const ACTIVE_EVENT = "artprogress:active-session";

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function newId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ------------------------------------------------------------------ */
/* Saved sessions                                                      */
/* ------------------------------------------------------------------ */

function isSession(v: unknown): v is Session {
  if (!v || typeof v !== "object") return false;
  const s = v as Partial<Session>;
  return (
    typeof s.id === "string" &&
    typeof s.startedAt === "string" &&
    typeof s.durationMs === "number" &&
    Array.isArray(s.skills)
  );
}

export function loadSessions(): Session[] {
  const parsed = readJSON<unknown>(SESSIONS_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isSession);
}

export function createSession(input: Omit<Session, "id" | "createdAt">): Session {
  return { ...input, id: newId("s"), createdAt: new Date().toISOString() };
}

/* ------------------------------------------------------------------ */
/* Active session                                                      */
/* ------------------------------------------------------------------ */

function isActiveSession(v: unknown): v is ActiveSession {
  if (!v || typeof v !== "object") return false;
  const a = v as Partial<ActiveSession>;
  return (
    typeof a.id === "string" &&
    typeof a.startedAt === "string" &&
    typeof a.accumulatedMs === "number" &&
    Array.isArray(a.skills) &&
    (a.runningSince === null || typeof a.runningSince === "number")
  );
}

export function loadActiveSession(): ActiveSession | null {
  const parsed = readJSON<unknown>(ACTIVE_KEY);
  return isActiveSession(parsed) ? parsed : null;
}

/** Pure elapsed-drawing-time calculation from timestamps. */
export function elapsedOf(active: ActiveSession | null, now = Date.now()): number {
  if (!active) return 0;
  const running = active.runningSince ? Math.max(0, now - active.runningSince) : 0;
  return active.accumulatedMs + running;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function formatHours(ms: number) {
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m` : `${Math.max(0, Math.round(ms / 1000))}s`;
  return { hours: h, minutes: m, label };
}

export function dayKey(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function formatSessionDate(iso: string) {
  const d = new Date(iso);
  const today = dayKey(new Date());
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  if (dayKey(d) === today) return "Today";
  if (dayKey(d) === dayKey(yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* Stats                                                               */
/* ------------------------------------------------------------------ */

/** Consecutive days ending today (or yesterday) that contain at least one session. */
export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(dayKey(cursor))) {
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

export type SkillStat = {
  name: string;
  totalMs: number;
  sessions: number;
  /** Share of total tracked practice time, 0-100. */
  share: number;
  /** Practice minutes over the last 8 weeks, oldest first. */
  spark: number[];
};

export function computeSkillStats(sessions: Session[]): SkillStat[] {
  const totals = new Map<string, { ms: number; count: number; spark: number[] }>();
  for (const name of FOCUS_AREAS) {
    totals.set(name, { ms: 0, count: 0, spark: Array.from({ length: 8 }, () => 0) });
  }
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  let grand = 0;

  for (const s of sessions) {
    grand += s.durationMs;
    const bucket = 7 - Math.floor((now - new Date(s.startedAt).getTime()) / week);
    for (const skill of s.skills) {
      const entry = totals.get(skill) ?? { ms: 0, count: 0, spark: Array.from({ length: 8 }, () => 0) };
      entry.ms += s.durationMs;
      entry.count += 1;
      if (bucket >= 0 && bucket <= 7) entry.spark[bucket] = (entry.spark[bucket] ?? 0) + s.durationMs / 60000;
      totals.set(skill, entry);
    }
  }

  return [...totals.entries()]
    .map(([name, v]) => ({
      name,
      totalMs: v.ms,
      sessions: v.count,
      share: grand > 0 ? Math.round((v.ms / grand) * 100) : 0,
      spark: v.spark,
    }))
    .sort((a, b) => b.totalMs - a.totalMs);
}

export type RangeKey = "7D" | "30D" | "3M" | "1Y" | "ALL";

export type ActivitySeries = { values: number[]; labels: string[]; hasData: boolean };

/** Drawing minutes per bucket for a given range, derived from real sessions. */
export function computeActivitySeries(sessions: Session[], range: RangeKey): ActivitySeries {
  if (sessions.length === 0) return { values: [], labels: [], hasData: false };

  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const dayBuckets = (days: number, labelEvery: number, fmt: Intl.DateTimeFormatOptions) => {
    const values: number[] = [];
    const labels: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = startOfDay(new Date());
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const ms = sessions
        .filter((s) => dayKey(s.startedAt) === key)
        .reduce((acc, s) => acc + s.durationMs, 0);
      values.push(Math.round(ms / 60000));
      if ((days - 1 - i) % labelEvery === 0) labels.push(d.toLocaleDateString(undefined, fmt));
    }
    return { values, labels, hasData: true };
  };

  const monthBuckets = (months: number) => {
    const values: number[] = [];
    const labels: string[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ms = sessions
        .filter((s) => {
          const sd = new Date(s.startedAt);
          return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
        })
        .reduce((acc, s) => acc + s.durationMs, 0);
      values.push(Math.round(ms / 60000));
      labels.push(d.toLocaleDateString(undefined, { month: "short" }));
    }
    return { values, labels, hasData: true };
  };

  switch (range) {
    case "7D":
      return dayBuckets(7, 1, { weekday: "short" });
    case "30D":
      return dayBuckets(30, 7, { month: "short", day: "numeric" });
    case "3M":
      return monthBuckets(3);
    case "1Y":
      return monthBuckets(12);
    case "ALL": {
      const first = sessions.reduce(
        (min, s) => (new Date(s.startedAt) < min ? new Date(s.startedAt) : min),
        new Date(sessions[0]!.startedAt)
      );
      const months =
        (now.getFullYear() - first.getFullYear()) * 12 + (now.getMonth() - first.getMonth()) + 1;
      return monthBuckets(Math.min(Math.max(months, 3), 36));
    }
  }
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Reactive access to locally persisted sessions. */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
    const sync = () => setSessions(loadSessions());
    window.addEventListener(SESSIONS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SESSIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addSession = useCallback((session: Session) => {
    const next = [session, ...loadSessions()];
    writeJSON(SESSIONS_KEY, next);
    setSessions(next);
    window.dispatchEvent(new Event(SESSIONS_EVENT));
  }, []);

  return { sessions, addSession, stats: computeStats(sessions) };
}

export type UseActiveSession = {
  active: ActiveSession | null;
  elapsedMs: number;
  isRunning: boolean;
  start: (skills: string[]) => void;
  pause: () => void;
  resume: () => void;
  setSkills: (skills: string[]) => void;
  discard: () => void;
  /** Freeze the timer and return the finished data, without saving. */
  toSession: (mood: Mood | null, notes: string) => Session | null;
  clear: () => void;
};

/** Reactive, localStorage-backed active session with a timestamp driven timer. */
export function useActiveSession(): UseActiveSession {
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [, forceTick] = useState(0);
  const hydrated = useRef(false);

  const commit = useCallback((next: ActiveSession | null) => {
    writeJSON(ACTIVE_KEY, next);
    setActive(next);
    window.dispatchEvent(new Event(ACTIVE_EVENT));
  }, []);

  useEffect(() => {
    hydrated.current = true;
    setActive(loadActiveSession());
    const sync = () => setActive(loadActiveSession());
    window.addEventListener(ACTIVE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isRunning = !!active?.runningSince;

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 250);
    const onVisible = () => forceTick((n) => n + 1);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isRunning]);

  const start = useCallback(
    (skills: string[]) => {
      commit({
        id: newId("a"),
        startedAt: new Date().toISOString(),
        skills,
        accumulatedMs: 0,
        runningSince: Date.now(),
      });
    },
    [commit]
  );

  const pause = useCallback(() => {
    const current = loadActiveSession();
    if (!current || !current.runningSince) return;
    commit({
      ...current,
      accumulatedMs: elapsedOf(current),
      runningSince: null,
    });
  }, [commit]);

  const resume = useCallback(() => {
    const current = loadActiveSession();
    if (!current || current.runningSince) return;
    commit({ ...current, runningSince: Date.now() });
  }, [commit]);

  const setSkills = useCallback(
    (skills: string[]) => {
      const current = loadActiveSession();
      if (!current) return;
      commit({ ...current, skills });
    },
    [commit]
  );

  const discard = useCallback(() => commit(null), [commit]);
  const clear = useCallback(() => commit(null), [commit]);

  const toSession = useCallback((mood: Mood | null, notes: string): Session | null => {
    const current = loadActiveSession();
    if (!current) return null;
    const durationMs = elapsedOf(current);
    return createSession({
      startedAt: current.startedAt,
      endedAt: new Date().toISOString(),
      durationMs,
      skills: current.skills,
      mood,
      notes: notes.trim(),
    });
  }, []);

  return {
    active,
    elapsedMs: elapsedOf(active),
    isRunning,
    start,
    pause,
    resume,
    setSkills,
    discard,
    toSession,
    clear,
  };
}

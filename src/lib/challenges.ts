import { createCollectionStore, newId, nowIso, type Entity } from "./local-store";

export type ChallengeStatus = "active" | "paused" | "completed";

export type ChallengeTask = {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  completedAt: string | null;
};

export type Challenge = Entity & {
  id: string;
  title: string;
  description: string;
  dailyGoal: string;
  createdAt: string;
  updatedAt: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: ChallengeStatus;
  accent: string; // token key, see CHALLENGE_ACCENTS
  tasks: ChallengeTask[];
};

export const CHALLENGE_ACCENTS: { key: string; label: string; color: string }[] = [
  { key: "amber", label: "Amber", color: "oklch(0.78 0.13 72)" },
  { key: "rose", label: "Rose", color: "oklch(0.72 0.14 18)" },
  { key: "jade", label: "Jade", color: "oklch(0.75 0.11 165)" },
  { key: "azure", label: "Azure", color: "oklch(0.72 0.12 245)" },
  { key: "violet", label: "Violet", color: "oklch(0.72 0.13 300)" },
  { key: "sand", label: "Sand", color: "oklch(0.80 0.05 90)" },
];

export function accentColor(key: string) {
  return CHALLENGE_ACCENTS.find((a) => a.key === key)?.color ?? CHALLENGE_ACCENTS[0]!.color;
}

export function toDateInput(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

export function formatDay(date: string) {
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function makeTask(title: string, notes = ""): ChallengeTask {
  return { id: newId("t"), title, notes, completed: false, completedAt: null };
}

export function makeTasks(count: number, labelPrefix = "Day"): ChallengeTask[] {
  return Array.from({ length: count }, (_, i) =>
    makeTask(`${labelPrefix} ${String(i + 1).padStart(2, "0")}`)
  );
}

export function challengeProgress(c: Challenge) {
  const total = c.tasks.length;
  const done = c.tasks.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

/** Consecutive days (ending today or yesterday) with at least one completed task. */
export function challengeStreak(c: Challenge) {
  const days = new Set(
    c.tasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => toDateInput(new Date(t.completedAt as string)))
  );
  if (days.size === 0) return 0;
  const cursor = new Date();
  if (!days.has(toDateInput(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toDateInput(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(toDateInput(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function isTask(v: unknown): v is ChallengeTask {
  if (!v || typeof v !== "object") return false;
  const t = v as Partial<ChallengeTask>;
  return typeof t.id === "string" && typeof t.title === "string" && typeof t.completed === "boolean";
}

function isChallenge(v: unknown): v is Challenge {
  if (!v || typeof v !== "object") return false;
  const c = v as Partial<Challenge>;
  return (
    typeof c.id === "string" &&
    typeof c.title === "string" &&
    Array.isArray(c.tasks) &&
    c.tasks.every(isTask)
  );
}

const HAND_STUDIES = [
  "Front view",
  "Side view",
  "Foreshortening",
  "Fist",
  "Relaxed hand",
  "Holding an object",
  "Pointing",
  "Open palm",
  "Gripping a pen",
  "Interlaced fingers",
  "Hand on hip",
  "Cupped hands",
  "Thumb studies",
  "Knuckle structure",
  "Hand from below",
  "Hand from above",
  "Gesture hands",
  "Child hands",
  "Elderly hands",
  "Two hands together",
  "Hand in motion",
  "Hand with sleeve",
  "Grasping fabric",
  "Playing an instrument",
  "Writing pose",
  "Wrist rotation",
  "Fingers spread",
  "Hand and face",
  "Expressive gesture",
  "Final hand study",
];

function seedChallenges(): Challenge[] {
  const created = nowIso();
  const build = (
    title: string,
    description: string,
    dailyGoal: string,
    accent: string,
    days: number,
    done: number,
    status: ChallengeStatus,
    labels?: string[]
  ): Challenge => {
    const startDate = addDays(toDateInput(new Date()), -Math.min(done, days));
    const tasks = Array.from({ length: days }, (_, i) => {
      const label = labels?.[i];
      const task = makeTask(
        `Day ${String(i + 1).padStart(2, "0")}${label ? ` — ${label}` : ""}`
      );
      if (i < done) {
        task.completed = true;
        task.completedAt = new Date(
          new Date(`${addDays(startDate, i)}T12:00:00`).getTime()
        ).toISOString();
      }
      return task;
    });
    return {
      id: newId("c"),
      title,
      description,
      dailyGoal,
      createdAt: created,
      updatedAt: created,
      startDate,
      endDate: addDays(startDate, days - 1),
      status,
      accent,
      tasks,
    };
  };

  return [
    build(
      "30 Days of Hands",
      "Practice drawing hands from different angles every day.",
      "Complete one hand study.",
      "amber",
      30,
      19,
      "active",
      HAND_STUDIES
    ),
    build(
      "Perspective Sprint",
      "One-, two- and three-point perspective drills.",
      "Draw one perspective scene.",
      "azure",
      30,
      30,
      "completed"
    ),
    build(
      "50 Head Angles",
      "Construct the head from fifty different viewpoints.",
      "Draw one head angle.",
      "violet",
      50,
      12,
      "active"
    ),
  ];
}

const store = createCollectionStore<Challenge>(
  "artprogress.challenges.v1",
  isChallenge,
  seedChallenges
);

export const loadChallenges = store.read;

export type ChallengeInput = {
  title: string;
  description: string;
  dailyGoal: string;
  startDate: string;
  accent: string;
  duration: number;
};

export function useChallenges() {
  const { items, ready, add, update, remove } = store.useCollection();

  const createChallenge = (input: ChallengeInput) => {
    const created = nowIso();
    const challenge: Challenge = {
      id: newId("c"),
      title: input.title.trim() || "Untitled challenge",
      description: input.description.trim(),
      dailyGoal: input.dailyGoal.trim(),
      createdAt: created,
      updatedAt: created,
      startDate: input.startDate,
      endDate: addDays(input.startDate, Math.max(1, input.duration) - 1),
      status: "active",
      accent: input.accent,
      tasks: makeTasks(Math.max(1, input.duration)),
    };
    add(challenge);
    return challenge;
  };

  /** Edits metadata without ever resetting completed tasks. */
  const editChallenge = (id: string, input: ChallengeInput) => {
    update(id, (prev) => {
      const duration = Math.max(1, input.duration);
      let tasks = prev.tasks;
      if (duration > tasks.length) {
        tasks = [
          ...tasks,
          ...Array.from({ length: duration - tasks.length }, (_, i) =>
            makeTask(`Day ${String(tasks.length + i + 1).padStart(2, "0")}`)
          ),
        ];
      } else if (duration < tasks.length) {
        tasks = tasks.slice(0, duration);
      }
      return {
        ...prev,
        title: input.title.trim() || prev.title,
        description: input.description.trim(),
        dailyGoal: input.dailyGoal.trim(),
        startDate: input.startDate,
        endDate: addDays(input.startDate, duration - 1),
        accent: input.accent,
        tasks,
        updatedAt: nowIso(),
      };
    });
  };

  const setStatus = (id: string, status: ChallengeStatus) =>
    update(id, { status, updatedAt: nowIso() } as Partial<Challenge>);

  const toggleTask = (challengeId: string, taskId: string) =>
    update(challengeId, (prev) => {
      const tasks = prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, completed: !t.completed, completedAt: t.completed ? null : nowIso() }
          : t
      );
      const allDone = tasks.length > 0 && tasks.every((t) => t.completed);
      return {
        ...prev,
        tasks,
        status: allDone ? "completed" : prev.status === "completed" ? "active" : prev.status,
        updatedAt: nowIso(),
      };
    });

  const addTask = (challengeId: string, title: string, notes = "") =>
    update(challengeId, (prev) => ({
      ...prev,
      tasks: [...prev.tasks, makeTask(title.trim() || `Day ${prev.tasks.length + 1}`, notes)],
      updatedAt: nowIso(),
    }));

  const editTask = (challengeId: string, taskId: string, patch: Partial<ChallengeTask>) =>
    update(challengeId, (prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
      updatedAt: nowIso(),
    }));

  const removeTask = (challengeId: string, taskId: string) =>
    update(challengeId, (prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      updatedAt: nowIso(),
    }));

  return {
    challenges: items,
    ready,
    createChallenge,
    editChallenge,
    deleteChallenge: remove,
    setStatus,
    toggleTask,
    addTask,
    editTask,
    removeTask,
  };
}

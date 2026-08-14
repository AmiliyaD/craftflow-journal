import { createCollectionStore, newId, nowIso, type Entity } from "./local-store";

export const INSIGHT_TAGS = [
  "Anatomy",
  "Hands",
  "Color",
  "Composition",
  "Perspective",
  "Lighting",
  "Mindset",
  "Workflow",
] as const;

export type Insight = Entity & {
  id: string;
  title: string;
  content: string;
  tags: string[];
  relatedArtworkId: string | null;
  relatedChallengeId: string | null;
  relatedSessionId: string | null;
  /** YYYY-MM-DD; falls back to createdAt for older records. */
  date: string;
  createdAt: string;
  updatedAt: string;
};

export function insightDate(i: Insight) {
  return i.date || i.createdAt.slice(0, 10);
}

function isInsight(v: unknown): v is Insight {
  if (!v || typeof v !== "object") return false;
  const i = v as Partial<Insight>;
  return typeof i.id === "string" && typeof i.title === "string" && Array.isArray(i.tags);
}

function seedInsights(): Insight[] {
  const base = [
    {
      title: "Hands keep coming out too small",
      content:
        "I keep making the hands too small. Need to practice hand construction from different angles and measure against the chin.",
      tags: ["Hands", "Anatomy"],
      daysAgo: 1,
    },
    {
      title: "Warm bounce light sells solidity",
      content:
        "Warm bounce light on the shadow side made the character read as solid. Keep the shadow value range narrow.",
      tags: ["Lighting", "Color"],
      daysAgo: 4,
    },
    {
      title: "Silhouette first, details later",
      content:
        "Blocking in the silhouette before details saved almost an hour. Do this every time.",
      tags: ["Composition", "Workflow"],
      daysAgo: 8,
    },
  ];
  return base.map((b) => {
    const d = new Date();
    d.setDate(d.getDate() - b.daysAgo);
    const iso = d.toISOString();
    return {
      id: newId("i"),
      title: b.title,
      content: b.content,
      tags: b.tags,
      relatedArtworkId: null,
      relatedChallengeId: null,
      relatedSessionId: null,
      date: iso.slice(0, 10),
      createdAt: iso,
      updatedAt: iso,
    };
  });
}

const store = createCollectionStore<Insight>("artprogress.insights.v1", isInsight, seedInsights);

export const loadInsights = store.read;

export type InsightInput = {
  title: string;
  content: string;
  tags: string[];
  relatedArtworkId: string | null;
  relatedChallengeId: string | null;
  relatedSessionId?: string | null;
  date?: string;
};

export function useInsights() {
  const { items, ready, add, update, remove } = store.useCollection();

  const createInsight = (input: InsightInput) => {
    const created = nowIso();
    const insight: Insight = {
      id: newId("i"),
      title: input.title.trim() || "Untitled insight",
      content: input.content.trim(),
      tags: input.tags,
      relatedArtworkId: input.relatedArtworkId,
      relatedChallengeId: input.relatedChallengeId,
      relatedSessionId: input.relatedSessionId ?? null,
      date: input.date || created.slice(0, 10),
      createdAt: created,
      updatedAt: created,
    };
    add(insight);
    return insight;
  };

  const editInsight = (id: string, input: InsightInput) =>
    update(id, (prev) => ({
      ...prev,
      title: input.title.trim() || prev.title,
      content: input.content.trim(),
      tags: input.tags,
      relatedArtworkId: input.relatedArtworkId,
      relatedChallengeId: input.relatedChallengeId,
      relatedSessionId: input.relatedSessionId ?? null,
      date: input.date || insightDate(prev),
      updatedAt: nowIso(),
    }));

  const sorted = [...items].sort((a, b) => insightDate(b).localeCompare(insightDate(a)));

  return { insights: sorted, ready, createInsight, editInsight, deleteInsight: remove };
}

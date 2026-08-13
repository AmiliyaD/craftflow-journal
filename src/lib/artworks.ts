import { createCollectionStore, newId, nowIso, type Entity } from "./local-store";
import { deleteImage, putImage } from "./image-store";
import type { Mood } from "./sessions";

export const ARTWORK_TOPICS = [
  "Anatomy",
  "Portrait",
  "Faces",
  "Hands",
  "Perspective",
  "Color",
  "Lighting",
  "Composition",
  "Character",
  "Clothing",
  "Environment",
] as const;

export type Artwork = Entity & {
  id: string;
  title: string;
  description: string;
  imageId: string | null;
  date: string; // YYYY-MM-DD
  durationMs: number;
  topics: string[];
  mood: Mood | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

function isArtwork(v: unknown): v is Artwork {
  if (!v || typeof v !== "object") return false;
  const a = v as Partial<Artwork>;
  return typeof a.id === "string" && typeof a.title === "string" && Array.isArray(a.topics);
}

const store = createCollectionStore<Artwork>("artprogress.artworks.v1", isArtwork);

export const loadArtworks = store.read;

export type ArtworkInput = {
  title: string;
  description: string;
  date: string;
  durationMs: number;
  topics: string[];
  mood: Mood | null;
  notes: string;
  /** New file to store; omit to keep the current image. */
  file?: File | null;
};

export function formatArtworkTime(ms: number) {
  const minutes = Math.round(ms / 60000);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0 && m === 0) return "—";
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

export function useArtworks() {
  const { items, ready, add, update, remove } = store.useCollection();

  const createArtwork = async (input: ArtworkInput) => {
    let imageId: string | null = null;
    if (input.file) {
      imageId = newId("img");
      await putImage(imageId, input.file);
    }
    const created = nowIso();
    const artwork: Artwork = {
      id: newId("art"),
      title: input.title.trim() || "Untitled",
      description: input.description.trim(),
      imageId,
      date: input.date,
      durationMs: input.durationMs,
      topics: input.topics,
      mood: input.mood,
      notes: input.notes.trim(),
      createdAt: created,
      updatedAt: created,
    };
    add(artwork);
    return artwork;
  };

  const editArtwork = async (id: string, input: ArtworkInput) => {
    let newImageId: string | null = null;
    if (input.file) {
      newImageId = newId("img");
      await putImage(newImageId, input.file);
    }
    const previous = store.read().find((a) => a.id === id);
    update(id, (prev) => ({
      ...prev,
      title: input.title.trim() || prev.title,
      description: input.description.trim(),
      date: input.date,
      durationMs: input.durationMs,
      topics: input.topics,
      mood: input.mood,
      notes: input.notes.trim(),
      imageId: newImageId ?? prev.imageId,
      updatedAt: nowIso(),
    }));
    if (newImageId && previous?.imageId) await deleteImage(previous.imageId);
  };

  const deleteArtwork = async (id: string) => {
    const target = store.read().find((a) => a.id === id);
    remove(id);
    if (target?.imageId) await deleteImage(target.imageId);
  };

  return { artworks: items, ready, createArtwork, editArtwork, deleteArtwork };
}

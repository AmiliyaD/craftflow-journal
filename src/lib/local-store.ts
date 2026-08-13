import { useCallback, useEffect, useState } from "react";

/** Minimal shape every stored record shares. */
export type Entity = { id: string };

export function newId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}_${crypto.randomUUID()}`
    : `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

/**
 * Creates a versioned, localStorage-backed collection store.
 * The abstraction keeps CRUD logic in one place so the persistence layer can
 * later be swapped for a database without touching UI code.
 */
export function createCollectionStore<T extends Entity>(
  key: string,
  isValid: (v: unknown) => v is T,
  seed?: () => T[]
) {
  const EVENT = `store:${key}`;
  const SEEDED_KEY = `${key}.seeded`;

  function read(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        if (seed && !window.localStorage.getItem(SEEDED_KEY)) {
          const initial = seed();
          write(initial);
          window.localStorage.setItem(SEEDED_KEY, "1");
          return initial;
        }
        return [];
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValid);
    } catch {
      return [];
    }
  }

  function write(items: T[]) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(items));
    } catch {
      /* storage unavailable or full */
    }
  }

  function commit(items: T[]) {
    write(items);
    if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
  }

  function useCollection() {
    const [items, setItems] = useState<T[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
      const sync = () => setItems(read());
      sync();
      setReady(true);
      window.addEventListener(EVENT, sync);
      window.addEventListener("storage", sync);
      return () => {
        window.removeEventListener(EVENT, sync);
        window.removeEventListener("storage", sync);
      };
    }, []);

    const add = useCallback((item: T) => {
      commit([item, ...read()]);
      return item;
    }, []);

    const update = useCallback((id: string, patch: Partial<T> | ((prev: T) => T)) => {
      commit(
        read().map((it) =>
          it.id === id ? (typeof patch === "function" ? patch(it) : { ...it, ...patch }) : it
        )
      );
    }, []);

    const remove = useCallback((id: string) => {
      commit(read().filter((it) => it.id !== id));
    }, []);

    return { items, ready, add, update, remove };
  }

  return { key, read, commit, useCollection };
}

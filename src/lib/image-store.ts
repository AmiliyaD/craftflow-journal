import { useEffect, useState } from "react";

/**
 * IndexedDB-backed blob storage for uploaded artwork images.
 * Kept behind a tiny async interface so it can be swapped for cloud storage.
 */
const DB_NAME = "artprogress.images.v1";
const STORE = "images";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putImage(id: string, blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getImage(id: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
}

export async function deleteImage(id: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    /* ignore */
  }
}

/** Resolves a stored image id into an object URL, revoked on unmount. */
export function useImageUrl(imageId: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    if (!imageId) {
      setUrl(null);
      return;
    }
    void getImage(imageId).then((blob) => {
      if (cancelled || !blob) return;
      const next = URL.createObjectURL(blob);
      revoked = next;
      setUrl(next);
    });
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [imageId]);

  return url;
}

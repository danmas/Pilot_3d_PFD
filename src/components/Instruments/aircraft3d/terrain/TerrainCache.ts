/**
 * IndexedDB cache for terrain tiles (DEM + satellite blobs).
 * Store: "pilot-terrain-cache" / "tiles"
 */

import { tileKey } from './terrainTileUtils';

const DB_NAME = 'pilot-terrain-cache';
const DB_VERSION = 1;
const STORE_NAME = 'tiles';

interface TileMeta {
  z: number;
  x: number;
  y: number;
  type: 'dem' | 'sat';
  timestamp: number;
  size: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(
  mode: IDBTransactionMode,
): Promise<{ store: IDBObjectStore; db: IDBDatabase }> {
  return openDB().then((db) => {
    const tx = db.transaction(STORE_NAME, mode);
    return { store: tx.objectStore(STORE_NAME), db };
  });
}

export async function getTile(
  key: string,
): Promise<{ blob: Blob; meta: TileMeta } | null> {
  return withStore('readonly').then(({ store }) => {
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  });
}

export async function putTile(
  key: string,
  blob: Blob,
  meta: TileMeta,
): Promise<void> {
  return withStore('readwrite').then(
    ({ store }) =>
      new Promise((resolve, reject) => {
        const req = store.put({ blob, meta }, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function clearOlderThan(maxAgeMs: number): Promise<void> {
  const now = Date.now();
  return withStore('readwrite').then(
    ({ store }) =>
      new Promise((resolve, reject) => {
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if (!cursor) return resolve();
          const data = cursor.value as { blob: Blob; meta: TileMeta } | undefined;
          if (data?.meta?.timestamp && now - data.meta.timestamp > maxAgeMs) {
            cursor.delete();
          }
          cursor.continue();
        };
        req.onerror = () => reject(req.error);
      }),
  );
}

export function tileCacheKey(
  type: 'dem' | 'sat',
  z: number,
  x: number,
  y: number,
): string {
  return tileKey(type, z, x, y);
}

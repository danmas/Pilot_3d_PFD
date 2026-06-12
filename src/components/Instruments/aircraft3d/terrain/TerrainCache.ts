/**
 * TerrainCache.ts — IndexedDB обёртка для кэширования terrain тайлов.
 *
 * Хранит DEM и Satellite тайлы в IndexedDB для offline/replay режимов.
 * LRU-эвiction: макс 1000 записей в IndexedDB.
 */

const DB_NAME = 'pilot-terrain-cache';
const DB_VERSION = 1;
const STORE_NAME = 'tiles';
const MAX_ENTRIES = 1000;

interface CacheEntryMeta {
  key: string;
  timestamp: number;
  source: 'dem' | 'sat';
  z: number;
  x: number;
  y: number;
  size: number;
}

export interface CacheEntry {
  blob: Blob;
  meta: CacheEntryMeta;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'meta.timestamp', { unique: false });
        store.createIndex('source', 'meta.source', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
  return dbPromise;
}

/**
 * Получить тайл из кэша
 */
export async function getTile(key: string): Promise<Blob | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (entry) {
          // Обновляем timestamp при обращении (LRU)
          updateTimestamp(key).catch(() => {});
          resolve(entry.blob);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

/**
 * Сохранить тайл в кэш
 */
export async function putTile(
  key: string,
  blob: Blob,
  meta: { source: 'dem' | 'sat'; z: number; x: number; y: number }
): Promise<void> {
  try {
    const db = await openDb();
    const entry: CacheEntry = {
      key,
      blob,
      meta: {
        key,
        timestamp: Date.now(),
        source: meta.source,
        z: meta.z,
        x: meta.x,
        y: meta.y,
        size: blob.size,
      },
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      // Сначала проверяем количество записей
      const countRequest = store.count();
      countRequest.onsuccess = () => {
        if (countRequest.result >= MAX_ENTRIES) {
          // Удаляем самую старую запись
          clearOldest().catch(() => {});
        }
      };
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silent fail — кэш не критичен
  }
}

/**
 * Обновить timestamp записи (для LRU)
 */
async function updateTimestamp(key: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const request = store.get(key);
  request.onsuccess = () => {
    const entry = request.result as CacheEntry | undefined;
    if (entry) {
      entry.meta.timestamp = Date.now();
      store.put(entry);
    }
  };
  tx.oncomplete = () => {};
}

/**
 * Удалить самую старую запись
 */
async function clearOldest(): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const index = store.index('timestamp');
  const request = index.openCursor(null, 'next');
  request.onsuccess = () => {
    const cursor = request.result;
    if (cursor) {
      store.delete(cursor.primaryKey);
    }
  };
}

/**
 * Удалить записи старше указанного времени
 */
export async function clearOlderThan(maxAgeMs: number): Promise<number> {
  try {
    const db = await openDb();
    const cutoff = Date.now() - maxAgeMs;
    let deleted = 0;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(cutoff);
    return new Promise((resolve, reject) => {
      const cursorRequest = index.openCursor(range);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Получить общее количество записей и размер кэша
 */
export async function getCacheStats(): Promise<{ count: number; totalSizeBytes: number }> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const all = await new Promise<CacheEntry[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = all.length;
    const totalSizeBytes = all.reduce((sum, e) => sum + (e.meta?.size ?? e.blob.size), 0);
    return { count, totalSizeBytes };
  } catch {
    return { count: 0, totalSizeBytes: 0 };
  }
}

/**
 * Очистить весь кэш
 */
export async function clearAll(): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    await new Promise((resolve) => { tx.oncomplete = resolve; });
  } catch {
    // Silent
  }
}

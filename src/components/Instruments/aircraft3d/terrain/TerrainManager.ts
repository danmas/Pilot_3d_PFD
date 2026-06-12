/**
 * TerrainManager.ts — оркестрация lazy загрузки terrain тайлов.
 *
 * Синглтон: управляет загрузкой тайлов по мере движения самолёта.
 * Вместо загрузки всей сетки — подгружает новые тайлы при смещении
 * и удаляет (dispose) те, что вышли за пределы радиуса.
 */

import {
  latLonToTile,
  terrainRgbUrl,
  satelliteUrl,
  tileCacheKey,
  decodeTerrainRGB,
  tileWorldUnits,
  tileCenterLatLon,
  TILE_SIZE,
  DEFAULT_ZOOM,
  getTileCornersLatLon,
  formatTileCorners,
  type TileCoord,
} from './terrainTileUtils';
import { getTile, putTile } from './TerrainCache';

export interface TerrainTileData {
  heights: Float32Array;
  satelliteBitmap: ImageBitmap | null;
  width: number;
  height: number;
  worldUnits: number;
  minElevation: number;
  maxElevation: number;
}

export interface TileLoadProgress {
  loaded: number;
  total: number;
}

type TileAddedCallback = (coord: TileCoord, data: TerrainTileData) => void;
type ProgressCallback = (progress: TileLoadProgress) => void;

const CONFIG = {
  maxConcurrent: 6,
  fetchTimeoutMs: 8_000,
  zoom: DEFAULT_ZOOM,
  /** Радиус загрузки в тайлах от центра (внутренний для новых) */
  loadRadius: 3, // 7×7
  /** Радиус удержания (keep) — держим больше для плавности во время загрузки и движения */
  keepRadius: 4, // 9×9 overlap, удаляем только далеко за пределами
  /** Порог смещения (в долях тайла) для триггера обновления */
  moveThreshold: 0.3,
};

class TerrainManagerImpl {
  private token: string = '';
  private abortController: AbortController | null = null;
  private onTileAdded: TileAddedCallback | null = null;
  private onProgress: ProgressCallback | null = null;

  /** Загруженные тайлы: ключ "z/x/y" → данные */
  private loadedTiles = new Map<string, { coord: TileCoord; data: TerrainTileData }>();
  /** Текущий центр в координатах тайла */
  private currentCenter: TileCoord | null = null;
  /** Последние lat/lon для отслеживания смещения */
  private lastLat = 0;
  private lastLon = 0;
  /** Идёт ли загрузка */
  private isLoading = false;
  /** Очередь тайлов на загрузку */
  private loadQueue: TileCoord[] = [];

  /** Client-side log of scene loads (for analysis, corners etc). Accessible via TerrainManager.getClientLog() */
  private clientSceneLog: Array<any> = [];

  /** Tiles (z/x/y keys) that have been successfully loaded into the scene at least once this session.
   *  For these, we will *never* fetch from network again — only restore from client cache (IDB).
   *  This directly satisfies "do not load from internet if already loaded once".
   */
  private everLoaded = new Set<string>();

  private logClientEvent(event: any) {
    const payload = {
      ...event,
      t: event.t || new Date().toISOString(),
      source: 'client-scene',
    };
    this.clientSceneLog.push(payload);
    // local console
    console.log(`[TerrainClient] ${payload.t} ${payload.type || payload.event || 'event'}`, payload);
    // send to server immediately (fire-and-forget)
    fetch('/api/terrain/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => { /* ignore network errors for logging */ });
  }

  init(token: string): void {
    this.token = token;
    this.abortController?.abort();
    this.abortController = new AbortController();
  }

  onTile(cb: TileAddedCallback): void {
    this.onTileAdded = cb;
  }

  onLoadProgress(cb: ProgressCallback): void {
    this.onProgress = cb;
  }

  /** Проверить, есть ли токен */
  get isReady(): boolean {
    return this.token.length > 0;
  }

  /** Количество загруженных тайлов */
  get loadedCount(): number {
    return this.loadedTiles.size;
  }

  /** Получить все загруженные тайлы */
  getAllTiles(): Array<{ coord: TileCoord; data: TerrainTileData }> {
    return Array.from(this.loadedTiles.values());
  }

  /** Получить клиентский лог загрузок в сцену (с углами) для анализа */
  getClientLog(): any[] {
    return [...this.clientSceneLog];
  }

  /** Очистить клиентский лог */
  clearClientLog(): void {
    this.clientSceneLog = [];
  }

  /** Удалить (dispose) все тайлы */
  clearAll(): void {
    this.loadedTiles.clear();
    this.currentCenter = null;
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.loadQueue = [];
    this.everLoaded.clear();
  }

  /**
   * Обновить позицию — лениво подгрузить новые тайлы, удалить далёкие.
   * Вызывается при каждом новом кадре телеметрии.
   */
  async updatePosition(lat: number, lon: number): Promise<void> {
    if (!this.token) return;

    const center = latLonToTile(lat, lon, CONFIG.zoom);
    this.lastLat = lat;
    this.lastLon = lon;

    // 1. Если центр не изменился (тот же тайл) — ничего не делаем
    if (this.currentCenter && 
        this.currentCenter.x === center.x && 
        this.currentCenter.y === center.y) {
      return;
    }

    this.currentCenter = center;

    // 2. Вычисляем нужные тайлы
    const needed = new Set<string>();
    const neededCoords: TileCoord[] = [];
    for (let dx = -CONFIG.loadRadius; dx <= CONFIG.loadRadius; dx++) {
      for (let dy = -CONFIG.loadRadius; dy <= CONFIG.loadRadius; dy++) {
        const key = `${CONFIG.zoom}/${center.x + dx}/${center.y + dy}`;
        needed.add(key);
        neededCoords.push({ x: center.x + dx, y: center.y + dy, z: CONFIG.zoom });
      }
    }

    // 3. Удаляем тайлы, вышедшие за keepRadius (держим overlap для плавности)
    const keep = new Set<string>();
    for (let dx = -CONFIG.keepRadius; dx <= CONFIG.keepRadius; dx++) {
      for (let dy = -CONFIG.keepRadius; dy <= CONFIG.keepRadius; dy++) {
        const key = `${CONFIG.zoom}/${center.x + dx}/${center.y + dy}`;
        keep.add(key);
      }
    }
    const toDelete: string[] = [];
    for (const [key] of this.loadedTiles) {
      if (!keep.has(key)) {
        toDelete.push(key);
      }
    }
    for (const key of toDelete) {
      this.loadedTiles.delete(key);
      this.logClientEvent({ type: 'REMOVED-FROM-SCENE', tile: key });
    }

    // 4. Определяем новые тайлы для загрузки
    // Разделяем на две группы:
    // - everLoaded (уже были успешно в сцене) → ВОССТАНАВЛИВАЕМ ТОЛЬКО ИЗ КЛИЕНТСКОГО КЭША (IDB), БЕЗ СЕТИ
    // - никогда не видели → обычная загрузка (может потребовать сеть)
    const toRestoreFromCache: TileCoord[] = [];
    const toLoadFromNetwork: TileCoord[] = [];

    for (const t of neededCoords) {
      const key = `${t.z}/${t.x}/${t.y}`;
      if (this.loadedTiles.has(key)) continue;

      if (this.everLoaded.has(key)) {
        toRestoreFromCache.push(t);
      } else {
        toLoadFromNetwork.push(t);
      }
    }

    // LOG
    const neededStr = neededCoords.map(c => `${c.z}/${c.x}/${c.y}`).join(' ');
    this.logClientEvent({
      type: 'UPDATE-POSITION',
      center: { z: center.z, x: center.x, y: center.y },
      needed: neededCoords,
      toRestoreFromCache: toRestoreFromCache.length,
      toLoadFromNetwork: toLoadFromNetwork.length,
    });
    console.log(`[TerrainClient] UPDATE-POSITION center=${center.z}/${center.x}/${center.y} loadRadius=${CONFIG.loadRadius} needed=[${neededStr}] restoreCache=${toRestoreFromCache.length} network=${toLoadFromNetwork.length}`);

    if (toRestoreFromCache.length === 0 && toLoadFromNetwork.length === 0) return;

    const signal = this.abortController!.signal;
    this.isLoading = true;

    // 5a. Восстанавливаем из клиентского кэша (БЕЗ СЕТИ) — это ключ к "не грузить из инета, если уже загружали"
    for (const tile of toRestoreFromCache) {
      const key = `${tile.z}/${tile.x}/${tile.y}`;
      try {
        const data = await this.loadSingleTile(tile, signal, { forceCacheOnly: true });
        if (data && !signal.aborted) {
          this.loadedTiles.set(key, { coord: tile, data });
          this.logClientEvent({
            type: 'LOADED-INTO-SCENE',
            coord: { z: tile.z, x: tile.x, y: tile.y },
            corners: getTileCornersLatLon(tile.x, tile.y, tile.z),
            from: 'client-cache',
          });
          this.onTileAdded?.(tile, data);
          this.everLoaded.add(key); // на всякий случай
        } else {
          this.logClientEvent({ type: 'CACHE_RESTORE_FAILED', coord: { z: tile.z, x: tile.x, y: tile.y } });
        }
      } catch (e) {
        this.logClientEvent({ type: 'CACHE_RESTORE_ERROR', coord: { z: tile.z, x: tile.x, y: tile.y } });
      }
    }

    // 5b. Загружаем действительно новые (могут потребовать сеть)
    if (toLoadFromNetwork.length > 0) {
      this.loadQueue = [...toLoadFromNetwork];
      const total = toLoadFromNetwork.length;
      let loaded = 0;

      const failedThisBatch: TileCoord[] = [];

      const processNext = async (): Promise<void> => {
        while (this.loadQueue.length > 0 && !signal.aborted) {
          const tile = this.loadQueue.shift()!;
          const key = `${tile.z}/${tile.x}/${tile.y}`;
          try {
            const data = await this.loadSingleTile(tile, signal);
            if (data && !signal.aborted) {
              this.loadedTiles.set(key, { coord: tile, data });
              loaded++;
              this.logClientEvent({
                type: 'LOADED-INTO-SCENE',
                coord: { z: tile.z, x: tile.x, y: tile.y },
                corners: getTileCornersLatLon(tile.x, tile.y, tile.z),
                from: 'network',
              });
              this.onTileAdded?.(tile, data);
              this.onProgress?.({ loaded, total });
              this.everLoaded.add(key);
            } else if (!signal.aborted) {
              failedThisBatch.push(tile);
            }
          } catch {
            if (!signal.aborted) failedThisBatch.push(tile);
          }
        }
      };

      const workers = Math.min(CONFIG.maxConcurrent, toLoadFromNetwork.length);
      const promises: Promise<void>[] = [];
      for (let i = 0; i < workers; i++) {
        promises.push(processNext());
      }
      await Promise.allSettled(promises);

      // Retry только для новых
      if (failedThisBatch.length > 0 && !signal.aborted) {
        const stillNeeded = toLoadFromNetwork.filter(t => {
          const k = `${t.z}/${t.x}/${t.y}`;
          return !this.loadedTiles.has(k);
        });
        const toRetry = failedThisBatch.filter(t => stillNeeded.some(s => s.z === t.z && s.x === t.x && s.y === t.y));
        if (toRetry.length > 0) {
          this.logClientEvent({ type: 'RETRY-FAILED', count: toRetry.length, tiles: toRetry });
          this.loadQueue.push(...toRetry);
          promises.push(processNext());
          await Promise.allSettled([promises[promises.length - 1]]);
        }
      }
    }

    this.isLoading = false;

    // После всего — проверяем покрытие текущего needed
    const currentKeys = new Set(this.loadedTiles.keys());
    const missingInGrid = neededCoords.filter(t => !currentKeys.has(`${t.z}/${t.x}/${t.y}`));
    if (missingInGrid.length > 0) {
      this.logClientEvent({ type: 'COVERAGE-GAPS', stillMissing: missingInGrid.length, coords: missingInGrid });
    }
  }

  /**
   * Загрузить один тайл (DEM + Satellite)
   * @param forceCacheOnly  Если true — никогда не ходить в сеть, только из клиентского кэша (IDB).
   *                        Используется для тайлов, которые уже были успешно загружены раньше (everLoaded).
   *                        Это гарантирует требование "не грузить из инета, если уже загружали".
   */
  private async loadSingleTile(
    tile: TileCoord,
    signal: AbortSignal,
    options: { forceCacheOnly?: boolean } = {}
  ): Promise<TerrainTileData | null> {
    const { x, y, z } = tile;
    const { forceCacheOnly = false } = options;

    try {
      // 1. DEM тайл — всегда запрашиваем у прокси (сервера), чтобы если тайл был когда-либо успешно загружен, сервер отдал из своего постоянного дискового кэша (HIT), без обращения к интернету.
      // Клиентский IndexedDB используется как дополнительный L1 кэш после получения.
      const demKey = tileCacheKey('dem', z, x, y);
      let demBlob: Blob | null = null;
      let demImage: ImageBitmap | null = null;

      if (forceCacheOnly) {
        // Для everLoaded — строго только из клиентского кэша, без сети вообще.
        demBlob = await getTile(demKey);
        if (demBlob) {
          try {
            demImage = await createImageBitmap(demBlob);
          } catch {
            demImage = null;
          }
        }
        if (!demImage) {
          return null; // дыра, но без инета
        }
      } else {
        // Всегда идём к прокси для дем, чтобы использовать серверный кэш если есть.
        // Retry once on 5xx (transient Mapbox or proxy upstream hiccup) to avoid holes.
        let demResponse: Response | null = null;
        for (let attempt = 0; attempt < 2; attempt++) {
          demResponse = await fetch(terrainRgbUrl(this.token, z, x, y), { signal });
          if (demResponse.ok) break;
          if (attempt === 0 && demResponse.status >= 500) {
            await new Promise(r => setTimeout(r, 150));
            continue;
          }
          throw new Error(`DEM fetch failed: ${demResponse.status}`);
        }
        if (!demResponse || !demResponse.ok) throw new Error('DEM fetch failed');
        demBlob = await demResponse.blob();
        putTile(demKey, demBlob, { source: 'dem', z, x, y }).catch(() => {});
        demImage = await createImageBitmap(demBlob);
      }

      if (!demImage) throw new Error('DEM decode failed');
      const imgW = demImage.width > 0 ? demImage.width : 256;
      const imgH = demImage.height > 0 ? demImage.height : 256;

      const canvas = document.createElement('canvas');
      canvas.width = imgW;
      canvas.height = imgH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(demImage, 0, 0, imgW, imgH);
      const imageData = ctx.getImageData(0, 0, imgW, imgH);
      demImage.close();

      const heights = decodeTerrainRGB(imageData);

      let minElev = Infinity;
      let maxElev = -Infinity;
      for (let i = 0; i < heights.length; i++) {
        if (heights[i] < minElev) minElev = heights[i];
        if (heights[i] > maxElev) maxElev = heights[i];
      }

      // 2. Satellite (не блокирует)
      // Всегда запрашиваем у прокси, чтобы брать из серверного постоянного кэша, если тайл был когда-либо успешно загружен.
      let satelliteBitmap: ImageBitmap | null = null;
      try {
        const response = await fetch(satelliteUrl(this.token, z, x, y), {
          signal,
        });
        if (response.ok) {
          const satBlob = await response.blob();
          putTile(tileCacheKey('sat', z, x, y), satBlob, { source: 'sat', z, x, y }).catch(() => {});
          try {
            satelliteBitmap = await createImageBitmap(satBlob);
          } catch {
            // Если bitmap плохой, пробуем ещё раз (прокси должен отдать из кэша, без инета)
            const response2 = await fetch(satelliteUrl(this.token, z, x, y), {
              signal,
            });
            if (response2.ok) {
              const freshBlob = await response2.blob();
              putTile(tileCacheKey('sat', z, x, y), freshBlob, { source: 'sat', z, x, y }).catch(() => {});
              satelliteBitmap = await createImageBitmap(freshBlob);
            }
          }
        }
      } catch (satErr) {
        console.warn(`[TerrainManager] satellite ${z}/${x}/${y} failed:`, satErr);
      }

      const center = tileCenterLatLon(x, y, z);
      const wu = tileWorldUnits(z, center.lat);

      return {
        heights,
        satelliteBitmap,
        width: imgW,
        height: imgH,
        worldUnits: wu,
        minElevation: minElev,
        maxElevation: maxElev,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return null;
      }
      console.warn(`[TerrainManager] Failed ${z}/${x}/${y}:`, err);
      return null;
    }
  }

  cancel(): void {
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.loadQueue = [];
  }
}

export const TerrainManager = new TerrainManagerImpl();

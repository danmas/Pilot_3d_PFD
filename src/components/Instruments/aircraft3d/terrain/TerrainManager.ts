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
  fetchTimeoutMs: 15_000,
  zoom: DEFAULT_ZOOM,
  /** Радиус загрузки в тайлах от центра */
  loadRadius: 2, // 5×5 сетка (2 в каждую сторону)
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
  /** Новый центр, запрошенный во время загрузки — обработаем после завершения */
  private pendingCenter: TileCoord | null = null;

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

  /** Удалить (dispose) все тайлы */
  clearAll(): void {
    this.loadedTiles.clear();
    this.currentCenter = null;
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.loadQueue = [];
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

    // 2. Если идёт загрузка — запоминаем новый центр, обработаем после завершения
    if (this.isLoading) {
      this.pendingCenter = center;
      return;
    }

    this.currentCenter = center;
    this.pendingCenter = null;

    // 3. Вычисляем нужные тайлы
    const needed = new Set<string>();
    const neededCoords: TileCoord[] = [];
    for (let dx = -CONFIG.loadRadius; dx <= CONFIG.loadRadius; dx++) {
      for (let dy = -CONFIG.loadRadius; dy <= CONFIG.loadRadius; dy++) {
        const key = `${CONFIG.zoom}/${center.x + dx}/${center.y + dy}`;
        needed.add(key);
        neededCoords.push({ x: center.x + dx, y: center.y + dy, z: CONFIG.zoom });
      }
    }

    // 4. Удаляем тайлы, вышедшие за радиус
    const toDelete: string[] = [];
    for (const [key] of this.loadedTiles) {
      if (!needed.has(key)) {
        toDelete.push(key);
      }
    }
    for (const key of toDelete) {
      this.loadedTiles.delete(key);
    }

    // 5. Определяем новые тайлы для загрузки
    const newTiles = neededCoords.filter(t => {
      const key = `${t.z}/${t.x}/${t.y}`;
      return !this.loadedTiles.has(key);
    });

    if (newTiles.length === 0) return;

    // 6. Загружаем новые тайлы (с rate limiting)
    this.loadQueue = newTiles;
    this.isLoading = true;
    const total = newTiles.length;
    let loaded = 0;

    const signal = this.abortController!.signal;

    const processNext = async (): Promise<void> => {
      while (this.loadQueue.length > 0 && !signal.aborted) {
        const tile = this.loadQueue.shift()!;
        const key = `${tile.z}/${tile.x}/${tile.y}`;
        try {
          const data = await this.loadSingleTile(tile, signal);
          if (data && !signal.aborted) {
            this.loadedTiles.set(key, { coord: tile, data });
            loaded++;
            this.onTileAdded?.(tile, data);
            this.onProgress?.({ loaded, total });
          }
        } catch {
          // Пропускаем неудачные
        }
      }
    };

    const workers = Math.min(CONFIG.maxConcurrent, newTiles.length);
    const promises: Promise<void>[] = [];
    for (let i = 0; i < workers; i++) {
      promises.push(processNext());
    }
    await Promise.allSettled(promises);

    this.isLoading = false;

    // 7. Если за время загрузки пришёл новый центр — перезапускаем
    if (this.pendingCenter &&
        (this.pendingCenter.x !== center.x || this.pendingCenter.y !== center.y)) {
      const pending = this.pendingCenter;
      this.pendingCenter = null;
      // Рекурсивно, но без блокировки — запускаем асинхронно
      this.updatePosition(
        tileCenterLatLon(pending.x, pending.y, pending.z).lat,
        tileCenterLatLon(pending.x, pending.y, pending.z).lon,
      ).catch(() => {});
    }
  }

  /**
   * Загрузить один тайл (DEM + Satellite)
   */
  private async loadSingleTile(
    tile: TileCoord,
    signal: AbortSignal
  ): Promise<TerrainTileData | null> {
    const { x, y, z } = tile;

    try {
      // 1. DEM тайл
      const demKey = tileCacheKey('dem', z, x, y);
      let demBlob = await getTile(demKey);

      if (!demBlob) {
        const response = await fetch(terrainRgbUrl(this.token, z, x, y), {
          signal,
          cache: 'force-cache',
        });
        if (!response.ok) throw new Error(`DEM fetch failed: ${response.status}`);
        demBlob = await response.blob();
        putTile(demKey, demBlob, { source: 'dem', z, x, y }).catch(() => {});
      }

      const demImage = await createImageBitmap(demBlob);
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
      let satelliteBitmap: ImageBitmap | null = null;
      try {
        const satKey = tileCacheKey('sat', z, x, y);
        let satBlob = await getTile(satKey);

        if (!satBlob) {
          const response = await fetch(satelliteUrl(this.token, z, x, y), {
            signal,
            cache: 'force-cache',
          });
          if (response.ok) {
            satBlob = await response.blob();
            putTile(satKey, satBlob, { source: 'sat', z, x, y }).catch(() => {});
          }
        }

        if (satBlob) {
          satelliteBitmap = await createImageBitmap(satBlob);
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

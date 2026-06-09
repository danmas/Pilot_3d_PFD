/**
 * TerrainManager.ts — оркестрация загрузки и кэширования terrain тайлов.
 *
 * Синглтон: управляет запросами к Mapbox API, кэшированием,
 * rate limiting и отменой запросов при смене позиции.
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
} from './terrainTileUtils';
import { getTile, putTile } from './TerrainCache';
import type { TileCoord } from './terrainTileUtils';

export interface TerrainTileData {
  /** DEM высоты (метры, Float32Array) */
  heights: Float32Array;
  /** Спутниковая текстура как ImageBitmap или null */
  satelliteBitmap: ImageBitmap | null;
  /** Ширина тайла в пикселях */
  width: number;
  /** Высота тайла в пикселях */
  height: number;
  /** Размер тайла в World Units */
  worldUnits: number;
  /** Минимальная высота на тайле (м) */
  minElevation: number;
  /** Максимальная высота на тайле (м) */
  maxElevation: number;
}

export interface TileLoadProgress {
  /** Количество загруженных тайлов */
  loaded: number;
  /** Всего тайлов к загрузке */
  total: number;
}

type ProgressCallback = (progress: TileLoadProgress) => void;
type TileCallback = (coord: TileCoord, data: TerrainTileData) => void;

// Конфигурация по умолчанию
const CONFIG = {
  maxConcurrent: 6,
  fetchTimeoutMs: 8_000,
  zoom: DEFAULT_ZOOM,
};

class TerrainManagerImpl {
  private token: string = '';
  private abortController: AbortController | null = null;
  private pendingRequests = 0;
  private onTileReady: TileCallback | null = null;
  private onProgress: ProgressCallback | null = null;
  private totalTiles = 0;
  private loadedTiles = 0;

  /** Инициализация с Mapbox токеном */
  init(token: string): void {
    this.token = token;
    this.abortController?.abort();
    this.abortController = new AbortController();
  }

  /** Подписка на события готовности тайла */
  onTile(cb: TileCallback): void {
    this.onTileReady = cb;
  }

  /** Подписка на прогресс загрузки */
  onLoadProgress(cb: ProgressCallback): void {
    this.onProgress = cb;
  }

  /** Отмена всех текущих запросов */
  cancel(): void {
    this.abortController?.abort();
    this.abortController = new AbortController();
    this.pendingRequests = 0;
  }

  /**
   * Загрузить сетку тайлов вокруг заданных координат
   *
   * @param lat — широта
   * @param lon — долгота
   * @param gridSize — размер сетки (1 = 1×1, 2 = 2×2, 3 = 3×3 и т.д.)
   */
  async loadTileGrid(lat: number, lon: number, gridSize: number = 1): Promise<void> {
    if (!this.token) return;

    // Отменяем предыдущие запросы
    this.cancel();
    const signal = this.abortController!.signal;

    const center = latLonToTile(lat, lon, CONFIG.zoom);
    const halfGrid = Math.floor(gridSize / 2);

    // Собираем все тайлы сетки
    const tiles: TileCoord[] = [];
    for (let dx = -halfGrid; dx <= halfGrid; dx++) {
      for (let dy = -halfGrid; dy <= halfGrid; dy++) {
        tiles.push({
          x: center.x + dx,
          y: center.y + dy,
          z: CONFIG.zoom,
        });
      }
    }

    this.totalTiles = tiles.length;
    this.loadedTiles = 0;
    this.pendingRequests = tiles.length;

    // Загружаем с rate limiting
    const queue = [...tiles];
    const active: Promise<void>[] = [];

    const processNext = async (): Promise<void> => {
      while (queue.length > 0 && !signal.aborted) {
        const tile = queue.shift()!;
        try {
          const data = await this.loadSingleTile(tile, signal);
          if (data && !signal.aborted) {
            this.loadedTiles++;
            this.onTileReady?.(tile, data);
            this.onProgress?.({ loaded: this.loadedTiles, total: this.totalTiles });
          }
        } catch {
          // Пропускаем неудачные тайлы
        } finally {
          this.pendingRequests--;
        }
      }
    };

    // Запускаем параллельные воркеры
    const workerCount = Math.min(CONFIG.maxConcurrent, tiles.length);
    for (let i = 0; i < workerCount; i++) {
      active.push(processNext());
    }
    await Promise.allSettled(active);
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
        // Кэшируем (fire & forget)
        putTile(demKey, demBlob, { source: 'dem', z, x, y }).catch(() => {});
      }

      // Декодируем DEM
      const demImage = await createImageBitmap(demBlob);
      const canvas = document.createElement('canvas');
      canvas.width = demImage.width;
      canvas.height = demImage.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(demImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, demImage.width, demImage.height);
      demImage.close();

      const heights = decodeTerrainRGB(imageData);

      // Минимальная/максимальная высота
      let minElev = Infinity;
      let maxElev = -Infinity;
      for (let i = 0; i < heights.length; i++) {
        if (heights[i] < minElev) minElev = heights[i];
        if (heights[i] > maxElev) maxElev = heights[i];
      }

      // 2. Satellite тайл
      const satKey = tileCacheKey('sat', z, x, y);
      let satBlob = await getTile(satKey);
      let satelliteBitmap: ImageBitmap | null = null;

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

      // Размер тайла в WU
      const center = tileCenterLatLon(x, y, z);
      const wu = tileWorldUnits(z, center.lat);

      return {
        heights,
        satelliteBitmap,
        width: demImage.width,
        height: demImage.height,
        worldUnits: wu,
        minElevation: minElev,
        maxElevation: maxElev,
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return null; // Нормальная отмена
      }
      console.warn(`[TerrainManager] Failed to load tile ${z}/${x}/${y}:`, err);
      return null;
    }
  }

  /** Проверить, есть ли токен */
  get isReady(): boolean {
    return this.token.length > 0;
  }
}

/** Глобальный синглтон TerrainManager */
export const TerrainManager = new TerrainManagerImpl();

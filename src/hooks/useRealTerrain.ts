/**
 * useRealTerrain.ts — Hook для управления реальным ландшафтом с lazy загрузкой.
 *
 * Подписывается на телеметрию (lat/lon), вызывает TerrainManager.updatePosition()
 * и предоставляет массив загруженных тайлов для RealTerrainMesh.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { TerrainManager, type TerrainTileData } from '../components/Instruments/aircraft3d/terrain/TerrainManager';
import type { TileCoord } from '../components/Instruments/aircraft3d/terrain/terrainTileUtils';

export interface RealTerrainState {
  /** Все загруженные тайлы */
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }>;
  /** Идёт загрузка */
  loading: boolean;
  /** Прогресс загрузки */
  progress: { loaded: number; total: number } | null;
  /** Есть ли координаты (включён ли режим) */
  hasCoords: boolean;
  /** Ошибка */
  error: string | null;
  /** Количество загруженных тайлов */
  tileCount: number;
}

// Тестовые координаты (Альпы, Монблан)
const DEFAULT_LAT = 45.832;
const DEFAULT_LON = 6.865;

/**
 * Hook для lazy загрузки реального ландшафта
 */
export function useRealTerrain(
  lat: number | null | undefined,
  lon: number | null | undefined,
  enabled: boolean = false,
): RealTerrainState {
  const [tiles, setTiles] = useState<Array<{ coord: TileCoord; data: TerrainTileData }>>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastLatRef = useRef<number | null>(null);
  const lastLonRef = useRef<number | null>(null);
  const enabledRef = useRef(enabled);
  const updateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Инициализация TerrainManager с токеном
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (token) {
      TerrainManager.init(token);
    }
  }, []);

  // Подписка на добавление новых тайлов
  useEffect(() => {
    TerrainManager.onTile((coord, data) => {
      // Просто инвалидируем — всё равно читаем getAllTiles() по таймеру
      const all = TerrainManager.getAllTiles();
      // Sort spatially (by y then x) so that the array is in predictable raster order.
      // This makes midIdx / ref calculations in the mesh much more stable.
      const sorted = [...all].sort((a, b) => (a.coord.y - b.coord.y) || (a.coord.x - b.coord.x));
      setTiles(sorted);
    });
  }, []);

  // Debounced обновление позиции — не чаще 1 раза в 2 сек
  const scheduleUpdate = useCallback((currentLat: number, currentLon: number) => {
    if (!enabledRef.current || !TerrainManager.isReady) return;

    // Порог движения: ~50% тайла на zoom=14
    const TILE_LAT = 0.021; // ~2.3 км на zoom=14
    const TILE_LON = 0.043; // ~2.3 км на zoom=14
    const THRESHOLD_LAT = TILE_LAT * 0.4;
    const THRESHOLD_LON = TILE_LON * 0.4;

    if (lastLatRef.current !== null && lastLonRef.current !== null) {
      const dLat = Math.abs(currentLat - lastLatRef.current);
      const dLon = Math.abs(currentLon - lastLonRef.current);
      if (dLat < THRESHOLD_LAT && dLon < THRESHOLD_LON) {
        return; // Не сдвинулись достаточно
      }
    }

    lastLatRef.current = currentLat;
    lastLonRef.current = currentLon;

    // Debounce: не запускать updatePosition слишком часто
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }

    updateTimerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        await TerrainManager.updatePosition(currentLat, currentLon);
        const all = TerrainManager.getAllTiles();
        const sorted = [...all].sort((a, b) => (a.coord.y - b.coord.y) || (a.coord.x - b.coord.x));
        setTiles(sorted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Основной эффект
  useEffect(() => {
    enabledRef.current = enabled;

    if (!enabled || !TerrainManager.isReady) {
      TerrainManager.clearAll();
      setTiles([]);
      setLoading(false);
      setProgress(null);
      lastLatRef.current = null;
      lastLonRef.current = null;
      return;
    }

    const currentLat = lat ?? DEFAULT_LAT;
    const currentLon = lon ?? DEFAULT_LON;

    if (isFinite(currentLat) && isFinite(currentLon)) {
      scheduleUpdate(currentLat, currentLon);
    }

    // Периодическая проверка позиции каждые 5 сек
    const interval = setInterval(() => {
      if (!enabledRef.current) return;
      const clat = lat ?? DEFAULT_LAT;
      const clon = lon ?? DEFAULT_LON;
      if (isFinite(clat) && isFinite(clon)) {
        scheduleUpdate(clat, clon);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current);
    };
  }, [lat, lon, enabled, scheduleUpdate]);

  // Получаем прогресс из TerrainManager
  useEffect(() => {
    TerrainManager.onLoadProgress((p) => {
      setProgress(p);
    });
  }, []);

  return {
    tiles,
    loading,
    progress,
    hasCoords: enabled && TerrainManager.isReady && (lat !== null || lon !== null),
    error,
    tileCount: tiles.length,
  };
}

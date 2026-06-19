/**
 * useRealTerrain.ts — Hook для управления реальным ландшафтом с lazy загрузкой.
 *
 * Подписывается на телеметрию (lat/lon), вызывает TerrainManager.updatePosition()
 * и предоставляет массив загруженных тайлов для RealTerrainMesh.
 *
 * v2: дополнительно читает aircraftPosition напрямую через rAF —
 * это надёжно работает в обоих режимах FDM (Simple и Improved),
 * независимо от того, доходит ли lat/lon через frame prop.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { TerrainManager, type TerrainTileData } from '../components/Instruments/aircraft3d/terrain/TerrainManager';
import type { TileCoord } from '../components/Instruments/aircraft3d/terrain/terrainTileUtils';
import { aircraftPosition } from '../components/Instruments/aircraft3d/aircraftPosition';
import { SIM_REF_LAT, SIM_REF_LON } from '../components/Instruments/aircraft3d/flightModel';

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
  /** P0.1: текущий центр (из TerrainManager) */
  centerTile: TileCoord | null;
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
  const [centerTile, setCenterTile] = useState<TileCoord | null>(null);

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
      // P0.1: обновляем centerTile из TerrainManager
      setCenterTile(TerrainManager.getCurrentCenter());
    });
  }, []);

  // Debounced обновление позиции — не чаще 1 раза в 2 сек
  const scheduleUpdate = useCallback((currentLat: number, currentLon: number) => {
    if (!enabledRef.current || !TerrainManager.isReady) return;

    // Порог движения: ~25% тайла на zoom=14 (~580 м)
    const TILE_LAT = 0.021; // ~2.3 км на zoom=14
    const TILE_LON = 0.043; // ~2.3 км на zoom=14
    const THRESHOLD_LAT = TILE_LAT * 0.25;
    const THRESHOLD_LON = TILE_LON * 0.25;

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
        // P0.1: обновляем centerTile
        setCenterTile(TerrainManager.getCurrentCenter());
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

    // rAF цикл: читаем aircraftPosition напрямую и вычисляем lat/lon.
    // Это надёжно работает в обоих режимах FDM, т.к. aircraftPosition
    // обновляется в useFrame независимо от frame prop propagation.
    const METERS_PER_DEG_LAT = 111320;
    const cosRefLat = Math.cos(SIM_REF_LAT * Math.PI / 180);
    let rafId: number;
    let lastUpdateTime = 0;
    const MIN_UPDATE_INTERVAL = 500; // ms между проверками

    const checkPosition = () => {
      const now = performance.now();
      if (now - lastUpdateTime >= MIN_UPDATE_INTERVAL) {
        lastUpdateTime = now;
        // Вычисляем lat/lon из накопленного смещения
        const dxMeters = aircraftPosition.x * 40;   // восток → долгота
        const dnMeters = -aircraftPosition.z * 40;   // север → широта
        const simLat = SIM_REF_LAT + dnMeters / METERS_PER_DEG_LAT;
        const simLon = SIM_REF_LON + dxMeters / (METERS_PER_DEG_LAT * cosRefLat);

        if (isFinite(simLat) && isFinite(simLon)) {
          scheduleUpdate(simLat, simLon);
        }
      }
      rafId = requestAnimationFrame(checkPosition);
    };
    rafId = requestAnimationFrame(checkPosition);

    return () => {
      cancelAnimationFrame(rafId);
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
    centerTile,
  };
}

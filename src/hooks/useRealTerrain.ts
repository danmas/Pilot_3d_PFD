/**
 * useRealTerrain.ts — Hook для управления реальным ландшафтом.
 *
 * Подписывается на телеметрию (lat/lon), управляет TerrainManager,
 * и предоставляет данные тайла для RealTerrainMesh.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { TerrainManager, type TerrainTileData } from '../components/Instruments/aircraft3d/terrain/TerrainManager';
import type { TileCoord } from '../components/Instruments/aircraft3d/terrain/terrainTileUtils';

export interface RealTerrainState {
  /** Текущие данные тайла */
  tileData: TerrainTileData | null;
  /** Координаты загруженного тайла */
  tileCoord: TileCoord | null;
  /** Идёт загрузка */
  loading: boolean;
  /** Прогресс загрузки */
  progress: { loaded: number; total: number } | null;
  /** Есть ли координаты (включён ли режим) */
  hasCoords: boolean;
  /** Ошибка */
  error: string | null;
}

// Тестовые координаты (Шереметьево) — используются, если в телеметрии нет lat/lon
const DEFAULT_LAT = 55.972;
const DEFAULT_LON = 37.415;

/**
 * Hook для интеграции реального ландшафта
 *
 * @param lat — широта из телеметрии (может быть null/undefined)
 * @param lon — долгота из телеметрии
 * @param enabled — включён ли реальный ландшафт
 * @param gridSize — размер сетки тайлов (1 = 1×1, 2 = 2×2, 3 = 3×3)
 */
export function useRealTerrain(
  lat: number | null | undefined,
  lon: number | null | undefined,
  enabled: boolean = false,
  gridSize: number = 1
): RealTerrainState {
  const [tileData, setTileData] = useState<TerrainTileData | null>(null);
  const [tileCoord, setTileCoord] = useState<TileCoord | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastCoordsRef = useRef<string>('');
  const enabledRef = useRef(enabled);

  // Инициализация TerrainManager с токеном из .env
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
    if (token) {
      TerrainManager.init(token);
    }
  }, []);

  // Подписка на события TerrainManager
  useEffect(() => {
    TerrainManager.onTile((coord, data) => {
      setTileData(data);
      setTileCoord(coord);
    });
    TerrainManager.onLoadProgress((p) => {
      setProgress(p);
    });
  }, []);

  // Основной эффект: загрузка тайлов при изменении координат
  const loadTiles = useCallback(async (currentLat: number, currentLon: number) => {
    const coordsKey = `${currentLat.toFixed(4)}_${currentLon.toFixed(4)}`;
    if (coordsKey === lastCoordsRef.current) return;
    lastCoordsRef.current = coordsKey;

    setLoading(true);
    setError(null);

    try {
      await TerrainManager.loadTileGrid(currentLat, currentLon, gridSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [gridSize]);

  useEffect(() => {
    enabledRef.current = enabled;

    if (!enabled || !TerrainManager.isReady) {
      setTileData(null);
      setTileCoord(null);
      setLoading(false);
      setProgress(null);
      return;
    }

    const currentLat = lat ?? DEFAULT_LAT;
    const currentLon = lon ?? DEFAULT_LON;

    if (isFinite(currentLat) && isFinite(currentLon)) {
      loadTiles(currentLat, currentLon);
    }
  }, [lat, lon, enabled, loadTiles]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      TerrainManager.cancel();
    };
  }, []);

  return {
    tileData,
    tileCoord,
    loading,
    progress,
    hasCoords: enabled && TerrainManager.isReady && (lat !== null || lon !== null),
    error,
  };
}

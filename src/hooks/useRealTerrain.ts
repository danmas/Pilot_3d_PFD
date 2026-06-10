/**
 * useRealTerrain — React hook for real terrain lifecycle.
 * Manages TerrainManager singleton, subscribes to tile changes,
 * and triggers tile loading based on lat/lon from telemetry.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  getTerrainManager,
  createTerrainManager,
  type TerrainState,
} from '../components/Instruments/aircraft3d/terrain/TerrainManager';

const DEFAULT_LAT = 55.9726; // Sheremetyevo
const DEFAULT_LON = 37.4146;
const TILE_CHANGE_THRESHOLD_METERS = 500; // trigger new tile after 500m movement

interface UseRealTerrainOptions {
  /** Mapbox API token */
  token: string;
  /** Current lat from telemetry (falls back to DEFAULT_LAT) */
  lat?: number;
  /** Current lon from telemetry (falls back to DEFAULT_LON) */
  lon?: number;
  /** Enable terrain loading */
  enabled: boolean;
}

interface UseRealTerrainResult {
  state: TerrainState;
  /** Manually trigger tile load for given coordinates */
  setPosition: (lat: number, lon: number) => void;
}

export function useRealTerrain(options: UseRealTerrainOptions): UseRealTerrainResult {
  const { token, lat, lon, enabled } = options;
  const [state, setState] = useState<TerrainState>(() => {
    // Lazy-init manager on first render
    const mgr = createTerrainManager(token);
    return mgr.getState();
  });

  const lastLat = useRef(DEFAULT_LAT);
  const lastLon = useRef(DEFAULT_LON);
  const loadingRef = useRef(false);

  const setPosition = useCallback(
    (newLat: number, newLon: number) => {
      if (!enabled) return;
      const mgr = getTerrainManager();
      if (!mgr) return;

      // Throttle — only reload if moved significantly
      const dLat = Math.abs(newLat - lastLat.current) * 111320;
      const dLon =
        Math.abs(newLon - lastLon.current) *
        111320 *
        Math.cos((newLat * Math.PI) / 180);
      const dist = Math.sqrt(dLat * dLat + dLon * dLon);

      if (dist < TILE_CHANGE_THRESHOLD_METERS && lastLat.current !== DEFAULT_LAT) {
        return;
      }

      lastLat.current = newLat;
      lastLon.current = newLon;

      if (loadingRef.current) return;
      loadingRef.current = true;
      mgr.setAnchor(newLat, newLon).finally(() => {
        loadingRef.current = false;
      });
    },
    [enabled],
  );

  // Subscribe to manager state changes
  useEffect(() => {
    const mgr = getTerrainManager();
    if (!mgr) return;
    const unsub = mgr.subscribe((s) => setState(s));
    return unsub;
  }, [token]);

  // Trigger initial load when enabled
  useEffect(() => {
    if (!enabled) return;
    const useLat = lat ?? DEFAULT_LAT;
    const useLon = lon ?? DEFAULT_LON;
    setPosition(useLat, useLon);
  }, [enabled, lat, lon, setPosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      const mgr = getTerrainManager();
      if (mgr) mgr.dispose();
    };
  }, []);

  return { state, setPosition };
}

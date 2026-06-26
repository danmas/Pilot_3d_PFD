/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * P0.1: Рефакторинг. Вместо создания всей геометрии в useMemo,
 * рендерит список TerrainTile компонентов. При добавлении тайла
 * создаётся геометрия только для него, а не для всей сетки.
 *
 * v2.14.2:
 *   - refX/refY = latLonToTile(locationRef.lat/lon) — фиксированная точка
 *   - Красный конус (0,0) всегда соответствует locationRef на карте
 *   - fixedRef сбрасывается только при смене локации (locationRef изменился)
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, tileCenterLatLon, tileWorldUnits, getTileCornersLatLon, latLonToTile, DEFAULT_ZOOM } from './terrainTileUtils';
import { TerrainTile } from './TerrainTile';
import { locationRef } from '../aircraftPosition';

interface RealTerrainMeshProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  opacity?: number;
  mode?: 'realistic' | 'schematic';
  centerTile?: TileCoord | null;
  selectedTile?: TileCoord | null;
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  opacity = 1,
  mode = 'realistic',
  centerTile,
  selectedTile = null,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Fixed reference: always based on locationRef (the fixed geographic point).
  // Red cone at (0,0) in WorldGroup corresponds to locationRef.lat/lon on the map.
  // Only resets when the user switches location (locationRef changes).
  const fixedRef = useRef<{ refX: number; refY: number; tileWU: number } | null>(null);

  const refData = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    // Reference tile is always based on locationRef (the fixed geographic point).
    // This ensures the red cone at (0,0) in WorldGroup always corresponds to
    // locationRef.lat/lon on the map, regardless of aircraft position.
    const refTile = latLonToTile(locationRef.lat, locationRef.lon, DEFAULT_ZOOM);

    // Reset fixedRef if locationRef has changed (user switched location)
    if (fixedRef.current) {
      if (fixedRef.current.refX !== refTile.x || fixedRef.current.refY !== refTile.y) {
        fixedRef.current = null;
      }
    }

    if (!fixedRef.current) {
      const tileWU = tileWorldUnits(DEFAULT_ZOOM, locationRef.lat) || 200;
      fixedRef.current = { refX: refTile.x, refY: refTile.y, tileWU };
    }

    const { refX, refY, tileWU } = fixedRef.current;

    let globalMinElev = Infinity;
    for (const { data } of tiles) {
      if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
    }
    if (!isFinite(globalMinElev)) globalMinElev = 0;

    return { refX, refY, tileWU, globalMinElev };
  }, [tiles]);

  const triangleStats = useMemo(() => {
    if (!tiles || !refData) return null;
    let total = 0;
    for (const { data } of tiles) {
      const maxSegX = mode === 'schematic' ? 16 : 32;
      const maxSegZ = mode === 'schematic' ? 32 : 64;
      const segX = Math.min(data.width, Math.max(maxSegX, 8));
      const segZ = Math.min(data.height, Math.max(maxSegZ, 8));
      total += segX * segZ * 2;
    }
    return total;
  }, [tiles, mode, refData]);

  React.useEffect(() => {
    if (triangleStats !== null) {
      console.log(
        `[RealTerrainMesh] total tiles: ${tiles!.length}, ` +
        `triangles: ${triangleStats.toLocaleString()} (mode: ${mode})`
      );
    }
  }, [tiles?.length, triangleStats, mode]);

  // ── Геометрия рамки выделенного тайла (до early return!) ──
  const selectionOutline = useMemo(() => {
    if (!selectedTile || !refData) return null;
    const halfW = refData.tileWU / 2;
    // 4 ребра квадрата: NW→NE, NE→SE, SE→SW, SW→NW
    const positions = new Float32Array([
      -halfW, 0, -halfW,  halfW, 0, -halfW,
       halfW, 0, -halfW,  halfW, 0,  halfW,
       halfW, 0,  halfW, -halfW, 0,  halfW,
      -halfW, 0,  halfW, -halfW, 0, -halfW,
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [selectedTile, refData]);

  // Освобождаем геометрию рамки
  useEffect(() => {
    return () => { selectionOutline?.dispose(); };
  }, [selectionOutline]);

  // ── Логирование на сервер при выборе тайла ──
  useEffect(() => {
    if (!selectedTile || !refData) return;
    const { refX, refY, tileWU } = refData;
    const halfW = tileWU / 2;
    const offsetX = (selectedTile.x - refX) * tileWU;
    const offsetZ = (selectedTile.y - refY) * tileWU;
    const corners = getTileCornersLatLon(selectedTile.x, selectedTile.y, selectedTile.z);
    const sceneCorners = [
      { x: offsetX - halfW, z: offsetZ - halfW },  // NW
      { x: offsetX + halfW, z: offsetZ - halfW },  // NE
      { x: offsetX + halfW, z: offsetZ + halfW },  // SE
      { x: offsetX - halfW, z: offsetZ + halfW },  // SW
    ];
    fetch('/api/terrain/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'SCENE-TILE-SELECTED',
        coord: selectedTile,
        corners,
        sceneCorners,
        ref: { x: refX, y: refY },
        tileWU,
        offset: { x: offsetX, z: offsetZ },
        source: 'scene',
      }),
    }).catch(() => {});
    console.log('[scene] tile selected:', selectedTile, { offsetX, offsetZ, tileWU, corners, sceneCorners });
  }, [selectedTile, refData]);

  if (!tiles || tiles.length === 0 || !refData) return null;

  const { refX, refY, tileWU, globalMinElev } = refData;

  return (
    <group ref={groupRef}>
      {tiles.map(({ coord, data }) => (
        <TerrainTile
          key={`${coord.z}/${coord.x}/${coord.y}-${mode}`}
          coord={coord}
          data={data}
          mode={mode}
          tileWU={tileWU}
          refX={refX}
          refY={refY}
          globalMinElev={globalMinElev}
        />
      ))}
      {/* Рамка выделенного тайла (синяя) */}
      {selectionOutline && selectedTile && (() => {
        const offsetX = (selectedTile.x - refX) * tileWU;
        const offsetZ = (selectedTile.y - refY) * tileWU;
        return (
          <lineSegments geometry={selectionOutline} position={[offsetX, -4, offsetZ]}>
            <lineBasicMaterial color="#3b82f6" linewidth={2} />
          </lineSegments>
        );
      })()}
    </group>
  );
};

export { RealTerrainMesh };

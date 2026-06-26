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
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, tileCenterLatLon, tileWorldUnits, getTileCornersLatLon, latLonToTile, DEFAULT_ZOOM } from './terrainTileUtils';
import TerrainTile, { createTileGeometry } from './TerrainTile';
import { locationRef } from '../aircraftPosition';

interface RealTerrainMeshProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  opacity?: number;
  mode?: 'realistic' | 'schematic';
  centerTile?: TileCoord | null;
  selectedTile?: TileCoord | null;
}

const SCHEMATIC_SEG_X = 16;
const SCHEMATIC_SEG_Z = 32;

const schematicMaterial = new THREE.MeshStandardMaterial({
  color: '#22c55e',
  roughness: 0.5,
  metalness: 0.0,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  wireframe: true,
});

interface MergedSchematicTerrainProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }>;
  refData: { refX: number; refY: number; tileWU: number; globalMinElev: number };
}

/**
 * Один mesh для всех schematic-тайлов.
 * Геометрия наращивается инкрементально при добавлении тайла;
 * при удалении тайла перестраивается с нуля.
 */
const MergedSchematicTerrain: React.FC<MergedSchematicTerrainProps> = ({ tiles, refData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.BufferGeometry | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (tiles.length === 0) {
      geomRef.current?.dispose();
      geomRef.current = null;
      keysRef.current.clear();
      if (meshRef.current) {
        meshRef.current.geometry = new THREE.BufferGeometry();
      }
      return;
    }

    const { tileWU, refX, refY, globalMinElev } = refData;
    const currentKeys = new Set(tiles.map(({ coord }) => `${coord.z}/${coord.x}/${coord.y}`));
    const added = tiles.filter(({ coord }) => !keysRef.current.has(`${coord.z}/${coord.x}/${coord.y}`));
    const removedCount = Array.from(keysRef.current).filter((k) => !currentKeys.has(k)).length;

    const buildGeometries = (list: Array<{ coord: TileCoord; data: TerrainTileData }>) =>
      list.map(({ coord, data }) =>
        createTileGeometry(data, coord, tileWU, refX, refY, globalMinElev, SCHEMATIC_SEG_X, SCHEMATIC_SEG_Z)
      );

    let nextGeom: THREE.BufferGeometry | null = null;

    if (removedCount > 0 || !geomRef.current) {
      const geoms = buildGeometries(tiles);
      nextGeom = geoms.length > 0 ? mergeGeometries(geoms) : null;
      geoms.forEach((g) => g.dispose());
    } else if (added.length > 0) {
      const newGeoms = buildGeometries(added);
      if (newGeoms.length > 0) {
        nextGeom = geomRef.current ? mergeGeometries([geomRef.current, ...newGeoms]) : mergeGeometries(newGeoms);
      }
      newGeoms.forEach((g) => g.dispose());
    }

    if (nextGeom) {
      geomRef.current?.dispose();
      geomRef.current = nextGeom;
      if (meshRef.current) {
        meshRef.current.geometry = nextGeom;
      }
    }

    keysRef.current = currentKeys;
  }, [tiles, refData]);

  useEffect(() => {
    return () => {
      geomRef.current?.dispose();
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <mesh
      ref={meshRef}
      material={schematicMaterial}
      position={[0, -6, 0]}
      frustumCulled={false}
    />
  );
};

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
      {mode === 'schematic' ? (
        <MergedSchematicTerrain tiles={tiles} refData={refData} />
      ) : (
        tiles.map(({ coord, data }) => (
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
        ))
      )}
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

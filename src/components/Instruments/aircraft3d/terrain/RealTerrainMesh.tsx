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
import {
  type TileCoord,
  type TerrainLodLevel,
  tileCenterLatLon,
  tileWorldUnits,
  getTileCornersLatLon,
  latLonToTile,
  DEFAULT_ZOOM,
  getTerrainLod,
} from './terrainTileUtils';
import TerrainTile, { createTileGeometry } from './TerrainTile';
import { locationRef } from '../aircraftPosition';
import sceneConfig from '@/scene-config.json';

interface RealTerrainMeshProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  opacity?: number;
  mode?: 'realistic' | 'schematic';
  centerTile?: TileCoord | null;
  selectedTile?: TileCoord | null;
}

const terrainConfig = (sceneConfig as any).terrain ?? { loadRadius: 3, keepRadius: 4 };
const LOD_LEVELS: TerrainLodLevel[] = terrainConfig.lod ?? [
  { ring: 2, segX: 32, segZ: 64, textureScale: 1.0 },
  { ring: 5, segX: 16, segZ: 32, textureScale: 0.5 },
  { ring: 7, segX: 8, segZ: 16, textureScale: 0.25 },
];

const schematicMaterial = new THREE.MeshStandardMaterial({
  color: '#22c55e',
  roughness: 0.5,
  metalness: 0.0,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
  wireframe: true,
});

interface MergedSchematicLodGroupProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }>;
  segX: number;
  segZ: number;
  refData: { refX: number; refY: number; tileWU: number; globalMinElev: number };
}

/**
 * Один mesh для группы schematic-тайлов одного уровня LOD.
 * Тайлы с одинаковым segX/segZ объединяются в один BufferGeometry,
 * что даёт один draw call на уровень LOD.
 */
const MergedSchematicLodGroup: React.FC<MergedSchematicLodGroupProps> = ({ tiles, segX, segZ, refData }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geom = useMemo(() => {
    if (tiles.length === 0) return null;
    const { tileWU, refX, refY, globalMinElev } = refData;
    const geoms = tiles.map(({ coord, data }) => {
      const geo = createTileGeometry(data, coord, tileWU, refX, refY, globalMinElev, segX, segZ);
      const offsetX = geo.userData.offsetX as number;
      const offsetZ = geo.userData.offsetZ as number;
      geo.translate(offsetX, 0, offsetZ);
      return geo;
    });
    const merged = mergeGeometries(geoms);
    geoms.forEach((g) => g.dispose());
    return merged;
  }, [tiles, segX, segZ, refData]);

  useEffect(() => {
    if (meshRef.current && geom) {
      meshRef.current.geometry = geom;
    }
  }, [geom]);

  useEffect(() => {
    return () => { geom?.dispose(); };
  }, [geom]);

  if (!geom) return null;

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

  const tileLods = useMemo(() => {
    if (!tiles) return [];
    return tiles.map(({ coord }) => getTerrainLod(coord, centerTile, LOD_LEVELS));
  }, [tiles, centerTile]);

  const triangleStats = useMemo(() => {
    if (!tiles || !refData) return null;
    let total = 0;
    for (let i = 0; i < tiles.length; i++) {
      const { data } = tiles[i];
      const lod = tileLods[i];
      const segX = Math.min(data.width, Math.max(lod?.segX ?? (mode === 'schematic' ? 16 : 32), 8));
      const segZ = Math.min(data.height, Math.max(lod?.segZ ?? (mode === 'schematic' ? 32 : 64), 8));
      total += segX * segZ * 2;
    }
    return total;
  }, [tiles, tileLods, mode, refData]);

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

  // Стабильные группы тайлов по уровням LOD — чтобы merged-геометрия не перестраивалась каждый рендер.
  const schematicGroups = useMemo(() => {
    if (mode !== 'schematic') return [] as Array<{ level: TerrainLodLevel; tiles: Array<{ coord: TileCoord; data: TerrainTileData }> }>;
    const groups = new Map<string, { level: TerrainLodLevel; tiles: Array<{ coord: TileCoord; data: TerrainTileData }> }>();
    tiles.forEach((t, i) => {
      const lod = tileLods[i];
      const key = `${lod.segX}x${lod.segZ}`;
      if (!groups.has(key)) {
        groups.set(key, { level: lod, tiles: [] });
      }
      groups.get(key)!.tiles.push(t);
    });
    return Array.from(groups.values());
  }, [mode, tiles, tileLods]);

  return (
    <group ref={groupRef}>
      {mode === 'schematic' ? (
        <>
          {schematicGroups.map(({ level, tiles: groupTiles }) => (
            <MergedSchematicLodGroup
              key={`schematic-${level.segX}x${level.segZ}`}
              tiles={groupTiles}
              segX={level.segX}
              segZ={level.segZ}
              refData={refData}
            />
          ))}
        </>
      ) : (
        tiles.map(({ coord, data }, i) => {
          const lod = tileLods[i];
          return (
            <TerrainTile
              key={`${coord.z}/${coord.x}/${coord.y}-${mode}-${lod.segX}x${lod.segZ}`}
              coord={coord}
              data={data}
              mode={mode}
              segX={lod.segX}
              segZ={lod.segZ}
              textureScale={lod.textureScale}
              tileWU={tileWU}
              refX={refX}
              refY={refY}
              globalMinElev={globalMinElev}
            />
          );
        })
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

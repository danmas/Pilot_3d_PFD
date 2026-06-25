/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * P0.1: Рефакторинг. Вместо создания всей геометрии в useMemo,
 * рендерит список TerrainTile компонентов. При добавлении тайла
 * создаётся геометрия только для него, а не для всей сетки.
 *
 * v2.14.1:
 *   - tileWU = baseTileSize (реальный размер 1×, синхронизация с FDM)
 *   - Центр по centerTile или медиане
 *   - fixedRef фиксируется при загрузке, не сбрасывается при полёте
 *     (только при смене локации >8 тайлов)
 */

import React, { useMemo, useRef } from 'react';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, tileCenterLatLon, tileWorldUnits } from './terrainTileUtils';
import { TerrainTile } from './TerrainTile';

interface RealTerrainMeshProps {
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  opacity?: number;
  mode?: 'realistic' | 'schematic';
  centerTile?: TileCoord | null;
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  opacity = 1,
  mode = 'realistic',
  centerTile,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Fixed reference: вычисляется при первой загрузке тайлов
  // и НЕ меняется при полёте (только при смене локации >8 тайлов).
  // Все тайлы позиционируются относительно этого фиксированного ref.
  // WorldGroup сдвигает весь мир через -aircraftPosition независимо.
  const fixedRef = useRef<{ refX: number; refY: number; tileWU: number } | null>(null);

  const refData = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    // Сброс fixedRef только при смене локации (далеко ушли от старого central tile)
    if (fixedRef.current && centerTile) {
      const dx = Math.abs(centerTile.x - fixedRef.current.refX);
      const dy = Math.abs(centerTile.y - fixedRef.current.refY);
      if (dx > 8 || dy > 8) {
        fixedRef.current = null;
      }
    }

    if (!fixedRef.current) {
      let refX: number;
      let refY: number;
      let tileWU: number;

      if (centerTile) {
        refX = centerTile.x;
        refY = centerTile.y;
        const centerLatLon = tileCenterLatLon(centerTile.x, centerTile.y, centerTile.z);
        const baseTileSize = tileWorldUnits(centerTile.z, centerLatLon.lat);
        tileWU = baseTileSize > 0 ? baseTileSize : 200; // 1× = синхронизация с FDM
      } else {
        const xs = tiles.map(t => t.coord.x).sort((a, b) => a - b);
        const ys = tiles.map(t => t.coord.y).sort((a, b) => a - b);
        refX = xs[Math.floor(xs.length / 2)];
        refY = ys[Math.floor(ys.length / 2)];
        const midIdx = Math.floor(tiles.length / 2);
        const baseTileSize = tiles[midIdx].data.worldUnits;
        tileWU = baseTileSize > 0 ? baseTileSize : 200;
      }

      fixedRef.current = { refX, refY, tileWU };
    }

    const { refX, refY, tileWU } = fixedRef.current;

    let globalMinElev = Infinity;
    for (const { data } of tiles) {
      if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
    }
    if (!isFinite(globalMinElev)) globalMinElev = 0;

    return { refX, refY, tileWU, globalMinElev };
  }, [tiles, centerTile]);

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
    </group>
  );
};

export { RealTerrainMesh };

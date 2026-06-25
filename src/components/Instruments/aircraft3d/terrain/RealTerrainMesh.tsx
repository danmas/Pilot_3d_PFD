/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * P0.1: Рефакторинг. Вместо создания всей геометрии в useMemo,
 * рендерит список TerrainTile компонентов. При добавлении тайла
 * создаётся геометрия только для него, а не для всей сетки.
 *
 * Версия v2.12.1:
 *   - tileWU = baseTileSize * 2 (единый размер для всей сетки)
 *   - Центр по centerTile или медиане
 *   - offsetZ без инверсии знака
 *   - UV: 1 - v (flip)
 */

import React, { useMemo, useRef } from 'react';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, tileCenterLatLon, tileWorldUnits } from './terrainTileUtils';
import { TerrainTile } from './TerrainTile';

interface RealTerrainMeshProps {
  /** Массив тайлов с координатами */
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  /** Прозрачность */
  opacity?: number;
  /** Режим */
  mode?: 'realistic' | 'schematic';
  /** Опорный тайл центра (из TerrainManager.currentCenter). Используется для стабильного ref. */
  centerTile?: TileCoord | null;
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  opacity = 1,
  mode = 'realistic',
  centerTile,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Фиксированный референс — обновляется при смене центра, чтобы тайлы
  // всегда были центрированы вокруг самолёта. Без этого возникает
  // двойной сдвиг: offset + WorldGroup-translation.
  const refData = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    let refX: number;
    let refY: number;
    let tileWU: number;

    if (centerTile) {
      refX = centerTile.x;
      refY = centerTile.y;
      const centerLatLon = tileCenterLatLon(centerTile.x, centerTile.y, centerTile.z);
      const baseTileSize = tileWorldUnits(centerTile.z, centerLatLon.lat);
      tileWU = baseTileSize > 0 ? baseTileSize * 2 : 200;
    } else {
      const xs = tiles.map(t => t.coord.x).sort((a, b) => a - b);
      const ys = tiles.map(t => t.coord.y).sort((a, b) => a - b);
      refX = xs[Math.floor(xs.length / 2)];
      refY = ys[Math.floor(ys.length / 2)];
      const midIdx = Math.floor(tiles.length / 2);
      const baseTileSize = tiles[midIdx].data.worldUnits;
      tileWU = baseTileSize > 0 ? baseTileSize * 2 : 200;
    }

    let globalMinElev = Infinity;
    for (const { data } of tiles) {
      if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
    }
    if (!isFinite(globalMinElev)) globalMinElev = 0;

    return { refX, refY, tileWU, globalMinElev };
  }, [tiles, centerTile]);

  // Подсчёт и логирование треугольников
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

  // Логируем при изменении
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

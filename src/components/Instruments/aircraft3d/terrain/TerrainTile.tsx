/**
 * TerrainTile.tsx — R3F компонент одного тайла рельефа.
 *
 * P0.1: вынесен из RealTerrainMesh.useMemo в отдельный React-компонент с React.memo.
 * Каждый тайл создаёт свою геометрию только при первом монтировании.
 * При добавлении/удалении тайлов React сам управляет mount/unmount.
 *
 * Ключ: `${coord.z}/${coord.x}/${coord.y}-${mode}` — геометрия пересоздаётся
 * только при смене режима (realistic ↔ schematic).
 */

import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, sampleHeightBilinear } from './terrainTileUtils';

interface TerrainTileProps {
  /** Координаты тайла */
  coord: TileCoord;
  /** Данные (высоты, спутник, min/max) */
  data: TerrainTileData;
  /** Режим отображения */
  mode: 'realistic' | 'schematic';
  /** Единый размер тайла в World Units */
  tileWU: number;
  /** Референсные координаты центра сетки */
  refX: number;
  refY: number;
  /** Глобальный минимум высот по всей сетке (для стыковки) */
  globalMinElev: number;
}

/**
 * Создаёт BufferGeometry для одного тайла. Чистая функция — удобно тестировать.
 */
function createTileGeometry(
  data: TerrainTileData,
  coord: TileCoord,
  tileWU: number,
  refX: number,
  refY: number,
  globalMinElev: number,
  segX: number,
  segZ: number,
): THREE.BufferGeometry {
  const { x, y } = coord;

  const halfW = tileWU / 2;
  const offsetX = (x - refX) * tileWU;
  const offsetZ = (y - refY) * tileWU;

  const geo = new THREE.BufferGeometry();

  const positions = new Float32Array((segX + 1) * (segZ + 1) * 3);
  const uvs = new Float32Array((segX + 1) * (segZ + 1) * 2);
  const indices: number[] = [];

  const stepX = tileWU / segX;
  const stepZ = tileWU / segZ;

  let idx = 0;
  for (let iz = 0; iz <= segZ; iz++) {
    for (let ix = 0; ix <= segX; ix++) {
      const px = -halfW + ix * stepX;
      const pz = -halfW + iz * stepZ;

      const u = ix / segX;
      const v = iz / segZ;
      let h = sampleHeightBilinear(data.heights, data.width, data.height, u, v);
      if (!isFinite(h) || isNaN(h)) h = 0;
      const hWu = (h - globalMinElev) / 40;

      positions[idx * 3] = px;
      positions[idx * 3 + 1] = hWu;
      positions[idx * 3 + 2] = pz;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = 1 - v;
      idx++;
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = iz * (segX + 1) + ix + 1;
      const c = (iz + 1) * (segX + 1) + ix;
      const d = (iz + 1) * (segX + 1) + ix + 1;
      indices.push(a, b, c);
      indices.push(b, d, c);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Сохраняем offset в userData для позиционирования
  geo.userData.offsetX = offsetX;
  geo.userData.offsetZ = offsetZ;

  return geo;
}

/**
 * Создаёт материал для одного тайла.
 */
function createTileMaterial(
  data: TerrainTileData,
  mode: 'realistic' | 'schematic',
): THREE.MeshStandardMaterial {
  if (mode === 'schematic') {
    return new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.5,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      wireframe: true,
    });
  }

  // Realistic mode
  if (data.satelliteBitmap && data.satelliteBitmap.width > 0) {
    // ImageBitmap нельзя напрямую в CanvasTexture — он transfer'ится в WebGL
    // и обнуляется, ломая mipmap'ы. Рисуем на canvas как для DEM.
    const canvas = document.createElement('canvas');
    canvas.width = data.satelliteBitmap.width;
    canvas.height = data.satelliteBitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(data.satelliteBitmap, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;

    return new THREE.MeshStandardMaterial({
      map: tex,
      color: '#ffffff',
      roughness: 0.7,
      metalness: 0.0,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
    });
  }

  // Fallback — красный (нет спутника)
  return new THREE.MeshStandardMaterial({
    color: '#ff3333',
    roughness: 0.7,
    metalness: 0.0,
    transparent: true,
    opacity: 1,
    side: THREE.DoubleSide,
  });
}

const TerrainTile: React.FC<TerrainTileProps> = ({
  coord,
  data,
  mode,
  tileWU,
  refX,
  refY,
  globalMinElev,
}) => {
  // P0: разные сегменты для разных режимов
  const maxSegX = mode === 'schematic' ? 16 : 32;
  const maxSegZ = mode === 'schematic' ? 32 : 64;
  const segX = Math.min(data.width, Math.max(maxSegX, 8));
  const segZ = Math.min(data.height, Math.max(maxSegZ, 8));

  const geo = useMemo(
    () => createTileGeometry(data, coord, tileWU, refX, refY, globalMinElev, segX, segZ),
    // Пересоздавать только при смене режима или координат
    [coord.z, coord.x, coord.y, mode, tileWU, refX, refY, globalMinElev, segX, segZ],
  );

  const mat = useMemo(
    () => createTileMaterial(data, mode),
    [mode, data.satelliteBitmap],
  );

  // Освобождаем GPU-ресурсы при размонтировании тайла (geometry + material + texture)
  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
      const tex = (mat as THREE.MeshStandardMaterial).map;
      if (tex) tex.dispose();
    };
  }, [geo, mat]);

  return (
    <mesh
      geometry={geo}
      material={mat}
      position={[geo.userData.offsetX as number, -6, geo.userData.offsetZ as number]}
      frustumCulled={mode !== 'schematic'}
    />
  );
};

export { TerrainTile, createTileGeometry, createTileMaterial };
export default React.memo(TerrainTile);

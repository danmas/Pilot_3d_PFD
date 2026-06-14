/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * Принимает массив загруженных тайлов и создаёт PlaneGeometry для каждого
 * с displacement map из DEM + спутниковой текстурой.
 *
 * Позиционирование: все тайлы используют единый размер (worldUnits центрального тайла)
 * и стыкуются по XZ без зазоров.
 *
 * Версия v2.9.4 — tile seam system:
 *   - tileWU = baseTileSize * 2 (единый размер для всей сетки)
 *   - Центр по midIdx (центр массива)
 *   - offsetZ без инверсии знака
 *   - UV: 1 - v (flip)
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';
import { type TileCoord, tileCenterLatLon, tileWorldUnits, sampleHeightBilinear } from './terrainTileUtils';

interface RealTerrainMeshProps {
  /** Массив тайлов с координатами */
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  /** Прозрачность */
  opacity?: number;
  /** Режим */
  mode?: 'realistic' | 'schematic';
  /** Опорный тайл центра (из TerrainManager.currentCenter). Используется для стабильного ref вместо midIdx. */
  centerTile?: TileCoord | null;
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  opacity = 1,
  mode = 'realistic',
  centerTile,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  console.log('[RealTerrainMesh] render, tiles count:', tiles?.length ?? 0, 'mode:', mode);

  const meshes = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    const group = new THREE.Group();

    // Стабильный референс: используем centerTile координаты НАПРЯМУЮ.
    // Это гарантирует, что refX/refY не зависят от порядка или количества тайлов в массиве.
    // Раньше refX/refY брались из tiles[midIdx].coord, что «прыгало» при каждом изменении tiles.
    let refX: number;
    let refY: number;
    let tileWU: number;

    if (centerTile) {
      refX = centerTile.x;
      refY = centerTile.y;
      // Вычисляем worldUnits из координат centerTile — стабильно, не зависит от содержимого массива tiles
      const centerLatLon = tileCenterLatLon(centerTile.x, centerTile.y, centerTile.z);
      const baseTileSize = tileWorldUnits(centerTile.z, centerLatLon.lat);
      tileWU = baseTileSize > 0 ? baseTileSize * 2 : 200;
    } else {
      // Fallback: если centerTile не задан, используем медиану координат
      const xs = tiles.map(t => t.coord.x).sort((a, b) => a - b);
      const ys = tiles.map(t => t.coord.y).sort((a, b) => a - b);
      refX = xs[Math.floor(xs.length / 2)];
      refY = ys[Math.floor(ys.length / 2)];
      const midIdx = Math.floor(tiles.length / 2);
      const baseTileSize = tiles[midIdx].data.worldUnits;
      tileWU = baseTileSize > 0 ? baseTileSize * 2 : 200;
    }

    console.log('[RealTerrainMesh] tileWU:', tileWU, 'refX:', refX, 'refY:', refY, 'centerTile:', centerTile);

    // Глобальный minElevation для ВСЕЙ сетки — чтобы тайлы стыковались без щелей
    let globalMinElev = Infinity;
    for (const { data } of tiles) {
      if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
    }
    if (!isFinite(globalMinElev)) globalMinElev = 0;

    // Общий материал (schematic / wireframe)
    const defaultMaterial = mode === 'schematic'
      ? new THREE.MeshStandardMaterial({
          color: '#22c55e',
          roughness: 0.5,
          metalness: 0.0,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
          wireframe: true,
        })
      : null;

    const halfW = tileWU / 2;

    // Хранилище для статистики
    let totalTriangles = 0;

    for (const { coord, data } of tiles) {
      const { x, y, z } = coord;
      // P0: сниженные сегменты — реалистик 32×64, схематик 16×32
      const maxSegX = mode === 'schematic' ? 16 : 32;
      const maxSegZ = mode === 'schematic' ? 32 : 64;
      const segX = Math.min(data.width, Math.max(maxSegX, 8));
      const segZ = Math.min(data.height, Math.max(maxSegZ, 8));

      if (!segX || !segZ || !isFinite(tileWU)) continue;

      // Смещение тайла в сетке: соседние тайлы стыкуются строго впритык
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
          // P0: bilinear вместо nearest-neighbour
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

      try {
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();
      } catch (err) {
        console.error('[RealTerrainMesh] buffer error:', err);
        continue;
      }

      // Материал тайла
      let tileMaterial = defaultMaterial;
      if (mode === 'realistic') {
        if (data.satelliteBitmap) {
          const tex = new THREE.CanvasTexture(
            data.satelliteBitmap as unknown as HTMLCanvasElement
          );
          tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;

          tileMaterial = new THREE.MeshStandardMaterial({
            map: tex,
            color: '#ffffff',
            roughness: 0.7,
            metalness: 0.0,
            transparent: true,
            opacity: opacity < 1 ? opacity : 1,
            side: THREE.DoubleSide,
          });
        } else {
          tileMaterial = new THREE.MeshStandardMaterial({
            color: '#ff3333',
            roughness: 0.7,
            metalness: 0.0,
            transparent: true,
            opacity: opacity < 1 ? opacity : 1,
            side: THREE.DoubleSide,
          });
        }
      }

      const mesh = new THREE.Mesh(geo, tileMaterial);
      mesh.position.set(offsetX, -6, offsetZ);
      // P0: frustum culling включен для дальних тайлов (проверим, помогает ли)
      // Для schematic с wireframe — лучше оставить без culling чтобы видеть структуру
      mesh.frustumCulled = mode !== 'schematic';
      const triCount = segX * segZ * 2;
      totalTriangles += triCount;
      group.add(mesh);
    }

    console.log(`[RealTerrainMesh] total tiles: ${tiles.length}, triangles: ${totalTriangles.toLocaleString()} (mode: ${mode})`);

    return group;
  }, [tiles, opacity, mode, centerTile]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        // Copy to be safe (though we don't mutate during this loop)
        [...groupRef.current.children].forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.dispose();
              if (child.material.map) child.material.map.dispose();
            }
          }
        });
      }
    };
  }, []);

  // Обновляем group при изменении meshes
  useEffect(() => {
    if (groupRef.current && meshes) {
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.dispose();
            if (child.material.map) child.material.map.dispose();
          }
        }
        groupRef.current.remove(child);
      }

      // Copy the array first! forEach on live meshes.children while add() removes from it
      // causes skipping every other tile → checkerboard/holes.
      [...meshes.children].forEach(child => {
        groupRef.current?.add(child);
      });
    } else if (groupRef.current && !meshes) {
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
        }
        groupRef.current.remove(child);
      }
    }
  }, [meshes]);

  if (!tiles || tiles.length === 0) return null;

  return <group ref={groupRef} />;
};

export { RealTerrainMesh };

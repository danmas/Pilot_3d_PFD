/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * Принимает массив загруженных тайлов и создаёт PlaneGeometry для каждого
 * с displacement map из DEM + спутниковой текстурой.
 *
 * Позиционирование: каждый тайл сдвинут на свою координату в сетке.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';
import type { TileCoord } from './terrainTileUtils';

interface RealTerrainMeshProps {
  /** Массив тайлов с координатами */
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  /** Параметры самолёта для позиционирования */
  aircraftX: number;
  aircraftY: number;
  aircraftZ: number;
  /** Прозрачность */
  opacity?: number;
  /** Режим */
  mode?: 'realistic' | 'schematic';
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  aircraftX,
  aircraftY,
  aircraftZ,
  opacity = 1,
  mode = 'realistic',
}) => {
  const groupRef = useRef<THREE.Group>(null);

  console.log('[RealTerrainMesh] render, tiles count:', tiles?.length ?? 0, 'mode:', mode);

  // Создаём меши для каждого тайла
  const meshes = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    const group = new THREE.Group();
    const material = mode === 'schematic'
      ? new THREE.MeshStandardMaterial({
          color: '#4a7c3f',
          roughness: 0.8,
          metalness: 0.0,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
        })
      : new THREE.MeshStandardMaterial({
          color: '#ffffff',
          roughness: 0.7,
          metalness: 0.0,
          transparent: true,
          opacity: opacity < 1 ? opacity : 1,
          side: THREE.DoubleSide,
        });

    // Находим центр сетки для выравнивания
    let centerX = 0, centerZ = 0;
    if (tiles.length > 0) {
      const mid = Math.floor(tiles.length / 2);
      const cc = tiles[mid].coord;
      // Центр сетки в WU
      const wu = tiles[mid].data.worldUnits;
      // Смещение центрального тайла
      centerX = 0;
      centerZ = 0;
    }

    for (const { coord, data } of tiles) {
      const { x, y, z } = coord;
      const wu = data.worldUnits > 0 ? data.worldUnits * 2 : 200;
      const halfW = wu / 2;
      const segX = Math.min(data.width, 64);
      const segZ = Math.min(data.height, 256);

      if (!segX || !segZ || !isFinite(wu)) continue;

      const geo = new THREE.BufferGeometry();

      const positions = new Float32Array((segX + 1) * (segZ + 1) * 3);
      const uvs = new Float32Array((segX + 1) * (segZ + 1) * 2);
      const indices: number[] = [];

      const stepX = wu / segX;
      const stepZ = wu / segZ;

      // Минимальная высота для этого тайла
      let minH = Infinity;
      for (let iz = 0; iz <= segZ; iz++) {
        for (let ix = 0; ix <= segX; ix++) {
          const u = ix / segX;
          const v = iz / segZ;
          const hi = Math.round(u * (data.width - 1));
          const hj = Math.round(v * (data.height - 1));
          const ci = Math.max(0, Math.min(data.width - 1, hi));
          const cj = Math.max(0, Math.min(data.height - 1, hj));
          const fi = cj * data.width + ci;
          const hv = data.heights && fi < data.heights.length ? data.heights[fi] : 0;
          if (isFinite(hv)) minH = Math.min(minH, hv);
        }
      }
      if (!isFinite(minH)) minH = 0;

      let idx = 0;
      for (let iz = 0; iz <= segZ; iz++) {
        for (let ix = 0; ix <= segX; ix++) {
          const px = -halfW + ix * stepX;
          const pz = -halfW + iz * stepZ;

          const u = ix / segX;
          const v = iz / segZ;
          const hi = Math.round(u * (data.width - 1));
          const hj = Math.round(v * (data.height - 1));
          const ci = Math.max(0, Math.min(data.width - 1, hi));
          const cj = Math.max(0, Math.min(data.height - 1, hj));
          const fi = cj * data.width + ci;
          let h = 0;
          if (data.heights && fi < data.heights.length) {
            h = data.heights[fi];
          }
          if (!isFinite(h) || isNaN(h)) h = 0;
          const hWu = (h - minH) / 40;

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

      // Текстура тайла
      let tileMaterial = material;
      if (data.satelliteBitmap && mode === 'realistic') {
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
      } else if (!data.satelliteBitmap && mode === 'realistic') {
        tileMaterial = new THREE.MeshStandardMaterial({
          color: '#ff3333',
          roughness: 0.7,
          metalness: 0.0,
          transparent: true,
          opacity: opacity < 1 ? opacity : 1,
          side: THREE.DoubleSide,
        });
      }

      // Смещение тайла в сетке относительно центра
      // Тайлы имеют размер wu в WU, шаг сетки = wu
      const offsetX = (x - tiles[Math.floor(tiles.length / 2)].coord.x) * wu;
      const offsetZ = (y - tiles[Math.floor(tiles.length / 2)].coord.y) * wu;

      const mesh = new THREE.Mesh(geo, tileMaterial);
      // Позиционируем на уровне земли в локальных координатах
      // Y = -6 + hWu (высота рельефа уже в hWu)
      // Но тайлы уже содержат высоту в positions, так что просто ставим Y=-6
      // и смещаем по XZ
      mesh.position.set(offsetX, -6, offsetZ);
      mesh.frustumCulled = false;
      group.add(mesh);
    }

    return group;
  }, [tiles, opacity, mode]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        // Dispose всех children
        groupRef.current.children.forEach(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
              if (child.material instanceof THREE.MeshStandardMaterial && child.material.map) child.material.map.dispose();
            }
          }
        });
      }
    };
  }, []);

  // Обновляем group при изменении meshes
  useEffect(() => {
    if (groupRef.current && meshes) {
      // Очищаем старые меши
      while (groupRef.current.children.length > 0) {
        const child = groupRef.current.children[0];
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
            if (child.material instanceof THREE.MeshStandardMaterial && child.material.map) child.material.map.dispose();
          }
        }
        groupRef.current.remove(child);
      }

      // Добавляем новые
      meshes.children.forEach(child => {
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

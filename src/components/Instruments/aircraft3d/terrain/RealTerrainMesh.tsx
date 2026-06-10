/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * Принимает decoded DEM + спутниковую текстуру и создаёт PlaneGeometry
 * с displacement map.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';

interface RealTerrainMeshProps {
  /** Данные тайла (heights, satelliteBitmap, метаданные) */
  tileData: TerrainTileData | null;
  /** Позиция самолёта в мировых координатах (используем только для выравнивания) */
  aircraftX: number;
  /** Позиция самолёта по Y (высота) */
  aircraftY: number;
  /** Позиция самолёта по Z */
  aircraftZ: number;
  /** Прозрачность (для crossfade при смене режимов) */
  opacity?: number;
  /** Режим ландшафта */
  mode?: 'realistic' | 'schematic';
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tileData,
  aircraftX,
  aircraftY,
  aircraftZ,
  opacity = 1,
  mode = 'realistic',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  console.log('[RealTerrainMesh] render, tileData:', !!tileData, 'mode:', mode, 'pos:', aircraftX.toFixed(1), aircraftY.toFixed(1), aircraftZ.toFixed(1));

  // Создаём или обновляем геометрию при новых данных тайла
  const geometry = useMemo(() => {
    if (!tileData) { console.log('[RealTerrainMesh] no tileData, returning null'); return null; }

    // Геометрия: сегментированная плоскость в XZ (не через rotateX, а напрямую)
    const segX = Math.min(tileData.width, 64);
    const segZ = Math.min(tileData.height, 256);

    console.log('[RealTerrainMesh] geo params:', { segX, segZ, wu: tileData.worldUnits, w: tileData.width, h: tileData.height, heightsLen: tileData.heights?.length });

    // Защита от невалидных данных
    if (!segX || !segZ || !isFinite(tileData.worldUnits)) { console.log('[RealTerrainMesh] invalid params'); return null; }
    const wu = tileData.worldUnits > 0 ? tileData.worldUnits * 2 : 200;
    const halfW = wu / 2;
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array((segX + 1) * (segZ + 1) * 3);
    const uvs = new Float32Array((segX + 1) * (segZ + 1) * 2);
    const indices: number[] = [];

    const stepX = wu / segX;
    const stepZ = wu / segZ;

    // Вычисляем минимальную высоту тайла — чтобы terrain не был приподнят
    // над уровнем земли (heights в метрах над уровнем моря, а сцена в local coords)
    let minH = Infinity;
    for (let iz = 0; iz <= segZ; iz++) {
      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX;
        const v = iz / segZ;
        const heightIx = Math.round(u * (tileData.width - 1));
        const heightIz = Math.round(v * (tileData.height - 1));
        const clampedIx = Math.max(0, Math.min(tileData.width - 1, heightIx));
        const clampedIz = Math.max(0, Math.min(tileData.height - 1, heightIz));
        const flatIx = clampedIz * tileData.width + clampedIx;
        const hv = tileData.heights && flatIx < tileData.heights.length ? tileData.heights[flatIx] : 0;
        if (isFinite(hv)) minH = Math.min(minH, hv);
      }
    }
    if (!isFinite(minH)) minH = 0;

    let idx = 0;
    for (let iz = 0; iz <= segZ; iz++) {
      for (let ix = 0; ix <= segX; ix++) {
        const x = -halfW + ix * stepX;
        const z = -halfW + iz * stepZ;

        // UV для сэмплинга heights
        const u = ix / segX;
        const v = iz / segZ;
        const heightIx = Math.round(u * (tileData.width - 1));
        const heightIz = Math.round(v * (tileData.height - 1));
        const clampedIx = Math.max(0, Math.min(tileData.width - 1, heightIx));
        const clampedIz = Math.max(0, Math.min(tileData.height - 1, heightIz));
        const flatIx = clampedIz * tileData.width + clampedIx;
        let h = 0;
        if (tileData.heights && flatIx < tileData.heights.length) {
          h = tileData.heights[flatIx];
        }
        if (!isFinite(h) || typeof h !== 'number' || isNaN(h)) h = 0;
        const hWu = (h - minH) / 40;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = hWu;
        positions[idx * 3 + 2] = z;
        uvs[idx * 2] = u;
        uvs[idx * 2 + 1] = 1 - v; // flip V для текстуры
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
      return null;
    }

    console.log('[RealTerrainMesh] geometry created OK');
    return geo;
  }, [tileData]);

  // Текстура из спутникового снимка
  const texture = useMemo(() => {
    if (!tileData?.satelliteBitmap) return null;
    const tex = new THREE.CanvasTexture(
      tileData.satelliteBitmap as unknown as HTMLCanvasElement
    );
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = true;
    return tex;
  }, [tileData?.satelliteBitmap]);

    // Материал
  const material = useMemo(() => {
    if (mode === 'schematic') {
      return new THREE.MeshStandardMaterial({
        color: '#4a7c3f',
        roughness: 0.8,
        metalness: 0.0,
        transparent: true,
        opacity,
        side: THREE.DoubleSide,
      });
    }

    return new THREE.MeshStandardMaterial({
      map: texture ?? undefined,
      color: texture ? '#ffffff' : '#ff3333', // ярко-красный если нет текстуры
      roughness: 0.7,
      metalness: 0.0,
      transparent: true,
      opacity: opacity < 1 ? opacity : 1,
      side: THREE.DoubleSide,
    });
  }, [texture, opacity, mode]);

  // Позиционирование: на уровне земли (-6, как GroundDisc) в локальных координатах
  // WorldGroup сдвинет всю группу на -aircraftPosition.y
  useEffect(() => {
    if (meshRef.current && tileData) {
      meshRef.current.position.set(0, -6, 0);
    }
  }, [tileData]);

  // Обновление прозрачности и цвета при смене режима
  useEffect(() => {
    if (material) {
      material.opacity = opacity;
      material.transparent = opacity < 1;
      if (mode === 'schematic') {
        (material as THREE.MeshStandardMaterial).color.set('#4a7c3f');
        (material as THREE.MeshStandardMaterial).map = null;
        (material as THREE.MeshStandardMaterial).needsUpdate = true;
      } else {
        (material as THREE.MeshStandardMaterial).map = texture || null;
        (material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }
  }, [opacity, mode, texture, material]);

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  );
};

export { RealTerrainMesh };

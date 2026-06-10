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

  // Создаём или обновляем геометрию при новых данных тайла
  const geometry = useMemo(() => {
    if (!tileData) return null;

    // Геометрия: сегментированная плоскость в XZ (не через rotateX, а напрямую)
    const segX = Math.min(tileData.width, 256);
    const segZ = Math.min(tileData.height, 256);
    const halfW = tileData.worldUnits / 2;
    const geo = new THREE.BufferGeometry();

    const positions = new Float32Array((segX + 1) * (segZ + 1) * 3);
    const uvs = new Float32Array((segX + 1) * (segZ + 1) * 2);
    const indices: number[] = [];

    const stepX = tileData.worldUnits / segX;
    const stepZ = tileData.worldUnits / segZ;

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
        let h = tileData.heights[clampedIz * tileData.width + clampedIx];
        if (!isFinite(h)) h = 0;
        const hWu = h / 40;

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

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

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
      map: texture || undefined,
      roughness: 0.7,
      metalness: 0.0,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
    });
  }, [texture, opacity, mode]);

  // Позиционирование: центр тайла под самолётом (но без смещения по Y — displacement сам поднимает)
  useEffect(() => {
    if (meshRef.current && tileData) {
      meshRef.current.position.set(aircraftX, 0, aircraftZ);
    }
  }, [aircraftX, aircraftZ, tileData]);

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

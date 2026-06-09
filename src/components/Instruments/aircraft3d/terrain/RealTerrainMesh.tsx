/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * Принимает decoded DEM + спутниковую текстуру и создаёт PlaneGeometry
 * с displacement map.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
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

    // Геометрия: сегментированная плоскость с displacement
    const geo = new THREE.PlaneGeometry(
      tileData.worldUnits,
      tileData.worldUnits,
      Math.min(tileData.width, 256), // Ограничиваем до 256 сегментов
      Math.min(tileData.height, 256)
    );

    // Поворачиваем горизонтально (PlaneGeometry по умолчанию в XY, нам нужно XZ)
    geo.rotateX(-Math.PI / 2);

    // Применяем displacement из DEM
    const positions = geo.attributes.position;
    const vertexCount = positions.count;

    // Находим центр высот для смещения
    let sumHeight = 0;
    for (let i = 0; i < vertexCount; i++) {
      const u = (positions.getX(i) / tileData.worldUnits) + 0.5;
      const v = (positions.getZ(i) / tileData.worldUnits) + 0.5;
      const ix = Math.round(u * (tileData.width - 1));
      const iy = Math.round(v * (tileData.height - 1));
      const clampedIx = Math.max(0, Math.min(tileData.width - 1, ix));
      const clampedIy = Math.max(0, Math.min(tileData.height - 1, iy));
      const h = tileData.heights[clampedIy * tileData.width + clampedIx];
      if (isFinite(h)) sumHeight += h;
    }
    const avgHeight = sumHeight / vertexCount;

    // Применяем высоты
    for (let i = 0; i < vertexCount; i++) {
      const u = (positions.getX(i) / tileData.worldUnits) + 0.5;
      const v = (positions.getZ(i) / tileData.worldUnits) + 0.5;
      const ix = Math.round(u * (tileData.width - 1));
      const iy = Math.round(v * (tileData.height - 1));
      const clampedIx = Math.max(0, Math.min(tileData.width - 1, ix));
      const clampedIy = Math.max(0, Math.min(tileData.height - 1, iy));
      let h = tileData.heights[clampedIy * tileData.width + clampedIx];
      if (!isFinite(h)) h = avgHeight;

      // Конвертируем метры в World Units
      const hWu = h / 40;
      positions.setY(i, hWu);
    }
    positions.needsUpdate = true;
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

  // Анимация/обновление позиции
  useFrame(() => {
    if (meshRef.current) {
      // Обновляем XZ позицию — следует за самолётом
      meshRef.current.position.x = aircraftX;
      meshRef.current.position.z = aircraftZ;
    }
  });

  if (!geometry) return null;

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} frustumCulled={false} />
  );
};

export { RealTerrainMesh };

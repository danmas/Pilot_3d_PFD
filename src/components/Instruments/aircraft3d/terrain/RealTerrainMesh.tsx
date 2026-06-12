/**
 * RealTerrainMesh.tsx — R3F компонент для отображения реального рельефа.
 *
 * Принимает массив загруженных тайлов и создаёт PlaneGeometry для каждого
 * с displacement map из DEM + спутниковой текстурой.
 *
 * Позиционирование:
 *   - Используется "sticky" reference (логический центр загруженной области),
 *     который не прыгает при незначительном изменении набора тайлов.
 *   - Все тайлы используют один и тот же tileWU (из тайла, ближайшего к стабильному ref).
 *   - Соседние тайлы стыкуются строго впритык по XZ (offset = (tile - ref) * tileWU,
 *     локальная геометрия от -halfW до +halfW).
 *   - Горизонтальные швы между квадратами теперь стабильны (красные и синие углы
 *     соседних тайлов должны совпадать).
 */

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { TerrainTileData } from './TerrainManager';
import type { TileCoord } from './terrainTileUtils';
import { getTileCornersLatLon, formatTileCorners } from './terrainTileUtils';

interface RealTerrainMeshProps {
  /** Массив тайлов с координатами */
  tiles: Array<{ coord: TileCoord; data: TerrainTileData }> | null;
  /** Прозрачность */
  opacity?: number;
  /** Режим */
  mode?: 'realistic' | 'schematic';
}

const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({
  tiles,
  opacity = 1,
  mode = 'realistic',
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Stable reference to prevent ref jumps when the set of loaded tiles changes.
  // We only move the reference point when the previous logical center is no longer
  // covered by the current loaded bounding box. This keeps seams stable during normal flight.
  const stableRefRef = useRef<{x: number, y: number} | null>(null);

  console.log('[RealTerrainMesh] render, tiles count:', tiles?.length ?? 0, 'mode:', mode);
  if (tiles && tiles.length > 0) {
    const c0 = getTileCornersLatLon(tiles[0].coord.x, tiles[0].coord.y, tiles[0].coord.z);
    console.log('[RealTerrainMesh] first tile in list corners example:', formatTileCorners(c0));
  }

  const meshes = useMemo(() => {
    if (!tiles || tiles.length === 0) return null;

    const group = new THREE.Group();

    const xs = tiles.map(t => t.coord.x);
    const ys = tiles.map(t => t.coord.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Candidate logical center of the current loaded set
    let candidateRefX = Math.round((minX + maxX) / 2);
    let candidateRefY = Math.round((minY + maxY) / 2);

    // Sticky ref: keep the previous center as long as it is still inside the loaded box.
    // This prevents the whole terrain group from shifting when peripheral tiles load/unload.
    let effectiveRefX = candidateRefX;
    let effectiveRefY = candidateRefY;
    const prev = stableRefRef.current;
    if (prev) {
      if (prev.x >= minX && prev.x <= maxX && prev.y >= minY && prev.y <= maxY) {
        effectiveRefX = prev.x;
        effectiveRefY = prev.y;
      }
    }

    // Pick the tile whose center is closest to the (stable) effective ref.
    // We use this tile's worldUnits so that geometry size and offset step are consistent.
    let refTile = tiles[0];
    let minDist = Infinity;
    for (const t of tiles) {
      const d = Math.abs(t.coord.x - effectiveRefX) + Math.abs(t.coord.y - effectiveRefY);
      if (d < minDist) {
        minDist = d;
        refTile = t;
      }
    }

    const baseTileSize = refTile.data.worldUnits;
    // IMPORTANT: use the value directly. The previous *2 was likely causing scale mismatch
    // between the offset calculation and the actual geometry extents.
    const tileWU = baseTileSize > 0 ? baseTileSize : 200;

    // Remember the ref we actually used so it stays stable next time
    stableRefRef.current = { x: effectiveRefX, y: effectiveRefY };

    console.log('[RealTerrainMesh] effectiveRefX/refY (sticky):', effectiveRefX, effectiveRefY,
                'tileWU:', tileWU, 'from tile:', refTile.coord, 'candidate was', candidateRefX, candidateRefY);

    // Глобальный minElevation для ВСЕЙ сетки — чтобы тайлы стыковались без щелей
    let globalMinElev = Infinity;
    for (const { data } of tiles) {
      if (data.minElevation < globalMinElev) globalMinElev = data.minElevation;
    }
    if (!isFinite(globalMinElev)) globalMinElev = 0;
    console.log('[RealTerrainMesh] globalMinElev:', globalMinElev);

    // Общий материал (schematic)
    const defaultMaterial = mode === 'schematic'
      ? new THREE.MeshStandardMaterial({
          color: '#4a7c3f',
          roughness: 0.8,
          metalness: 0.0,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
        })
      : null;

    const halfW = tileWU / 2;

    for (const { coord, data } of tiles) {
      const { x, y, z } = coord;
      const segX = Math.min(data.width, 64);
      const segZ = Math.min(data.height, 256);

      if (!segX || !segZ || !isFinite(tileWU)) continue;

      // Смещение тайла в сетке: соседние тайлы стыкуются строго впритык
      // Slippy Map Y растёт на ЮГ, 3D-мир Z растёт на СЕВЕР → инвертируем Z
      const offsetX = (x - effectiveRefX) * tileWU;
      const offsetZ = -(y - effectiveRefY) * tileWU;

      const corners = getTileCornersLatLon(x, y, z);
      console.log(`[RealTerrainMesh] DRAW-QUAD tile=${z}/${x}/${y} ref=${effectiveRefX}/${effectiveRefY} offsetX=${offsetX} offsetZ=${offsetZ} corners=${formatTileCorners(corners)}`);
      // Send to server log immediately (fire and forget) so user doesn't have to relay from console
      fetch('/api/terrain/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          t: new Date().toISOString(),
          type: 'DRAW-QUAD',
          coord: { z, x, y },
          ref: { x: effectiveRefX, y: effectiveRefY },
          offset: { x: offsetX, z: offsetZ },
          corners,
          source: 'client'
        })
      }).catch(() => {});

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
          const hWu = (h - globalMinElev) / 40;

          positions[idx * 3] = px;
          positions[idx * 3 + 1] = hWu;
          positions[idx * 3 + 2] = pz;
          uvs[idx * 2] = u;
          uvs[idx * 2 + 1] = v;
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
      mesh.frustumCulled = false;
      group.add(mesh);
    }

    return group;
  }, [tiles, opacity, mode]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (groupRef.current) {
        groupRef.current.children.forEach(child => {
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

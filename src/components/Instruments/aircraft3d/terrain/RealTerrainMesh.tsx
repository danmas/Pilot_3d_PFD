/**
 * RealTerrainMesh — R3F component rendering a terrain tile with displacement + satellite texture.
 * Placed OUTSIDE WorldGroup (like GroundDisc), follows aircraftPosition in XZ.
 * Y is fixed relative to ground level (-6).
 */

import React, { useMemo, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { TerrainTile } from './TerrainManager';
import { aircraftPosition } from '../aircraftPosition';

interface RealTerrainMeshProps {
  tile: TerrainTile;
}

const GRID_RES = 256;
const METER_TO_WU = 1 / 40;

export const RealTerrainMesh: React.FC<RealTerrainMeshProps> = ({ tile }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Satellite texture
  const [satTexture, setSatTexture] = React.useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!tile.satObjectUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(
      tile.satObjectUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setSatTexture(tex);
      },
      undefined,
      () => { /* fail silently */ },
    );
  }, [tile.satObjectUrl]);

  // Create geometry with displacement from height data
  const geometry = useMemo(() => {
    if (!tile.heights) return null;

    const geo = new THREE.PlaneGeometry(tile.sizeWU, tile.sizeWU, GRID_RES, GRID_RES);
    geo.rotateX(-Math.PI / 2); // flat on XZ plane

    // Apply displacement from decoded heights
    const pos = geo.attributes.position;
    const maxH = 8000;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const u = Math.max(0, Math.min(1, x / tile.sizeWU + 0.5));
      const v = Math.max(0, Math.min(1, z / tile.sizeWU + 0.5));
      const tx = Math.floor(u * (GRID_RES - 1));
      const ty = Math.floor(v * (GRID_RES - 1));
      const idx = Math.max(0, Math.min(tile.heights.length - 1, ty * GRID_RES + tx));
      const h = Math.max(-500, Math.min(maxH, tile.heights[idx]));
      pos.setY(i, h * METER_TO_WU);
    }
    geo.computeVertexNormals();
    geo.attributes.position.needsUpdate = true;
    return geo;
  }, [tile]);

  // Material
  const material = useMemo(() => {
    if (satTexture) {
      return new THREE.MeshStandardMaterial({
        map: satTexture,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#4a7c3f'),
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
  }, [satTexture]);

  // Follow aircraft in XZ, stay at ground level Y = -6
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.position.x = aircraftPosition.x;
    g.position.z = aircraftPosition.z;
    // Ground level — same as GroundDisc
    const targetY = -6 - aircraftPosition.y;
    g.position.y += (targetY - g.position.y) * 0.06;
  });

  // Placeholder geometry while loading
  const displayGeo = geometry || (() => {
    const phGeo = new THREE.PlaneGeometry(tile.sizeWU, tile.sizeWU);
    phGeo.rotateX(-Math.PI / 2);
    return phGeo;
  })();

  return (
    <group ref={groupRef}>
      <mesh
        geometry={displayGeo}
        material={material}
        receiveShadow
        position={[0, -6.01, 0]}
      />
    </group>
  );
};

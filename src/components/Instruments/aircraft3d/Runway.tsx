/// <reference types="@react-three/fiber" />
/**
 * Runway.tsx — ВПП с разметкой для 3D-сцены «Самолёт».
 *
 * Бетонная полоса с кромочными линиями, осевой разметкой и пороговыми полосами.
 * Находится внутри WorldGroup — при наборе высоты ВПП удаляется вниз.
 *
 * Все геометрии и материалы — общие (useMemo), для экономии draw-calls.
 */
import { useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';

export const Runway: React.FC = memo(() => {
  const runwayMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.85 }),
    [],
  );
  const markMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#dddddd' }),
    [],
  );

  const runwayGeom = useMemo(() => new THREE.PlaneGeometry(16, 500), []);
  const edgeGeom = useMemo(() => new THREE.PlaneGeometry(0.35, 500), []);
  const dashGeom = useMemo(() => new THREE.PlaneGeometry(0.3, 5), []);
  const threshGeom = useMemo(() => new THREE.PlaneGeometry(0.7, 12), []);

  useEffect(
    () => () => {
      [runwayGeom, edgeGeom, dashGeom, threshGeom].forEach((g) => g.dispose());
      [runwayMat, markMat].forEach((m) => m.dispose());
    },
    [runwayGeom, edgeGeom, dashGeom, threshGeom, runwayMat, markMat],
  );

  // Center-line dash positions along Z (symmetric, skip center)
  const dashZ = useMemo(() => {
    const arr: number[] = [];
    for (let z = -240; z <= 240; z += 14) {
      if (Math.abs(z) < 6) continue;
      arr.push(z);
    }
    return arr;
  }, []);

  // Threshold stripe X-offsets
  const threshX = [-6, -4, -2, 0, 2, 4, 6];

  return (
    <group>
      {/* Runway surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -5.97, 0]}
        receiveShadow
        frustumCulled={false}
        material={runwayMat}
        geometry={runwayGeom}
      />

      {/* Runway edge lines */}
      {[-7.7, 7.7].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, 0]}
          frustumCulled={false}
          material={markMat}
          geometry={edgeGeom}
        />
      ))}

      {/* Center-line dashes */}
      {dashZ.map((z) => (
        <mesh
          key={z}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -5.95, z]}
          frustumCulled={false}
          material={markMat}
          geometry={dashGeom}
        />
      ))}

      {/* Threshold stripes — near end (z ≈ −245) */}
      {threshX.map((x) => (
        <mesh
          key={`n${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, -245]}
          frustumCulled={false}
          material={markMat}
          geometry={threshGeom}
        />
      ))}

      {/* Threshold stripes — far end (z ≈ +245) */}
      {threshX.map((x) => (
        <mesh
          key={`f${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, 245]}
          frustumCulled={false}
          material={markMat}
          geometry={threshGeom}
        />
      ))}
    </group>
  );
});

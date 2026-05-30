/// <reference types="@react-three/fiber" />
/**
 * Ground.tsx — земля с взлётно-посадочной полосой для 3D-сцены «Самолёт».
 *
 * Большая плоскость с бетонной ВПП, осевой разметкой и пороговыми полосами.
 * Все геометрии и материалы — общие (useMemo), для экономии draw-calls.
 */
import { useMemo, useEffect, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { telemetryRef } from '../../../telemetryRef';

export const Ground: React.FC = memo(() => {
  const groupRef = useRef<THREE.Group>(null);
  const groundMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4a7a3a', roughness: 0.95 }),
    [],
  );
  const runwayMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#555555', roughness: 0.85 }),
    [],
  );
  const markMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#dddddd' }),
    [],
  );

  const groundGeom = useMemo(() => new THREE.PlaneGeometry(400, 400), []);
  const runwayGeom = useMemo(() => new THREE.PlaneGeometry(8, 200), []);
  const edgeGeom = useMemo(() => new THREE.PlaneGeometry(0.25, 200), []);
  const dashGeom = useMemo(() => new THREE.PlaneGeometry(0.3, 5), []);
  const threshGeom = useMemo(() => new THREE.PlaneGeometry(0.5, 8), []);

  useEffect(
    () => () => {
      [groundGeom, runwayGeom, edgeGeom, dashGeom, threshGeom].forEach((g) => g.dispose());
      [groundMat, runwayMat, markMat].forEach((m) => m.dispose());
    },
    [groundGeom, runwayGeom, edgeGeom, dashGeom, threshGeom, groundMat, runwayMat, markMat],
  );

  // Center-line dash positions along Z (symmetric, skip center)
  const dashZ = useMemo(() => {
    const arr: number[] = [];
    for (let z = -90; z <= 90; z += 12) {
      if (Math.abs(z) < 4) continue;
      arr.push(z);
    }
    return arr;
  }, []);

  // Threshold stripe X-offsets
  const threshX = [-3, -2, -1, 0, 1, 2, 3];

  /* ── Animate ground position from telemetry ── */
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const f = telemetryRef.current;
    if (!f) return;

    const alt = typeof f.RAltitude === 'number' && Number.isFinite(f.RAltitude) ? f.RAltitude : 0;
    const roll = typeof f.RollAngle === 'number' && Number.isFinite(f.RollAngle) ? f.RollAngle : 0;
    const pitch = typeof f.PitchAngle === 'number' && Number.isFinite(f.PitchAngle) ? f.PitchAngle : 0;

    // Altitude → ground drops as aircraft climbs
    const targetY = -6 - alt / 150;
    g.position.y += (targetY - g.position.y) * 0.04;

    // Roll → ground slides sideways (opposite to bank)
    const targetX = -(roll / 45) * 8;
    g.position.x += (targetX - g.position.x) * 0.03;

    // Pitch → ground slides forward/backward (nose-up = forward motion)
    const targetZ = -(pitch / 20) * 15;
    g.position.z += (targetZ - g.position.z) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Ground surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -6, 0]}
        receiveShadow
        material={groundMat}
        geometry={groundGeom}
      />

      {/* Runway surface */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -5.97, 0]}
        receiveShadow
        material={runwayMat}
        geometry={runwayGeom}
      />

      {/* Runway edge lines */}
      {[-3.85, 3.85].map((x) => (
        <mesh
          key={x}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, 0]}
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
          material={markMat}
          geometry={dashGeom}
        />
      ))}

      {/* Threshold stripes — near end (z ≈ −94) */}
      {threshX.map((x) => (
        <mesh
          key={`n${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, -94]}
          material={markMat}
          geometry={threshGeom}
        />
      ))}

      {/* Threshold stripes — far end (z ≈ +94) */}
      {threshX.map((x) => (
        <mesh
          key={`f${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, -5.95, 94]}
          material={markMat}
          geometry={threshGeom}
        />
      ))}
    </group>
  );
});

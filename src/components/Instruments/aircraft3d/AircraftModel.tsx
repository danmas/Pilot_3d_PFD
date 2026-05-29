/// <reference types="@react-three/fiber" />
/**
 * AircraftModel.tsx — процедурный самолётик из примитивов Three.js.
 *
 * Ориентация:
 *   rollDeg  → ось Z (крен)
 *   pitchDeg → ось X (тангаж)
 *   headingDeg → ось Y (рыскание / курс)
 *
 * Порядок вращения: Y → X → Z (yaw → pitch → roll), соответствует
 * стандартной авиационной конвенции.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DEG = Math.PI / 180;

interface AircraftModelProps {
  rollDeg: number;
  pitchDeg: number;
  headingDeg: number;
}

export const AircraftModel: React.FC<AircraftModelProps> = ({
  rollDeg,
  pitchDeg,
  headingDeg,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.35, roughness: 0.55 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2563eb', metalness: 0.35, roughness: 0.6 }),
    [],
  );

  // Smooth interpolation toward target rotation (lerp factor per frame ≈ 0.12)
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const target = new THREE.Euler(
      pitchDeg * DEG,
      -headingDeg * DEG,
      rollDeg * DEG,
      'YXZ',
    );
    g.rotation.x += (target.x - g.rotation.x) * 0.12;
    g.rotation.y += (target.y - g.rotation.y) * 0.12;
    g.rotation.z += (target.z - g.rotation.z) * 0.12;
  });

  return (
    <group ref={groupRef}>
      {/* ── Fuselage ── */}
      <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.35, 3.0, 8, 20]} />
      </mesh>

      {/* ── Nose cone ── */}
      <mesh material={accentMat} position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.36, 0.7, 16]} />
      </mesh>

      {/* ── Main wings ── */}
      <mesh material={accentMat} position={[0, 0.02, 0.1]}>
        <boxGeometry args={[7.0, 0.07, 1.3]} />
      </mesh>

      {/* ── Horizontal stabiliser ── */}
      <mesh material={accentMat} position={[0, 0.02, 1.75]}>
        <boxGeometry args={[2.6, 0.06, 0.75]} />
      </mesh>

      {/* ── Vertical fin ── */}
      <mesh material={accentMat} position={[0, 0.75, 1.55]}>
        <boxGeometry args={[0.06, 1.3, 0.85]} />
      </mesh>

      {/* ── Engine nacelles ── */}
      <mesh material={bodyMat} position={[-1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.1, 12]} />
      </mesh>
      <mesh material={bodyMat} position={[1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.1, 12]} />
      </mesh>
    </group>
  );
};

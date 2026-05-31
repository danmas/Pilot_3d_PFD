/// <reference types="@react-three/fiber" />
/**
 * AircraftModel.tsx — модель самолёта в 3D-сцене.
 *
 * Поддерживает два режима:
 *   1. Процедурные примитивы Three.js (дефолт)
 *   2. Загрузка .glb модели через useGLTF (@react-three/drei)
 *
 * Ориентация:
 *   rollDeg  → ось Z (крен)
 *   pitchDeg → ось X (тангаж)
 *   headingDeg → ось Y (рыскание / курс)
 *
 * Порядок вращения: Y → X → Z (yaw → pitch → roll).
 */
import React, { useMemo, useRef, useEffect, Suspense, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ModelEntry } from './modelConfig';
import { telemetryRef } from '../../../telemetryRef';
import { aircraftPosition } from './aircraftPosition';
import { aircraftControlsRef } from '../../../aircraftControlsRef';

const DEG = Math.PI / 180;

/* ─────────────────── Общие пропсы ─────────────────── */
interface AircraftModelProps {
  /** Текущая выбранная модель (null = примитивы) */
  model?: ModelEntry;
}

/* ─────────────────── Главный компонент ─────────────────── */
export const AircraftModel: React.FC<AircraftModelProps> = memo(({
  model,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    let pitchDeg = 0, rollDeg = 0, headingDeg = 0;

    const override = aircraftControlsRef.current;
    if (override.active) {
      // Manual control via joystick/rudder
      pitchDeg   = override.pitch;
      rollDeg    = override.roll;
      headingDeg = override.yaw;
    } else {
      const f = telemetryRef.current;
      if (!f) return;
      pitchDeg   = typeof f.PitchAngle === 'number' && Number.isFinite(f.PitchAngle) ? f.PitchAngle : 0;
      rollDeg    = typeof f.RollAngle === 'number' && Number.isFinite(f.RollAngle) ? f.RollAngle : 0;
      headingDeg = typeof f.Heading1 === 'number' && Number.isFinite(f.Heading1) ? f.Heading1 : 0;
    }

    const pitchRad   = pitchDeg * DEG;
    const rollRad    = rollDeg * DEG;
    const headingRad = headingDeg * DEG;

    const target = eulerRef.current;
    target.set(pitchRad, -headingRad, rollRad, 'YXZ');
    g.rotation.x += (target.x - g.rotation.x) * 0.12;
    g.rotation.y += (target.y - g.rotation.y) * 0.12;
    g.rotation.z += (target.z - g.rotation.z) * 0.12;

    /* ── Integrate forward position from CAS + heading ── */
    const cas = typeof f.CAS === 'number' && Number.isFinite(f.CAS) ? f.CAS : 0;
    // 1 knot = 0.5144 m/s; scene scale ~1/40 → world-units/s
    const speedWU = cas * 0.5144 / 40;
    const dt = Math.min(delta, 0.1);
    const heading = typeof f.Heading1 === 'number' && Number.isFinite(f.Heading1) ? f.Heading1 : 0;
    const hRad = heading * DEG;
    aircraftPosition.x += -Math.sin(hRad) * speedWU * dt;
    aircraftPosition.z += -Math.cos(hRad) * speedWU * dt;
  });

  const useGlb = model?.url != null;
  const ox = model?.offsetX ?? 0;
  const oy = model?.offsetY ?? 0;
  const oz = model?.offsetZ ?? 0;

  return (
    <group ref={groupRef} position={[ox, oy, oz]}>
      {useGlb ? (
        <Suspense fallback={null}>
          <GLBAircraft
            url={model.url!}
            scale={model.scale ?? 1}
            yawOffsetDeg={model.yawOffsetDeg ?? 0}
          />
        </Suspense>
      ) : (
        <PrimitiveAircraft />
      )}
    </group>
  );
});

/* ─────────────────── Процедурная модель (примитивы) ─────────────────── */

const PrimitiveAircraft: React.FC = memo(() => {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.35, roughness: 0.55 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2563eb', metalness: 0.35, roughness: 0.6 }),
    [],
  );

  // Memoize all geometries to prevent recreation on every render
  const fuselageGeom = useMemo(() => new THREE.CapsuleGeometry(0.35, 3.0, 8, 20), []);
  const noseGeom = useMemo(() => new THREE.ConeGeometry(0.36, 0.7, 16), []);
  const wingsGeom = useMemo(() => new THREE.BoxGeometry(7.0, 0.07, 1.3), []);
  const stabilizerGeom = useMemo(() => new THREE.BoxGeometry(2.6, 0.06, 0.75), []);
  const finGeom = useMemo(() => new THREE.BoxGeometry(0.06, 1.3, 0.85), []);
  const engineGeom = useMemo(() => new THREE.CylinderGeometry(0.22, 0.22, 1.1, 12), []);

  // Cleanup: dispose geometries and materials on unmount
  useEffect(() => {
    return () => {
      fuselageGeom.dispose();
      noseGeom.dispose();
      wingsGeom.dispose();
      stabilizerGeom.dispose();
      finGeom.dispose();
      engineGeom.dispose();
      bodyMat.dispose();
      accentMat.dispose();
    };
  }, [fuselageGeom, noseGeom, wingsGeom, stabilizerGeom, finGeom, engineGeom, bodyMat, accentMat]);

  return (
    <>
      {/* Fuselage */}
      <mesh material={bodyMat} geometry={fuselageGeom} rotation={[Math.PI / 2, 0, 0]} />
      {/* Nose cone */}
      <mesh material={accentMat} geometry={noseGeom} position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* Main wings */}
      <mesh material={accentMat} geometry={wingsGeom} position={[0, 0.02, 0.1]} />
      {/* Horizontal stabiliser */}
      <mesh material={accentMat} geometry={stabilizerGeom} position={[0, 0.02, 1.75]} />
      {/* Vertical fin */}
      <mesh material={accentMat} geometry={finGeom} position={[0, 0.75, 1.55]} />
      {/* Engine nacelles */}
      <mesh material={bodyMat} geometry={engineGeom} position={[-1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh material={bodyMat} geometry={engineGeom} position={[1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]} />
    </>
  );
});

/* ─────────────────── GLB модель ─────────────────── */

/** Целевой размер модели по наибольшему габариту */
const TARGET_SIZE = 8;

interface GLBAircraftProps {
  url: string;
  scale: number;
  yawOffsetDeg: number;
}

const GLBAircraft: React.FC<GLBAircraftProps> = ({ url, scale, yawOffsetDeg }) => {
  const { scene } = useGLTF(url);
  const innerRef = useRef<THREE.Group>(null);

  // Авто-фит: вычисляем bounding box и масштабируем
  const { fitScale, centerOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    return {
      fitScale: s,
      centerOffset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  // Клонируем сцену чтобы не мутировать оригинал (useGLTF кэширует)
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <group
      ref={innerRef}
      scale={fitScale * scale}
      position={[
        centerOffset[0] * fitScale * scale,
        centerOffset[1] * fitScale * scale,
        centerOffset[2] * fitScale * scale,
      ]}
      rotation={[0, yawOffsetDeg * DEG, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

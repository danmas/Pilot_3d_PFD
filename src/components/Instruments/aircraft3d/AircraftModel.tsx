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
  /** Накопленный курс для мануального управления (yaw накапливается) */
  const headingAccumRef = useRef(0);

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    let pitchDeg = 0, rollDeg = 0, headingDeg = 0;

    const override = aircraftControlsRef.current;
    if (override.active) {
      // Manual control via joystick/rudder

      // On the first frame of override activation, sync headingAccumRef
      // from the model's actual rotation (after lerp) for smooth takeover
      if (!override._wasActive) {
        const currentHeadingDeg = -g.rotation.y / DEG;
        headingAccumRef.current = currentHeadingDeg;
        headingDeg = currentHeadingDeg;
        override._wasActive = true;
      } else {
        // Yaw is rotation rate (deg/s): integrate into accumulated heading
        const dt = Math.min(delta, 0.1);
        headingAccumRef.current += override.yaw * dt;
        headingDeg = headingAccumRef.current;
      }

      pitchDeg   = override.pitch;
      rollDeg    = override.roll;
    } else {
      // Joystick released: hold current heading, zero pitch/roll
      pitchDeg   = 0;
      rollDeg    = 0;
      headingDeg = -g.rotation.y / DEG;
      headingAccumRef.current = headingDeg;
      override._wasActive = false;
      // Don't touch telemetryRef — just keep flying straight
    }

    const pitchRad   = pitchDeg * DEG;
    const rollRad    = rollDeg * DEG;
    const headingRad = headingDeg * DEG;

    const target = eulerRef.current;
    target.set(pitchRad, -headingRad, rollRad, 'YXZ');
    g.rotation.x += (target.x - g.rotation.x) * 0.12;
    g.rotation.y += (target.y - g.rotation.y) * 0.12;
    g.rotation.z += (target.z - g.rotation.z) * 0.12;

    // Publish actual model yaw (after lerp) for CameraController
    override.modelYaw = g.rotation.y;

    /* ── Integrate forward position from CAS + heading ── */
    if (override.active) {
      // Manual control: move forward at constant cruise speed
      const cas = 250; // ~250 kt cruise in manual
      const speedWU = cas * 0.5144 / 40;
      const dt = Math.min(delta, 0.1);
      const hRad = -headingDeg * DEG;
      const pRad = pitchDeg * DEG;
      const forwardHoriz = Math.cos(pRad);
      aircraftPosition.x += -Math.sin(hRad) * speedWU * forwardHoriz * dt;
      aircraftPosition.z += -Math.cos(hRad) * speedWU * forwardHoriz * dt;
      // Vertical: sin(pitch) — positive pitch = climb
      aircraftPosition.y += Math.sin(pRad) * speedWU * dt;

      const LIMIT = 2000;
      if (Math.abs(aircraftPosition.x) > LIMIT || Math.abs(aircraftPosition.z) > LIMIT) {
        aircraftPosition.x = 0;
        aircraftPosition.z = 0;
      }
    }
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

  // Simple geometries — no CapsuleGeometry (not supported on some mobile WebGL)
  const fuseCylGeom = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 3.0, 12), []);
  const fuseSphereGeom = useMemo(() => new THREE.SphereGeometry(0.35, 12, 8), []);
  const noseGeom = useMemo(() => new THREE.ConeGeometry(0.36, 0.7, 16), []);
  const wingsGeom = useMemo(() => new THREE.BoxGeometry(7.0, 0.07, 1.3), []);
  const stabilizerGeom = useMemo(() => new THREE.BoxGeometry(2.6, 0.06, 0.75), []);
  const finGeom = useMemo(() => new THREE.BoxGeometry(0.06, 1.3, 0.85), []);
  const engineGeom = useMemo(() => new THREE.CylinderGeometry(0.22, 0.22, 1.1, 8), []);

  // Cleanup
  useEffect(() => {
    return () => {
      fuseCylGeom.dispose();
      fuseSphereGeom.dispose();
      noseGeom.dispose();
      wingsGeom.dispose();
      stabilizerGeom.dispose();
      finGeom.dispose();
      engineGeom.dispose();
      bodyMat.dispose();
      accentMat.dispose();
    };
  }, [fuseCylGeom, fuseSphereGeom, noseGeom, wingsGeom, stabilizerGeom, finGeom, engineGeom, bodyMat, accentMat]);

  return (
    <>
      {/* Fuselage — cylinder + spheres for capsule shape */}
      <mesh material={bodyMat} geometry={fuseCylGeom} rotation={[Math.PI / 2, 0, 0]} />
      <mesh material={bodyMat} geometry={fuseSphereGeom} position={[0, 0, -1.5]} />
      <mesh material={bodyMat} geometry={fuseSphereGeom} position={[0, 0, 1.5]} />
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

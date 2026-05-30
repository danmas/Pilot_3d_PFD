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
import { useMemo, useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ModelEntry } from './modelConfig';

const DEG = Math.PI / 180;

/* ─────────────────── Общие пропсы ─────────────────── */
interface AircraftModelProps {
  rollDeg: number;
  pitchDeg: number;
  headingDeg: number;
  /** Текущая выбранная модель (null = примитивы) */
  model?: ModelEntry;
}

/* ─────────────────── Главный компонент ─────────────────── */
export const AircraftModel: React.FC<AircraftModelProps> = ({
  rollDeg,
  pitchDeg,
  headingDeg,
  model,
}) => {
  const groupRef = useRef<THREE.Group>(null);

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
};

/* ─────────────────── Процедурная модель (примитивы) ─────────────────── */

const PrimitiveAircraft: React.FC = () => {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.35, roughness: 0.55 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2563eb', metalness: 0.35, roughness: 0.6 }),
    [],
  );

  return (
    <>
      {/* Fuselage */}
      <mesh material={bodyMat} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.35, 3.0, 8, 20]} />
      </mesh>
      {/* Nose cone */}
      <mesh material={accentMat} position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.36, 0.7, 16]} />
      </mesh>
      {/* Main wings */}
      <mesh material={accentMat} position={[0, 0.02, 0.1]}>
        <boxGeometry args={[7.0, 0.07, 1.3]} />
      </mesh>
      {/* Horizontal stabiliser */}
      <mesh material={accentMat} position={[0, 0.02, 1.75]}>
        <boxGeometry args={[2.6, 0.06, 0.75]} />
      </mesh>
      {/* Vertical fin */}
      <mesh material={accentMat} position={[0, 0.75, 1.55]}>
        <boxGeometry args={[0.06, 1.3, 0.85]} />
      </mesh>
      {/* Engine nacelles */}
      <mesh material={bodyMat} position={[-1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.1, 12]} />
      </mesh>
      <mesh material={bodyMat} position={[1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 1.1, 12]} />
      </mesh>
    </>
  );
};

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

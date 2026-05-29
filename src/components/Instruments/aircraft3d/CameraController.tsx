/// <reference types="@react-three/fiber" />
/**
 * CameraController.tsx — управление камерой в 3D Aircraft Instrument.
 *
 * Поддерживает:
 *  • Свободное вращение мышью (OrbitControls)
 *  • Плавные пресеты: Сзади / Сверху / Сбоку / Кабина
 *  • Кнопочное вращение ◀▶▲▼
 *  • Сброс ↺ в дефолтный вид (сзади-сверху)
 *
 * Управление осуществляется через imperativ API, вызываемый из
 * Aircraft3DInstrument по нажатию HTML-кнопок.
 */
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ──────────────── Preset camera positions ──────────────── */
export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  chase:  { position: [0, 4, 12],    target: [0, 0, 0] },  // behind & above
  top:    { position: [0, 16, 0.5],  target: [0, 0, 0] },  // top-down
  side:   { position: [14, 2, 0],    target: [0, 0, 0] },  // side view
  cockpit:{ position: [0, 0.5, -1.5], target: [0, 0, -20] }, // first person
};

export const DEFAULT_PRESET = 'chase';

/* ──────────────── Imperative handle ──────────────── */
export interface CameraControls {
  setPreset: (name: string) => void;
  rotateBy: (azimuthDeltaDeg: number, polarDeltaDeg: number) => void;
  reset: () => void;
}

/* ──────────────── Internal state ──────────────── */
const LERP_SPEED = 0.07;

const CameraController = forwardRef<CameraControls>((_props, ref) => {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS[DEFAULT_PRESET].position));
  const targetLookAt = useRef(new THREE.Vector3(...CAMERA_PRESETS[DEFAULT_PRESET].target));
  const animating = useRef(false);

  useImperativeHandle(ref, () => ({
    setPreset(name: string) {
      const p = CAMERA_PRESETS[name];
      if (!p) return;
      targetPos.current.set(...p.position);
      targetLookAt.current.set(...p.target);
      animating.current = true;
    },
    rotateBy(azimuthDeg: number, polarDeg: number) {
      // Orbit around target: azimuth = Y rotation, polar = pitch
      const azRad = (azimuthDeg * Math.PI) / 180;
      const poRad = (polarDeg * Math.PI) / 180;

      const offset = targetPos.current.clone().sub(targetLookAt.current);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta -= azRad;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi - poRad, 0.15, Math.PI - 0.15);
      offset.setFromSpherical(spherical);

      targetPos.current.copy(targetLookAt.current).add(offset);
      animating.current = true;
    },
    reset() {
      const p = CAMERA_PRESETS[DEFAULT_PRESET];
      targetPos.current.set(...p.position);
      targetLookAt.current.set(...p.target);
      animating.current = true;
    },
  }));

  useFrame(() => {
    if (!animating.current) return;

    camera.position.lerp(targetPos.current, LERP_SPEED);

    const dist = camera.position.distanceTo(targetPos.current);
    if (dist < 0.05) {
      camera.position.copy(targetPos.current);
      animating.current = false;
    }

    camera.lookAt(targetLookAt.current);
  });

  return (
    <OrbitControls
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={35}
      target={targetLookAt.current}
    />
  );
});

CameraController.displayName = 'CameraController';
export { CameraController };

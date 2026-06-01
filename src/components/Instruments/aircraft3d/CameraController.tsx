/// <reference types="@react-three/fiber" />
/**
 * CameraController.tsx — управление камерой в 3D Aircraft Instrument.
 *
 * Поддерживает:
 *  • Плавные пресеты: Сзади / Сверху / Сбоку / Кабина
 *  • Кнопочное вращение ◀▶▲▼
 *  • Сброс ↺ в дефолтный вид (сзади-сверху)
 *  • Переключение проекции: Perspective / Wide / Orthographic
 *  • Мышиный drag для вращения вокруг самолёта (десктоп)
 *  • Колёсико мыши для zoom
 *  • Камера всегда следует за самолётом — offset вращается вместе с моделью
 *
 * БЕЗ OrbitControls — ручная логика для совместимости
 * с мобильными браузерами.
 */
import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { aircraftControlsRef } from '../../../aircraftControlsRef';

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
  setProjection: (type: ProjectionType) => void;
}

/* ──────────────── Projection types ──────────────── */
export type ProjectionType = 'perspective' | 'wide' | 'ortho';

export const PROJECTION_LABELS: Record<ProjectionType, string> = {
  perspective: 'Перспектива',
  wide: 'Широкоуг.',
  ortho: 'Орто',
};

/* ──────────────── Internal state ──────────────── */
/** Half-size of orthographic frustum (world units) */
const ORTHO_SIZE = 12;
/** Zoom limits */
const MIN_DIST = 3;
const MAX_DIST = 50;
/** Mouse drag sensitivity (radians per pixel) */
const DRAG_SENSITIVITY = 0.006;

const CameraController = forwardRef<CameraControls>((_props, ref) => {
  const { camera, size, gl } = useThree();
  /** Базовый оффсет камеры относительно самолёта (world space, без вращения) */
  const baseOffset = useRef(new THREE.Vector3(...CAMERA_PRESETS[DEFAULT_PRESET].position));
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const projectionRef = useRef<ProjectionType>('perspective');

  useImperativeHandle(ref, () => ({
    setPreset(name: string) {
      const p = CAMERA_PRESETS[name];
      if (!p) return;
      baseOffset.current.set(...p.position);
    },
    rotateBy(azimuthDeg: number, polarDeg: number) {
      const azRad = (azimuthDeg * Math.PI) / 180;
      const poRad = (polarDeg * Math.PI) / 180;

      const spherical = new THREE.Spherical().setFromVector3(baseOffset.current);
      spherical.theta -= azRad;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi - poRad, 0.15, Math.PI - 0.15);
      baseOffset.current.setFromSpherical(spherical);
    },
    reset() {
      const p = CAMERA_PRESETS[DEFAULT_PRESET];
      baseOffset.current.set(...p.position);
    },
    setProjection(type: ProjectionType) {
      projectionRef.current = type;
    },
  }));

  /* ── Mouse drag for desktop rotation ── */
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    const isMobile = window.innerWidth < 1024;

    const onMouseDown = (e: MouseEvent) => {
      if (isMobile) return;
      isDragging.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || isMobile) return;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      lastMouse.current = { x: e.clientX, y: e.clientY };

      const spherical = new THREE.Spherical().setFromVector3(baseOffset.current);
      spherical.theta -= dx * DRAG_SENSITIVITY;
      spherical.phi = THREE.MathUtils.clamp(spherical.phi - dy * DRAG_SENSITIVITY, 0.15, Math.PI - 0.15);
      baseOffset.current.setFromSpherical(spherical);
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (isMobile) return;
      e.preventDefault();
      const spherical = new THREE.Spherical().setFromVector3(baseOffset.current);
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * factor, MIN_DIST, MAX_DIST);
      baseOffset.current.setFromSpherical(spherical);
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  /* ── Every frame: follow aircraft model rotation ── */
  useFrame(() => {
    const proj = projectionRef.current;

    if (proj === 'ortho') {
      const cam = camera as THREE.OrthographicCamera;
      if (cam.isOrthographicCamera) {
        const aspect = size.width / size.height;
        cam.left = -ORTHO_SIZE * aspect;
        cam.right = ORTHO_SIZE * aspect;
        cam.top = ORTHO_SIZE;
        cam.bottom = -ORTHO_SIZE;
        cam.zoom = 1;
        cam.updateProjectionMatrix();
      }
    } else {
      const cam = camera as THREE.PerspectiveCamera;
      if (cam.isPerspectiveCamera) {
        const targetFov = proj === 'wide' ? 80 : 50;
        cam.fov += (targetFov - cam.fov) * 0.1;
        cam.updateProjectionMatrix();
      }
    }

    // Get model's actual yaw (Euler Y, rad) — already matches the visual rotation
    const modelYaw = aircraftControlsRef.current.modelYaw || 0;

    // Rotate the baseOffset by model yaw to stay behind the aircraft
    const rotatedOffset = baseOffset.current.clone();
    rotatedOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), modelYaw);

    // Instant snap to target — no lerp, so mouse drag and zoom work immediately
    camera.position.copy(rotatedOffset);

    // Look at world origin (aircraft is centered here thanks to WorldGroup)
    camera.lookAt(0, 0, 0);
  });

  return null;
});

CameraController.displayName = 'CameraController';
export { CameraController };

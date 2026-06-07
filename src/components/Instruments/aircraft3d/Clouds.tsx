/// <reference types="@react-three/fiber" />
/**
 * Clouds.tsx — динамическая генерация облаков по курсу полёта.
 *
 * Облака появляются впереди самолёта (слева/справа от курса) на случайной
 * дальности. Когда самолёт удаляется от облака — оно деактивируется и
 * перерождается в новом месте. Не более POOL_SIZE групп одновременно.
 *
 * Все пуфы используют одну общую геометрию + один материал → минимум draw-calls.
 */
import { useMemo, useEffect, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { telemetryRef } from '../../../telemetryRef';
import { aircraftPosition } from './aircraftPosition';

/* ─── Config ─── */
const POOL_SIZE = 6;           // max active cloud groups
const SPAWN_INTERVAL = 5;      // seconds between spawn attempts
const CULL_DIST = 350;         // deactivate when farther than this
const SPAWN_AHEAD_MIN = 100;   // min distance ahead to spawn
const SPAWN_AHEAD_MAX = 250;   // max distance ahead
const LATERAL_MIN = 30;        // min lateral offset from heading
const LATERAL_MAX = 110;       // max lateral offset
const ALT_MIN = 20;            // min cloud altitude
const ALT_MAX = 75;            // max cloud altitude
const MAX_PUFFS = 4;           // max puffs per cloud group
const DEG = Math.PI / 180;

/* ─── Puff templates (offsets relative to cloud group center) ─── */
const PUFF_TEMPLATES: ReadonlyArray<{
  offset: [number, number, number];
  scale: [number, number, number];
}> = [
  { offset: [0, 0, 0],      scale: [14, 3.5, 10] },
  { offset: [8, 2, 5],      scale: [10, 2.8, 7] },
  { offset: [-7, 1, -4],    scale: [9, 2.2, 6] },
  { offset: [3, -1, -6],    scale: [7, 2.0, 5] },
];

/* ─── Cloud data structure ─── */
interface CloudData {
  /** World-space position where this cloud was spawned */
  wx: number;
  wy: number;
  wz: number;
  active: boolean;
  puffCount: number;
}

/* ─── Helpers ─── */
const finite = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : 0;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export const Clouds: React.FC = memo(() => {
  const geom = useMemo(() => new THREE.SphereGeometry(1, 8, 5), []);
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.45,
        roughness: 1,
        depthWrite: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      geom.dispose();
      mat.dispose();
    },
    [geom, mat],
  );

  /* ─── Cloud pool (refs — no re-renders) ─── */
  const pool = useRef<CloudData[]>(
    Array.from({ length: POOL_SIZE }, () => ({
      wx: 0, wy: 0, wz: 0,
      active: false,
      puffCount: 2,
    })),
  );

  const meshRefs = useRef<(THREE.Mesh | null)[][]>(
    Array.from({ length: POOL_SIZE }, () => Array(MAX_PUFFS).fill(null)),
  );

  const timer = useRef(0);

  /* ─── Spawn a cloud ahead of aircraft ─── */
  const spawnCloud = (cloud: CloudData) => {
    const f = telemetryRef.current;
    const heading = f ? finite(f.Heading1) : 0;
    const hRad = heading * DEG;

    const ahead = rand(SPAWN_AHEAD_MIN, SPAWN_AHEAD_MAX);
    const lateral = rand(LATERAL_MIN, LATERAL_MAX) * (Math.random() > 0.5 ? 1 : -1);

    // Position ahead of aircraft in world space
    cloud.wx = aircraftPosition.x - Math.sin(hRad) * ahead + Math.cos(hRad) * lateral;
    cloud.wz = aircraftPosition.z - Math.cos(hRad) * ahead - Math.sin(hRad) * lateral;
    cloud.wy = rand(ALT_MIN, ALT_MAX);
    cloud.active = true;
    cloud.puffCount = 2 + Math.floor(Math.random() * (MAX_PUFFS - 1)); // 2–4
  };

  /* ─── Frame update: cull + spawn + sync mesh positions ─── */
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);
    const ax = aircraftPosition.x;
    const az = aircraftPosition.z;
    const clouds = pool.current;

    // Cull distant clouds
    for (const c of clouds) {
      if (!c.active) continue;
      const dx = c.wx - ax;
      const dz = c.wz - az;
      if (dx * dx + dz * dz > CULL_DIST * CULL_DIST) {
        c.active = false;
      }
    }

    // Periodic spawn
    timer.current += dt;
    if (timer.current >= SPAWN_INTERVAL) {
      timer.current = 0;
      const inactive = clouds.find((c) => !c.active);
      if (inactive) spawnCloud(inactive);
    }

    // Also try to fill empty slots at start (first few seconds)
    const activeCount = clouds.filter((c) => c.active).length;
    if (activeCount < 3) {
      const slot = clouds.find((c) => !c.active);
      if (slot) spawnCloud(slot);
    }

    // Sync mesh positions (world-space, since parent WorldGroup offsets)
    for (let i = 0; i < POOL_SIZE; i++) {
      const c = clouds[i];
      for (let j = 0; j < MAX_PUFFS; j++) {
        const mesh = meshRefs.current[i][j];
        if (!mesh) continue;

        if (c.active && j < c.puffCount) {
          const tmpl = PUFF_TEMPLATES[j];
          mesh.visible = true;
          mesh.position.set(
            c.wx + tmpl.offset[0],
            c.wy + tmpl.offset[1],
            c.wz + tmpl.offset[2],
          );
          mesh.scale.set(tmpl.scale[0], tmpl.scale[1], tmpl.scale[2]);
        } else {
          mesh.visible = false;
        }
      }
    }
  });

  return (
    <group>
      {pool.current.map((_, i) =>
        PUFF_TEMPLATES.map((_, j) => (
          <mesh
            key={`${i}-${j}`}
            ref={(el) => { meshRefs.current[i][j] = el; }}
            geometry={geom}
            material={mat}
            visible={false}
          />
        )),
      )}
    </group>
  );
});

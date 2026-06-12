/// <reference types="@react-three/fiber" />
/**
 * Trees.tsx — пул редких деревьев на земле для визуального референса.
 *
 * Деревья статично разбросаны по большой площади (радиус 4000).
 * При удалении от самолёта — перерождаются на новой позиции в пределах радиуса.
 * Каждое дерево: коричневый ствол (cylinder) + зелёная крона (cone).
 *
 * Использует отдельные mesh с явной установкой position в мировых координатах
 * (как Clouds) — поэтому работает корректно внутри WorldGroup.
 */
import { useMemo, useRef, memo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { aircraftPosition } from './aircraftPosition';

/* ─── Config ─── */
const TREE_COUNT = 2000;       // активных деревьев
const AREA_RADIUS = 4000;      // радиус разброса
const CULL_DIST = 3500;        // если дальше — переродить ближе

const TRUNK_H = 1.4;
const TRUNK_TOP_R = 0.05;
const TRUNK_BOT_R = 0.12;
const CROWN_R = 1.0;
const CROWN_H = 2.5;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/* ─── Позиция в круге ─── */
const randomPos = (radius: number): [number, number] => {
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * radius;
  return [Math.cos(angle) * r, Math.sin(angle) * r];
};

/* ─── Компонент ─── */
export const Trees: React.FC = memo(() => {
  /* ─── Shared geometry & material ─── */
  const trunkGeom = useMemo(
    () => new THREE.CylinderGeometry(TRUNK_TOP_R, TRUNK_BOT_R, TRUNK_H, 6),
    [],
  );
  const crownGeom = useMemo(
    () => new THREE.ConeGeometry(CROWN_R, CROWN_H, 6),
    [],
  );
  const trunkMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#5c3a1e', roughness: 0.9 }),
    [],
  );
  const crownMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2d6a1e', roughness: 0.8 }),
    [],
  );

  useEffect(
    () => () => {
      trunkGeom.dispose();
      crownGeom.dispose();
      trunkMat.dispose();
      crownMat.dispose();
    },
    [trunkGeom, crownGeom, trunkMat, crownMat],
  );

  /* ─── Пул деревьев: мировые координаты ─── */
  const pool = useRef<{ wx: number; wz: number; scale: number }[]>(
    Array.from({ length: TREE_COUNT }, () => {
      const [wx, wz] = randomPos(AREA_RADIUS);
      return { wx, wz, scale: rand(0.4, 1.0) };
    }),
  );

  /* ─── Refs на mesh ─── */
  const trunkRefs = useRef<(THREE.Mesh | null)[][]>(
    Array.from({ length: TREE_COUNT }, () => [null, null]),
  );

  /* ─── Frame update (WorldGroup moves world, trees are static in local space) ─── */
  useFrame(() => {
    const ax = aircraftPosition.x;
    const az = aircraftPosition.z;
    const cullSq = CULL_DIST * CULL_DIST;
    const outerSq = AREA_RADIUS * AREA_RADIUS;
    const trees = pool.current;

    for (let i = 0; i < TREE_COUNT; i++) {
      const t = trees[i];
      const trunk = trunkRefs.current[i][0];
      const crown = trunkRefs.current[i][1];
      if (!trunk || !crown) continue;

      const dx = t.wx - ax;
      const dz = t.wz - az;
      if (dx * dx + dz * dz > cullSq) {
        // Переродить ближе к самолёту
        const [wx, wz] = randomPos(outerSq);
        t.wx = wx;
        t.wz = wz;
        t.scale = rand(0.4, 1.0);
      }

      const s = t.scale;
      // Y: WorldGroup уже сдвигает мир на -aircraftPosition.y,
      // поэтому деревья просто стоят на земле (Y=-6) в локальных координатах
      trunk.position.set(t.wx, -6 + (TRUNK_H * s) / 2, t.wz);
      trunk.scale.set(s, s, s);
      crown.position.set(t.wx, -6 + TRUNK_H * s + (CROWN_H * s) / 2, t.wz);
      crown.scale.set(s, s, s);
    }
  });

  return (
    <group>
      {pool.current.map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => { trunkRefs.current[i][0] = el; }}
            geometry={trunkGeom}
            material={trunkMat}
            receiveShadow
          />
          <mesh
            ref={(el) => { trunkRefs.current[i][1] = el; }}
            geometry={crownGeom}
            material={crownMat}
            receiveShadow
          />
        </group>
      ))}
    </group>
  );
});

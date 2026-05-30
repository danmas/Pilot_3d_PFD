/// <reference types="@react-three/fiber" />
/**
 * Clouds.tsx — лёгкие облака для 3D-сцены «Самолёт».
 *
 * Несколько групп сплюснутых сфероидов, разбросанных по небу.
 * Все «пуффы» используют одну общую геометрию + один материал → минимум draw-calls.
 */
import { useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';

/* Puff positions & scales for each cloud group */
const PUFFS: ReadonlyArray<{
  pos: [number, number, number];
  scale: [number, number, number];
}> = [
  // Group 1 — front-left, low
  { pos: [-40, 30, -60], scale: [12, 3.0, 8] },
  { pos: [-33, 32, -55], scale: [9,  2.5, 6] },
  { pos: [-48, 31, -58], scale: [7,  2.0, 5] },

  // Group 2 — right, mid-height
  { pos: [55, 50, 25], scale: [14, 3.5, 10] },
  { pos: [63, 52, 30], scale: [10, 2.8, 7] },
  { pos: [48, 51, 22], scale: [8,  2.2, 6] },

  // Group 3 — behind, high
  { pos: [-20, 68, 72], scale: [16, 4.0, 11] },
  { pos: [-10, 70, 76], scale: [12, 3.2, 8] },
  { pos: [-28, 69, 68], scale: [10, 2.6, 7] },

  // Group 4 — front-right, low
  { pos: [30, 24, -82], scale: [10, 2.5, 7] },
  { pos: [38, 26, -78], scale: [8,  2.0, 5] },

  // Group 5 — far left, mid
  { pos: [-72, 44, 42], scale: [11, 3.0, 8] },
  { pos: [-65, 46, 46], scale: [8,  2.4, 6] },
];

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

  return (
    <group>
      {PUFFS.map((p, i) => (
        <mesh
          key={i}
          geometry={geom}
          material={mat}
          position={p.pos}
          scale={p.scale}
        />
      ))}
    </group>
  );
});

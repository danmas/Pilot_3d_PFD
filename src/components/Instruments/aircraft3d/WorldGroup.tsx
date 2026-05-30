/// <reference types="@react-three/fiber" />
/**
 * WorldGroup.tsx — обёртка для мира (небо, земля, облака).
 *
 * Сдвигает всё содержимое в сторону, противоположную накопленной позиции
 * самолёта (aircraftPosition).  Камера орбитирует вокруг (0,0,0), где
 * всегда находится самолёт, а мир «проносится» мимо — создавая ощущение
 * настоящего полёта вперёд.
 */
import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { aircraftPosition } from './aircraftPosition';

export const WorldGroup: React.FC<{ children: React.ReactNode }> = memo(({ children }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    // Move the world opposite to the accumulated aircraft position
    g.position.x = -aircraftPosition.x;
    g.position.z = -aircraftPosition.z;
  });

  return <group ref={groupRef}>{children}</group>;
});

/// <reference types="@react-three/fiber" />
/**
 * VelocityVector.tsx — вектор траектории полёта (path vector).
 *
 * Линия из носа самолётика в направлении движения.
 * Позволяет визуально отличить направление носа от реального
 * направления полёта (скольжение, набор высоты / снижение).
 *
 * vyMps > 0 → линия направлена вверх (набор высоты)
 * vyMps < 0 → линия направлена вниз (снижение)
 */
import { useMemo } from 'react';
import * as THREE from 'three';

const ARROW_COLOR = '#00ff88';
const ARROW_LENGTH = 3.0;

interface VelocityVectorProps {
  /** Вертикальная скорость, м/с (знак определяет направление) */
  vyMps: number;
  /** Воздушная скорость (для масштабирования длины, опционально) */
  casKts: number;
}

export const VelocityVector: React.FC<VelocityVectorProps> = ({ vyMps, casKts }) => {
  // Визуальный угол наклона вектора: clamp ±30° при |Vy| > 20 м/с
  const clampedVy = Math.max(-20, Math.min(20, vyMps));
  const tiltRad = (clampedVy / 20) * (Math.PI / 6); // ±30°

  const length = ARROW_LENGTH * Math.min(1, casKts / 150);

  const endY = Math.sin(tiltRad) * length;
  const endZ = -Math.cos(tiltRad) * length;

  const lineObj = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, -2.2), // from nose
      new THREE.Vector3(0, endY, endZ - 2.2),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color: ARROW_COLOR });
    return new THREE.Line(geo, mat);
  }, [endY, endZ]);

  return <primitive object={lineObj} />;
};

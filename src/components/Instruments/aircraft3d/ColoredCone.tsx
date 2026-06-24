/**
 * ColoredCone.tsx — цветной конус-маркер на земле.
 *
 * Стоит статично в WorldGroup (Y=-6). Цвет и XZ задаются пропсами.
 */
import { memo } from 'react';
import * as THREE from 'three';

interface ColoredConeProps {
  color: string;
  x?: number;
  z?: number;
}

const R = 6;
const H = 15;
const GY = -6;

export const ColoredCone: React.FC<ColoredConeProps> = memo(({ color, x = 0, z = 0 }) => {
  return (
    <mesh position={[x, GY + H / 2, z]} castShadow>
      <coneGeometry args={[R, H, 6]} />
      <meshStandardMaterial color={color} roughness={0.5} />
    </mesh>
  );
});

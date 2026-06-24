/**
 * RedTree.tsx — красная ёлка-маркер рядом с ВПП.
 *
 * Стоит статично на земле (Y=-6). WorldGroup сам сдвинет весь мир.
 */
import { memo } from 'react';
import * as THREE from 'three';

export const RedTree: React.FC = memo(() => {
  return (
    <mesh position={[0, -6 + 7.5, 0]} castShadow>
      <coneGeometry args={[6, 15, 6]} />
      <meshStandardMaterial color="red" roughness={0.5} />
    </mesh>
  );
});

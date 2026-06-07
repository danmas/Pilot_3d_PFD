/**
 * RedTree.tsx — красная ёлка-маркер рядом с ВПП.
 *
 * Компенсирует сдвиг WorldGroup по Y, чтобы оставаться на земле.
 * Создана для визуальной проверки работы WorldGroup + компенсации.
 */
import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { aircraftPosition } from './aircraftPosition';

export const RedTree: React.FC = memo(() => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const m = ref.current;
    if (m) {
      // Compensate WorldGroup Y offset: stay on ground
      m.position.y = -6 + 7.5 - aircraftPosition.y;
    }
  });

  return (
    <mesh ref={ref} position={[20, -6 + 7.5, 40]} castShadow>
      <coneGeometry args={[6, 15, 6]} />
      <meshStandardMaterial color="red" roughness={0.5} />
    </mesh>
  );
});

/// <reference types="@react-three/fiber" />
/**
 * Ground.tsx — бесконечная земля для 3D-сцены «Самолёт».
 *
 * Большой круглый диск (CircleGeometry), который:
 *  • Следит за самолётом по XZ (как WorldGroup)
 *  • Опускается синхронно с WorldGroup — по aircraftPosition.y, а не по alt
 *  • Плавно растворяется к краям через шейдер — нет видимой границы
 *
 * ВАЖНО: GroundDisc НЕ внутри WorldGroup. WorldGroup сдвигает мир на
 * -aircraftPosition, но Runway/Trees/RedTree компенсируют этот сдвиг обратно.
 * GroundDisc должен двигаться параллельно с ними — используем ту же формулу.
 *
 * Рендерится ДО HorizonSphere (renderOrder −2), чтобы прозрачные края
 * корректно накладывались на землю сферы.
 */
import { useMemo, useEffect, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { aircraftPosition } from './aircraftPosition';

/* ── Shaders for seamless ground disc ── */
const GROUND_VERT = /* glsl */ `
  varying float vDist;
  void main() {
    vDist = length(position.xy);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GROUND_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uRadius;
  varying float vDist;

  void main() {
    float fadeStart = uRadius * 0.55;
    float t = smoothstep(fadeStart, uRadius, vDist);
    float alpha = 1.0 - t;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const DISC_RADIUS = 5000;

export const GroundDisc: React.FC = memo(() => {
  const groupRef = useRef<THREE.Group>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GROUND_VERT,
        fragmentShader: GROUND_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color('#4a7a3a') },
          uRadius: { value: DISC_RADIUS },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const geometry = useMemo(
    () => new THREE.CircleGeometry(DISC_RADIUS, 64),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  /* ── Follow aircraft XZ + altitude Y (via aircraftPosition) ── */
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;

    // Follow aircraft horizontal position
    g.position.x = aircraftPosition.x;
    g.position.z = aircraftPosition.z;

    // Y: follow aircraftPosition.y (same as WorldGroup offset)
    // so ground descends at the same rate as the world shifts
    const targetY = -6 - aircraftPosition.y;
    g.position.y += (targetY - g.position.y) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -6, 0]}
        renderOrder={-2}
        frustumCulled={false}
        material={material}
        geometry={geometry}
      />
    </group>
  );
});

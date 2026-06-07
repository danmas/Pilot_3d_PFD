/// <reference types="@react-three/fiber" />
/**
 * Ground.tsx — бесконечная земля для 3D-сцены «Самолёт».
 *
 * Большой круглый диск (CircleGeometry), который:
 *  • Следует за самолётом (всегда под ним по XZ)
 *  • Опускается по высоте (RAltitude)
 *  • Плавно растворяется к краям через шейдер — нет видимой границы
 *
 * Рендерится ДО HorizonSphere (renderOrder −2), чтобы прозрачные края
 * корректно накладывались на землю сферы.
 */
import { useMemo, useEffect, useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { telemetryRef } from '../../../telemetryRef';
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

  /* ── Follow aircraft XZ + altitude Y ── */
  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    const f = telemetryRef.current;
    if (!f) return;

    // Follow aircraft horizontal position
    g.position.x = aircraftPosition.x;
    g.position.z = aircraftPosition.z;

    // Altitude — ground follows aircraft downward very gently
    const alt =
      typeof f.RAltitude === 'number' && Number.isFinite(f.RAltitude)
        ? f.RAltitude
        : 0;
    const targetY = -6 - alt / 500;
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

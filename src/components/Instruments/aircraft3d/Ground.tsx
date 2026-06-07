/// <reference types="@react-three/fiber" />
/*
 * Ground.tsx — бесконечная земля для 3D-сцены «Самолёт».
 *
 * Большой круглый диск (CircleGeometry), который:
 *  • Находится внутри WorldGroup (вместе с деревьями, ВПП, облаками)
 *  • Следит за самолётом по XZ (через WorldGroup)
 *  • Плавно растворяется к краям через шейдер — нет видимой границы
 *
 * ВАЖНО: Внутри WorldGroup земля двигается синхронно с деревьями и ВПП,
 * поэтому при наборе высоты все объекты остаются на одном уровне.
 *
 * Рендерится ДО HorizonSphere (renderOrder −2), чтобы прозрачные края
 * корректно накладывались на землю сферы.
 */
import { useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';

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

  /* Статичный диск на Y=-6. Внутри WorldGroup он двигается вместе
     со всем миром — синхронно с деревьями, ВПП и облаками. */
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -6, 0]}
      renderOrder={-2}
      frustumCulled={false}
      material={material}
      geometry={geometry}
    />
  );
});

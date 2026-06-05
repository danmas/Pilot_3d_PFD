/// <reference types="@react-three/fiber" />
/**
 * HorizonSphere.tsx — небесная сфера: небо сверху, земля снизу, яркая линия горизонта.
 *
 * Сфера привязана к мировым координатам (не вращается вместе с самолётом),
 * поэтому при крене/тангаже горизонт визуально «наклоняется» — это даёт
 * мгновенное понимание ориентации.
 */
import { useMemo } from 'react';
import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vWorldPos;

  void main() {
    float y = normalize(vWorldPos).y;

    // Sky gradient: deep blue at zenith → pale blue near horizon
    vec3 skyDeep  = vec3(0.05, 0.15, 0.45);
    vec3 skyPale  = vec3(0.55, 0.72, 0.90);

    // Ground gradient: pale tan near horizon → dark brown below
    vec3 gndPale  = vec3(0.60, 0.48, 0.35);
    vec3 gndDeep  = vec3(0.18, 0.12, 0.08);

    vec3 color;
    if (y > 0.0) {
      color = mix(skyPale, skyDeep, smoothstep(0.0, 0.6, y));
    } else {
      color = mix(gndPale, gndDeep, smoothstep(0.0, -0.6, y));
    }

    // Bright horizon line
    float horizonGlow = 1.0 - smoothstep(0.0, 0.025, abs(y));
    color = mix(color, vec3(1.0, 0.95, 0.85), horizonGlow * 0.75);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const HORIZON_RADIUS = 200;

export const HorizonSphere: React.FC = () => {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, []);

  const geometry = useMemo(() => new THREE.SphereGeometry(HORIZON_RADIUS, 32, 16), []);

  return (
    <mesh renderOrder={-1} material={material} geometry={geometry} />
  );
};

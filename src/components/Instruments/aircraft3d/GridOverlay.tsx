/**
 * GridOverlay.tsx — неподвижная сетка на земле (внутри WorldGroup).
 * Привязана к мировой системе координат — не следует за самолётом.
 */
import { useMemo, useEffect, memo } from 'react';
import * as THREE from 'three';

const GRID_SIZE = 2000;
const GRID_DIVS = 200;
const GRID_Y = -6; // уровень земли

export const GridOverlay: React.FC = memo(() => {
  const gridHelper = useMemo(() => {
    const gh = new THREE.GridHelper(GRID_SIZE, GRID_DIVS, 0x448844, 0x224422);
    (gh.material as THREE.Material).transparent = true;
    (gh.material as THREE.Material).opacity = 0.25;
    (gh.material as THREE.Material).depthWrite = false;
    gh.renderOrder = -1;
    gh.frustumCulled = false;
    gh.position.y = GRID_Y;
    return gh;
  }, []);

  useEffect(() => {
    return () => {
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
    };
  }, [gridHelper]);

  return <primitive object={gridHelper} />;
});

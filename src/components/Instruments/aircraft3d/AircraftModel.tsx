import React, { useMemo, useRef, useEffect, Suspense, memo, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { ModelEntry } from './modelConfig';
import { telemetryRef } from '../../../telemetryRef';
import { aircraftPosition, groundTouch } from './aircraftPosition';
import { aircraftControlsRef } from '../../../aircraftControlsRef';
import {
  createImprovedState,
  tickImprovedFdm,
  resetImprovedState,
  activeImprovedStateRef,
  type ImprovedState,
} from './flightModel';
import { loadFdmParams } from './flightModel';

const DEG = Math.PI / 180;

/* ─────────────────── Пропсы ─────────────────── */
export interface AircraftModelProps {
  model?: ModelEntry;
  /** Флаг использования Improved FDM */
  useImprovedFdm?: boolean;
  /** Коллбэк при смене FDM (для UI) */
  onFdmChange?: (improved: boolean) => void;
}

/* ─────────────────── Главный компонент ─────────────────── */
export const AircraftModel: React.FC<AircraftModelProps> = memo(({
  model,
  useImprovedFdm: useImprovedProp,
  onFdmChange,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const eulerRef = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  /** Накопленный курс (legacy) */
  const headingAccumRef = useRef(0);
  /** Состояние Improved FDM */
  const improvedState = useRef<ImprovedState>(createImprovedState());
  /** Флаг инициализации improved */
  const improvedInit = useRef(false);

  useFrame((_state, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const override = aircraftControlsRef.current;
    const improved = useImprovedProp ?? false;

    if (improved) {
      /* ── Improved FDM ── */
      const st = improvedState.current;
      activeImprovedStateRef.current = st;
      if (!improvedInit.current) {
        // Load params from storage on first tick
        const saved = loadFdmParams();
        st.params = saved.params;
        resetImprovedState(st);
        improvedInit.current = true;
      }

      // Преобразуем controls в органы управления
      // В manual mode джойстики активны, иначе читаем из telemetry (auto)
      if (override.active) {
        // Левый джойстик: X → элероны, Y → элеватор (инвертирован)
        // Чувствительность из параметров
        const sens = st.params.joystickSensitivity;
        st.ailerons = override.roll * sens;
        st.elevator = override.pitch * sens;
        st.rudder = override.yaw * sens;
        st.throttle = override.throttle; // 0..1, положение РУД
      } else if (!override.telemetryLocked) {
        // Auto mode: читаем из телеметрии
        const f = telemetryRef.current;
        if (f) {
          st.elevator = -(typeof f.PitchAngle === 'number' ? f.PitchAngle : 0) / 30;
          st.ailerons = (typeof f.RollAngle === 'number' ? f.RollAngle : 0) / 30;
          st.rudder = 0;
          st.heading = typeof f.Heading1 === 'number' ? f.Heading1 :
                       typeof f.MagneticHeading === 'number' ? f.MagneticHeading : st.heading;
          st.speed = typeof f.CAS === 'number' ? f.CAS : st.speed;
        }
      } else {
        // Manual idle: органы в нейтраль
        st.elevator = 0;
        st.ailerons = 0;
        st.rudder = 0;
      }

      // Создаём временный frame для записи
      const outFrame: any = {};
      tickImprovedFdm(delta, st, outFrame);

      // Синхронизируем rotation группы
      const pitchRad = outFrame.PitchAngle * DEG;
      const rollRad = outFrame.RollAngle * DEG;
      const headingRad = outFrame.Heading1 * DEG;
      g.rotation.order = 'YXZ';
      g.rotation.x = pitchRad;
      g.rotation.y = -headingRad;
      g.rotation.z = rollRad;

      // Записываем в telemetryRef для других инструментов
      if (override.telemetryLocked || override.active) {
        telemetryRef.current = {
          ...(telemetryRef.current || {}),
          ...outFrame,
        };
        override.onTelemetryUpdate?.(telemetryRef.current);
      }

      override.modelYaw = g.rotation.y;
    } else {
      /* ── Simple (legacy) FDM ── */
      if (improvedInit.current) {
        improvedInit.current = false;
      }

      g.rotation.order = 'YXZ';

      let pitchDeg = 0, rollDeg = 0, headingDeg = 0;

      if (override.active) {
        // Manual control
        if (!override._wasActive) {
          const currentHeadingDeg = -g.rotation.y / DEG;
          headingAccumRef.current = currentHeadingDeg;
          headingDeg = currentHeadingDeg;
          override._wasActive = true;
        } else {
          const dt = Math.min(delta, 0.1);
          headingAccumRef.current += override.yaw * dt;
          headingDeg = headingAccumRef.current;
        }
        pitchDeg = override.pitch;
        rollDeg = override.roll;
      } else if (!override.telemetryLocked) {
        // Auto mode
        const f = telemetryRef.current;
        if (!f) return;
        pitchDeg = typeof f.PitchAngle === 'number' && Number.isFinite(f.PitchAngle) ? f.PitchAngle : 0;
        rollDeg = typeof f.RollAngle === 'number' && Number.isFinite(f.RollAngle) ? f.RollAngle : 0;
        headingDeg = typeof f.Heading1 === 'number' && Number.isFinite(f.Heading1) ? f.Heading1 :
                      typeof f.MagneticHeading === 'number' && Number.isFinite(f.MagneticHeading) ? f.MagneticHeading :
                      (-g.rotation.y / DEG);
        headingAccumRef.current = headingDeg;
        override._wasActive = false;
      } else {
        // Manual idle
        pitchDeg = 0;
        rollDeg = 0;
        headingDeg = -g.rotation.y / DEG;
        headingAccumRef.current = headingDeg;
        override._wasActive = false;
      }

      const pitchRad = pitchDeg * DEG;
      const rollRad = rollDeg * DEG;
      const headingRad = headingDeg * DEG;

      const target = eulerRef.current;
      target.set(pitchRad, -headingRad, rollRad, 'YXZ');
      g.rotation.x += (target.x - g.rotation.x) * 0.12;
      g.rotation.y += (target.y - g.rotation.y) * 0.12;
      g.rotation.z += (target.z - g.rotation.z) * 0.12;

      override.modelYaw = g.rotation.y;

      // Sync telemetryRef for manual mode
      if (override.telemetryLocked) {
        const last = telemetryRef.current;
        const altFt = Math.max(0, aircraftPosition.y * 3.28084);
        const radioAltFt = Math.max(0, (aircraftPosition.y - GROUND_Y) * 3.28084);
        const throttle = override.throttle ?? 0;
        telemetryRef.current = {
          ...(last || {}),
          schema: 'telemetry-frame.v1',
          seq: (last?.seq ?? 0) + 1,
          timeMs: (last?.timeMs ?? 0) + (delta * 1000),
          source: last?.source ?? 'manual',
          receivedAt: new Date().toISOString(),
          // Attitude
          PitchAngle: pitchDeg,
          RollAngle: rollDeg,
          Heading1: headingDeg,
          MagneticHeading: headingDeg,
          // Air data
          CAS: 250,
          BaroAltitude: altFt,
          dec_BaroAltFt: altFt,
          RadioAltitude: radioAltFt,
          dec_RadioAltFt: radioAltFt,
          StandardAltitude: altFt,
          SpeedSelect: 250,
          Vy: pitchDeg * 500,
          RAltitude: radioAltFt,
          // Angle of attack
          AoA: pitchDeg * 0.3,
          // G-force
          NormalG: 1.0 + Math.abs(rollDeg) / 100,
          dec_G: 1.0 + Math.abs(rollDeg) / 100,
          // Flight director (not simulated)
          FD_PitchCmd: 0,
          FD_RollCmd: 0,
          // Nav (not simulated)
          HeadingSelect: headingDeg,
          DME_Distance: 0,
          // Engine
          Engine_N1_Left: 20 + throttle * 80,
          Engine_N1_Right: 20 + throttle * 80,
          TotalFuel: 12000,
          // APU
          APU_EGT: 400 + throttle * 400,
          APU_OilPressure: 3.5,
          APU_OilTemp: 80,
          // Configuration
          FlapsPosition: 0,
          SlatsPosition: 0,
          StabPosition: 0,
          Airbrake_Inner_Cmd: 0,
          Elev_Left_Inner: 0,
          Elev_Left_Outer: 0,
          Elev_Right_Inner: 0,
          Elev_Right_Outer: 0,
        };
        override.onTelemetryUpdate?.(telemetryRef.current);
      }

      // Always move forward
      const cas = 250;
      const speedWU = cas * 0.5144 / 40;
      const dt = Math.min(delta, 0.1);
      const hRad = -headingDeg * DEG;
      const pRad = pitchDeg * DEG;
      const forwardHoriz = Math.cos(pRad);
      aircraftPosition.x += -Math.sin(hRad) * speedWU * forwardHoriz * dt;
      aircraftPosition.z += -Math.cos(hRad) * speedWU * forwardHoriz * dt;
      const prevY = aircraftPosition.y;
      aircraftPosition.y += Math.sin(pRad) * speedWU * dt;

      // Ground clamp & touch
      if (aircraftPosition.y < GROUND_Y) {
        aircraftPosition.y = GROUND_Y;
      }
      if (!groundTouch.touched && prevY > GROUND_Y && aircraftPosition.y <= GROUND_Y) {
        groundTouch.touched = true;
        groundTouch.since = performance.now();
      }

      const LIMIT = 2000;
      if (Math.abs(aircraftPosition.x) > LIMIT || Math.abs(aircraftPosition.z) > LIMIT) {
        aircraftPosition.x = 0;
        aircraftPosition.z = 0;
      }
    }
  });

  const useGlb = model?.url != null;
  const ox = model?.offsetX ?? 0;
  const oy = model?.offsetY ?? 0;
  const oz = model?.offsetZ ?? 0;

  return (
    <group ref={groupRef} position={[ox, oy, oz]} frustumCulled={false}>
      {useGlb ? (
        <Suspense fallback={null}>
          <GLBAircraft
            url={model.url!}
            scale={model.scale ?? 1}
            yawOffsetDeg={model.yawOffsetDeg ?? 0}
          />
        </Suspense>
      ) : (
        <PrimitiveAircraft />
      )}
    </group>
  );
});

/* ─────────────────── SCENE WRAPPER ─────────────────── */

export const GROUND_Y = -6; // re-export

/* ─────────────────── Процедурная модель (примитивы) ─────────────────── */

const PrimitiveAircraft: React.FC = memo(() => {
  const bodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d8d8d8', metalness: 0.35, roughness: 0.55 }),
    [],
  );
  const accentMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#2563eb', metalness: 0.35, roughness: 0.6 }),
    [],
  );

  const fuseCylGeom = useMemo(() => new THREE.CylinderGeometry(0.35, 0.35, 3.0, 12), []);
  const fuseSphereGeom = useMemo(() => new THREE.SphereGeometry(0.35, 12, 8), []);
  const noseGeom = useMemo(() => new THREE.ConeGeometry(0.36, 0.7, 16), []);
  const wingsGeom = useMemo(() => new THREE.BoxGeometry(7.0, 0.07, 1.3), []);
  const stabilizerGeom = useMemo(() => new THREE.BoxGeometry(2.6, 0.06, 0.75), []);
  const finGeom = useMemo(() => new THREE.BoxGeometry(0.06, 1.3, 0.85), []);
  const engineGeom = useMemo(() => new THREE.CylinderGeometry(0.22, 0.22, 1.1, 8), []);

  useEffect(() => {
    return () => {
      fuseCylGeom.dispose();
      fuseSphereGeom.dispose();
      noseGeom.dispose();
      wingsGeom.dispose();
      stabilizerGeom.dispose();
      finGeom.dispose();
      engineGeom.dispose();
      bodyMat.dispose();
      accentMat.dispose();
    };
  }, [fuseCylGeom, fuseSphereGeom, noseGeom, wingsGeom, stabilizerGeom, finGeom, engineGeom, bodyMat, accentMat]);

  return (
    <>
      <mesh material={bodyMat} geometry={fuseCylGeom} rotation={[Math.PI / 2, 0, 0]} />
      <mesh material={bodyMat} geometry={fuseSphereGeom} position={[0, 0, -1.5]} />
      <mesh material={bodyMat} geometry={fuseSphereGeom} position={[0, 0, 1.5]} />
      <mesh material={accentMat} geometry={noseGeom} position={[0, 0, -1.85]} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh material={accentMat} geometry={wingsGeom} position={[0, 0.02, 0.1]} />
      <mesh material={accentMat} geometry={stabilizerGeom} position={[0, 0.02, 1.75]} />
      <mesh material={accentMat} geometry={finGeom} position={[0, 0.75, 1.55]} />
      <mesh material={bodyMat} geometry={engineGeom} position={[-1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh material={bodyMat} geometry={engineGeom} position={[1.6, -0.22, 0.3]} rotation={[Math.PI / 2, 0, 0]} />
    </>
  );
});

/* ─────────────────── GLB модель ─────────────────── */

const TARGET_SIZE = 8;

interface GLBAircraftProps {
  url: string;
  scale: number;
  yawOffsetDeg: number;
}

const GLBAircraft: React.FC<GLBAircraftProps> = ({ url, scale, yawOffsetDeg }) => {
  const { scene } = useGLTF(url);
  const innerRef = useRef<THREE.Group>(null);

  const { fitScale, centerOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? TARGET_SIZE / maxDim : 1;
    return {
      fitScale: s,
      centerOffset: [-center.x, -center.y, -center.z] as [number, number, number],
    };
  }, [scene]);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  return (
    <group
      ref={innerRef}
      scale={fitScale * scale}
      position={[
        centerOffset[0] * fitScale * scale,
        centerOffset[1] * fitScale * scale,
        centerOffset[2] * fitScale * scale,
      ]}
      rotation={[0, yawOffsetDeg * DEG, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  );
};

/**
 * TouchControls.tsx — композит джойстика (крен/тангаж) и слайдера (рыскание).
 *
 * Передаёт значения напрямую в aircraftControlsRef (модульный ref),
 * который читается в AircraftModel.useFrame() на каждом кадре.
 *
 * Автоматически определяет touch-устройство. На десктопе можно
 * тестировать мышью.
 *
 * Пропсы: none — читает/пишет глобальный ref.
 */
import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import Joystick from './Joystick';
import RudderSlider from './RudderSlider';
import { aircraftControlsRef } from '../../aircraftControlsRef';

/** Коэффициенты преобразования смещения джойстика (normalized -1..1) в градусы */
const MAX_PITCH = 45; // макс тангаж ±45°
const MAX_ROLL  = 60; // макс крен ±60°
const MAX_YAW   = 90; // макс рыскание ±90°

const TouchControls: React.FC = memo(() => {
  // Локальный стейт только для рендера (визуальное положение джойстика).
  // Реальные углы пишутся напрямую в aircraftControlsRef (без re-render).
  const [joy, setJoy] = useState({ x: 0, y: 0 });
  const [rudder, setRudder] = useState(0);

  const writeOverride = useCallback(
    (pitch: number, roll: number, yaw: number) => {
      aircraftControlsRef.current = {
        active: true,
        pitch,
        roll,
        yaw,
      };
    },
    [],
  );

  const clearOverride = useCallback(() => {
    aircraftControlsRef.current = {
      active: false,
      pitch: 0,
      roll: 0,
      yaw: 0,
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount (user navigates away from 3D page)
      clearOverride();
    };
  }, [clearOverride]);

  const onJoyChange = useCallback(
    (x: number, y: number) => {
      setJoy({ x, y });
      const pitch = y * MAX_PITCH;
      const roll  = x * MAX_ROLL;
      if (x === 0 && y === 0) {
        // Check if rudder is also released
        if (rudder === 0) {
          clearOverride();
          return;
        }
        writeOverride(0, 0, rudder * MAX_YAW);
      } else {
        writeOverride(pitch, roll, rudder * MAX_YAW);
      }
    },
    [rudder, writeOverride, clearOverride],
  );

  const onRudderChange = useCallback(
    (v: number) => {
      setRudder(v);
      if (v === 0 && joy.x === 0 && joy.y === 0) {
        clearOverride();
      } else {
        writeOverride(joy.y * MAX_PITCH, joy.x * MAX_ROLL, v * MAX_YAW);
      }
    },
    [joy, writeOverride, clearOverride],
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left: Joystick */}
      <div className="absolute left-4 bottom-20 pointer-events-auto">
        <Joystick value={joy} onChange={onJoyChange} size={140} />
      </div>
      {/* Right: Rudder slider */}
      <div className="absolute right-5 bottom-16 pointer-events-auto">
        <RudderSlider value={rudder} onChange={onRudderChange} height={200} />
      </div>
    </div>
  );
});

TouchControls.displayName = 'TouchControls';

export default TouchControls;

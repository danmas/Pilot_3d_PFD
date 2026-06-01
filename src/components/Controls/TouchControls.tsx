/**
 * TouchControls.tsx — композит джойстиков для мобильного управления самолётом.
 *
 * Левая сторона: крен (roll) + тангаж (pitch) — обычный джойстик с пружиной.
 * Правая сторона: рыскание (yaw) + газ (throttle) — ThrottleJoystick
 *   с фиксацией газа по вертикали и пружиной рыскания по горизонтали.
 *
 * Передаёт значения напрямую в aircraftControlsRef (модульный ref),
 * который читается в AircraftModel.useFrame() на каждом кадре.
 *
 * Пропсы: none — читает/пишет глобальный ref.
 */
import React, { useRef, useCallback, useEffect, useState, memo } from 'react';
import Joystick from './Joystick';
import ThrottleJoystick from './ThrottleJoystick';
import { aircraftControlsRef } from '../../aircraftControlsRef';

/** Коэффициенты преобразования смещения джойстика (normalized -1..1) в градусы */
const MAX_PITCH = 45;  // макс тангаж ±45°
const MAX_ROLL  = 60;  // макс крен ±60°
const MAX_YAW   = 90;  // макс рыскание ±90°

const TouchControls: React.FC = memo(() => {
  // Локальный стейт для визуального положения джойстиков.
  // Реальные углы пишутся напрямую в aircraftControlsRef (без re-render).
  const [leftJoy, setLeftJoy] = useState({ x: 0, y: 0 });     // roll + pitch
  const [rightJoy, setRightJoy] = useState({ x: 0, y: 0 });   // yaw + throttle

  const writeOverride = useCallback(
    (pitch: number, roll: number, yaw: number, throttle: number) => {
      aircraftControlsRef.current = {
        active: true,
        pitch,
        roll,
        yaw,
        throttle,
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
      throttle: 0,
    };
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount (user navigates away from 3D page)
      clearOverride();
    };
  }, [clearOverride]);

  // Left joystick: roll (x) + pitch (y)
  const onLeftChange = useCallback(
    (x: number, y: number) => {
      setLeftJoy({ x, y });
      const pitch = y * MAX_PITCH;
      const roll  = x * MAX_ROLL;
      if (x === 0 && y === 0 && rightJoy.x === 0 && rightJoy.y === 0) {
        clearOverride();
      } else {
        writeOverride(pitch, roll, rightJoy.x * MAX_YAW, rightJoy.y);
      }
    },
    [rightJoy, writeOverride, clearOverride],
  );

  // Right joystick: yaw (x) + throttle (y, with memory)
  const onRightChange = useCallback(
    (x: number, y: number) => {
      setRightJoy({ x, y });
      const yaw   = x * MAX_YAW;
      const throttle = y; // 0..1 from ThrottleJoystick
      if (x === 0 && leftJoy.x === 0 && leftJoy.y === 0) {
        // Only yaw released but throttle stays — keep override active
        if (y !== 0 && leftJoy.x === 0 && leftJoy.y === 0) {
          writeOverride(0, 0, 0, throttle);
        } else {
          clearOverride();
        }
      } else {
        writeOverride(leftJoy.y * MAX_PITCH, leftJoy.x * MAX_ROLL, yaw, throttle);
      }
    },
    [leftJoy, writeOverride, clearOverride],
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left: ThrottleJoystick (yaw + throttle, vertical lock) */}
      <div className="absolute left-4 bottom-20 pointer-events-auto">
        <ThrottleJoystick value={rightJoy} onChange={onRightChange} size={140} />
      </div>
      {/* Right: Joystick (roll + pitch) */}
      <div className="absolute right-4 bottom-20 pointer-events-auto">
        <Joystick value={leftJoy} onChange={onLeftChange} size={140} />
      </div>
    </div>
  );
});

TouchControls.displayName = 'TouchControls';

export default TouchControls;

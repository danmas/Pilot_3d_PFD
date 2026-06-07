/**
 * TouchControls.tsx — композит джойстиков для мобильного управления самолётом.
 *
 * Левая сторона (красный): ThrottleJoystick — рыскание (X) + тяга (Y, rate-mode).
 *   Горизонтальное движение → рыскание (yaw).
 *   Вертикальное движение → rate-команда тяги (-1..1, где 0=нейтраль).
 *     Вверх (dy>0) → throttle rate > 0 (тяга растёт непрерывно, пока отклонён)
 *     Вниз (dy<0) → throttle rate < 0 (тяга падает)
 *     Центр (dy=0) → throttle rate = 0 (тяга фиксируется)
 *
 * Правая сторона (синий): Joystick — крен (X) + тангаж (Y).
 *
 * Справа от левого джойстика — вертикальный индикатор положения РУД.
 * Значение throttlePosition берётся из improvedState (через outFrame)
 * и отображается как уровень заполнения.
 *
 * Передаёт значения напрямую в aircraftControlsRef (модульный ref),
 * который читается в AircraftModel.useFrame() на каждом кадре.
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
  // Локальный стейт для визуального положения джойстиков
  const [leftJoy, setLeftJoy] = useState({ x: 0, y: 0 });     // roll + pitch (синий)
  const [rightJoy, setRightJoy] = useState({ x: 0, y: 0 });   // yaw + throttle rate (красный)

  const [manualMsg, setManualMsg] = useState(false);
  const manualActivated = useRef(false);

  const writeOverride = useCallback(
    (pitch: number, roll: number, yaw: number, throttleRate: number) => {
      const ref = aircraftControlsRef.current;
      // First touch ever: lock telemetry permanently and show message once
      if (!manualActivated.current) {
        ref.telemetryLocked = true;
        manualActivated.current = true;
        setManualMsg(true);
        setTimeout(() => setManualMsg(false), 3000);
      }
      ref.active = true;
      ref.pitch = pitch;
      ref.roll = roll;
      ref.yaw = yaw;
      // throttleRate: -1..1, где 0 = нейтраль (тяга фиксируется)
      // Значение из джойстика: dy от -1 до 1
      ref.throttle = throttleRate;
    },
    [],
  );

  const clearOverride = useCallback(() => {
    const ref = aircraftControlsRef.current;
    ref.active = false;
    ref.pitch = 0;
    ref.roll = 0;
    ref.yaw = 0;
    ref.throttle = 0;
    ref._wasActive = false;
    // Don't unlock telemetry — once manual, always manual
  }, []);

  useEffect(() => {
    return () => {
      clearOverride();
    };
  }, [clearOverride]);

  // Left joystick: roll (x) + pitch (y) — правый на экране
  const onLeftChange = useCallback(
    (x: number, y: number) => {
      setLeftJoy({ x, y });
      const pitch = -y * MAX_PITCH;  // инвертирован
      const roll  = -x * MAX_ROLL;  // инвертирован
      if (x === 0 && y === 0 && rightJoy.x === 0 && rightJoy.y === 0) {
        clearOverride();
      } else {
        writeOverride(pitch, roll, rightJoy.x * MAX_YAW, rightJoy.y);
      }
    },
    [rightJoy, writeOverride, clearOverride],
  );

  // Right joystick: yaw (x) + throttle rate (y, spring return to center)
  const onRightChange = useCallback(
    (x: number, dy: number) => {
      setRightJoy({ x, y: dy });

      const yaw = x * MAX_YAW;
      if (x === 0 && dy === 0 && leftJoy.x === 0 && leftJoy.y === 0) {
        writeOverride(0, 0, 0, 0);
      } else {
        writeOverride(leftJoy.y * MAX_PITCH, leftJoy.x * MAX_ROLL, yaw, dy);
      }
    },
    [leftJoy, writeOverride],
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left area: ThrottleJoystick + throttle indicator */}
      <div className="absolute left-4 bottom-20 flex items-end gap-3 pointer-events-auto">
        <ThrottleJoystick value={rightJoy} onChange={onRightChange} size={140} />
      </div>

      {/* Manual flight notification banner */}
      {manualMsg && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none select-none z-[100]"
          style={{
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
          }}
        >
          ✈ MANUAL FLIGHT — joysticks active
        </div>
      )}

      {/* Right area: Joystick (roll + pitch) */}
      <div className="absolute right-4 bottom-20 pointer-events-auto">
        <Joystick value={leftJoy} onChange={onLeftChange} size={140} />
      </div>
    </div>
  );
});

TouchControls.displayName = 'TouchControls';

export default TouchControls;

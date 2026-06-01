/**
 * TouchControls.tsx — композит джойстиков для мобильного управления самолётом.
 *
 * Левая сторона (красный): ThrottleJoystick — рыскание (X) + дельта газа (Y, пружина).
 *   Горизонтальное движение → рыскание (yaw).
 *   Вертикальное движение → приращение газа (throttle 0..1, фиксируется отдельно).
 *
 * Правая сторона (синий): Joystick — крен (X) + тангаж (Y).
 *
 * Справа от левого джойстика — вертикальный индикатор положения рычага газа.
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

/** Чувствительность газа: сколько доли (0..1) добавлять при полном отклонении */
const THROTTLE_SENSITIVITY = 0.003;

const TouchControls: React.FC = memo(() => {
  // Локальный стейт для визуального положения джойстиков
  const [leftJoy, setLeftJoy] = useState({ x: 0, y: 0 });     // roll + pitch (синий)
  const [rightJoy, setRightJoy] = useState({ x: 0, y: 0 });   // yaw + throttle delta (красный)
  // Throttle — фиксированное положение 0..1, меняем только дельтой
  const [throttle, setThrottle] = useState(0.5); // стартуем с 50%

  const writeOverride = useCallback(
    (pitch: number, roll: number, yaw: number, throttleVal: number) => {
      aircraftControlsRef.current = {
        active: true,
        pitch,
        roll,
        yaw,
        throttle: throttleVal,
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
      clearOverride();
    };
  }, [clearOverride]);

  // Left joystick: roll (x) + pitch (y) — правый на экране
  const onLeftChange = useCallback(
    (x: number, y: number) => {
      setLeftJoy({ x, y });
      const pitch = y * MAX_PITCH;
      const roll  = -x * MAX_ROLL;  // инвертирован
      if (x === 0 && y === 0 && rightJoy.x === 0) {
        clearOverride();
      } else {
        writeOverride(pitch, roll, rightJoy.x * MAX_YAW, throttle);
      }
    },
    [rightJoy, throttle, writeOverride, clearOverride],
  );

  // Right joystick: yaw (x) + throttle delta (y, spring) — левый на экране
  const onRightChange = useCallback(
    (x: number, dy: number) => {
      setRightJoy({ x, y: dy });

      // Throttle: приращение от вертикального смещения (пружина → дельта)
      // dy > 0 = вверх = больше газа
      let newThrottle = throttle;
      if (dy !== 0) {
        newThrottle = Math.max(0, Math.min(1, throttle + dy * THROTTLE_SENSITIVITY * 10));
      }
      setThrottle(newThrottle);

      const yaw = x * MAX_YAW;
      if (x === 0 && leftJoy.x === 0 && leftJoy.y === 0) {
        writeOverride(0, 0, 0, newThrottle);
      } else {
        writeOverride(leftJoy.y * MAX_PITCH, leftJoy.x * MAX_ROLL, yaw, newThrottle);
      }
    },
    [leftJoy, throttle, writeOverride],
  );

  // Throttle indicator: вертикальная полоса справа от левого джойстика
  const throttlePercent = Math.round(throttle * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left area: ThrottleJoystick + indicator */}
      <div className="absolute left-4 bottom-20 flex items-end gap-3 pointer-events-auto">
        <ThrottleJoystick value={rightJoy} onChange={onRightChange} size={140} />
        {/* Throttle indicator column */}
        <div
          className="relative"
          style={{
            width: 24,
            height: 140,
            background: 'rgba(20, 22, 27, 0.85)',
            borderRadius: 6,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            overflow: 'hidden',
          }}
        >
          {/* Fill bar (bottom-up) */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: `${throttlePercent}%`,
              background: 'linear-gradient(to top, #dc2626, #ef4444)',
              borderRadius: '0 0 5px 5px',
              transition: 'height 0.1s ease-out',
            }}
          />
          {/* Tick marks every 25% */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute left-0 w-full pointer-events-none"
              style={{
                bottom: `${tick}%`,
                height: 1,
                background: 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
          {/* Label */}
          <div
            className="absolute bottom-0 left-0 w-full text-center pointer-events-none select-none"
            style={{
              color: 'rgba(239, 68, 68, 0.9)',
              fontSize: 10,
              fontFamily: 'monospace',
              lineHeight: '14px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}
          >
            {throttlePercent}%
          </div>
        </div>
      </div>

      {/* Right area: Joystick (roll + pitch) */}
      <div className="absolute right-4 bottom-20 pointer-events-auto">
        <Joystick value={leftJoy} onChange={onLeftChange} size={140} />
      </div>
    </div>
  );
});

TouchControls.displayName = 'TouchControls';

export default TouchControls;

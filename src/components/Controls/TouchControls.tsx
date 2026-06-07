/**
 * TouchControls.tsx — композит джойстиков для мобильного управления самолётом.
 *
 * Левая сторона (красный): ThrottleJoystick — рыскание (X).
 *   Горизонтальное движение → рыскание (yaw).
 *   Throttle — НЕ через джойстик, а тапом/свайпом по вертикальному индикатору.
 *
 * Правая сторона (синий): Joystick — крен (X) + тангаж (Y).
 *
 * Слева — вертикальный индикатор положения РУД (0..100%).
 * Тап или свайп по нему устанавливает положение РУД.
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
  const [rightJoy, setRightJoy] = useState({ x: 0, y: 0 });   // yaw (красный, только X)
  // Throttle — фиксированное положение 0..1, устанавливается тапом по столбику
  const [throttle, setThrottle] = useState(0.5);

  const [manualMsg, setManualMsg] = useState(false);
  const manualActivated = useRef(false);

  // Refs for throttle indicator (touch hit area)
  const throttleRef = useRef<HTMLDivElement>(null);

  const writeOverride = useCallback(
    (pitch: number, roll: number, yaw: number, throttleVal: number) => {
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
      ref.throttle = throttleVal; // 0..1, положение РУД
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
      const pitch = -y * MAX_PITCH;
      const roll  = -x * MAX_ROLL;
      if (x === 0 && y === 0 && rightJoy.x === 0) {
        clearOverride();
      } else {
        writeOverride(pitch, roll, rightJoy.x * MAX_YAW, throttle);
      }
    },
    [rightJoy, throttle, writeOverride, clearOverride],
  );

  // Right joystick: yaw (x) only — левый на экране
  const onRightChange = useCallback(
    (x: number, _dy: number) => {
      setRightJoy({ x, y: 0 });

      const yaw = x * MAX_YAW;
      if (x === 0 && leftJoy.x === 0 && leftJoy.y === 0) {
        writeOverride(0, 0, 0, throttle);
      } else {
        writeOverride(leftJoy.y * MAX_PITCH, leftJoy.x * MAX_ROLL, yaw, throttle);
      }
    },
    [leftJoy, throttle, writeOverride],
  );

  // Throttle indicator: touch to set position
  const handleThrottleInteraction = useCallback(
    (clientY: number) => {
      const el = throttleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // y relative to the bar, 0 = top, 1 = bottom
      const relY = 1 - (clientY - rect.top) / rect.height;
      const newThrottle = Math.max(0, Math.min(1, relY));
      setThrottle(newThrottle);
      // Write immediately
      const ref = aircraftControlsRef.current;
      ref.throttle = newThrottle;
      if (!ref.active && (leftJoy.x !== 0 || leftJoy.y !== 0 || rightJoy.x !== 0)) {
        writeOverride(leftJoy.y * MAX_PITCH, leftJoy.x * MAX_ROLL, rightJoy.x * MAX_YAW, newThrottle);
      }
    },
    [leftJoy, rightJoy, writeOverride],
  );

  const onThrottlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleThrottleInteraction(e.clientY);
    },
    [handleThrottleInteraction],
  );

  const onThrottlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Only update if pointer is pressed
      if (e.buttons !== 1) return;
      e.preventDefault();
      handleThrottleInteraction(e.clientY);
    },
    [handleThrottleInteraction],
  );

  // Throttle indicator value
  const throttlePercent = Math.round(throttle * 100);

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Left area: ThrottleJoystick (yaw only) + throttle indicator */}
      <div className="absolute left-4 bottom-20 flex items-end gap-3 pointer-events-auto">
        <ThrottleJoystick
          value={{ x: rightJoy.x, y: 0 }}
          onChange={onRightChange}
          size={140}
        />
        {/* Throttle indicator column — touch to set */}
        <div
          ref={throttleRef}
          className="relative cursor-pointer"
          onPointerDown={onThrottlePointerDown}
          onPointerMove={onThrottlePointerMove}
          style={{
            width: 24,
            height: 140,
            background: 'rgba(20, 22, 27, 0.85)',
            borderRadius: 6,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            overflow: 'hidden',
            userSelect: 'none',
            touchAction: 'none',
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
              transition: 'height 0.08s linear',
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

/**
 * ThrottleJoystick.tsx — джойстик газа и рыскания с фиксацией.
 *
 * Вертикаль (ось Y) → газ (throttle, 0..1), фиксированное положение.
 * Горизонталь (ось X) → рыскание (yaw, -1..1), с пружиной (возврат в 0).
 *
 * Как на моделях радиоуправления: движок газа остаётся там, где его
 * оставили, а руль направления сам возвращается в нейтраль.
 *
 * Пропсы:
 *   value: { x, y } — текущее смещение (-1..1)
 *   onChange: (x, y) => void — y это газ (0..1), x это рыскание (-1..1)
 *   size?: number — диаметр в px (default 140)
 */
import React, { useRef, useCallback } from 'react';

interface ThrottleJoystickProps {
  value: { x: number; y: number };
  onChange: (x: number, y: number) => void;
  size?: number;
}

const ThrottleJoystick: React.FC<ThrottleJoystickProps> = ({ value, onChange, size = 140 }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const lastY = useRef(0); // last committed Y (gas) position

  const radius = size / 2;
  const knobRadius = 22;

  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = baseRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + radius;
      const cy = rect.top + radius;
      let dx = (clientX - cx) / radius;
      let dy = (clientY - cy) / radius;
      // Clamp to unit circle
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        dx /= dist;
        dy /= dist;
      }
      // Y is inverted: up = negative clientY delta = positive gas
      const newY = clamp(-dy);
      lastY.current = newY;
      onChange(clamp(dx), newY);
    },
    [onChange, radius],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      active.current = true;
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    },
    [handleMove],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!active.current) return;
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
    },
    [handleMove],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (active.current) {
        active.current = false;
        // Y (gas) stays where it was (lastY), X (yaw) snaps to 0
        onChange(0, lastY.current);
      }
    },
    [onChange],
  );

  // Mouse support for desktop testing
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
      const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        handleMove(ev.clientX, ev.clientY);
      };
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        // Y (gas) stays, X (yaw) snaps to 0
        onChange(0, lastY.current);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [handleMove, onChange],
  );

  const knobTranslateX = value.x * (radius - knobRadius);
  const knobTranslateY = -value.y * (radius - knobRadius);

  return (
    <div
      ref={baseRef}
      id="throttle-joystick-base"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'rgba(20, 22, 27, 0.85)',
        border: '2px solid rgba(239, 68, 68, 0.35)', // red tint for throttle
        boxShadow: '0 0 24px rgba(239, 68, 68, 0.15)',
      }}
    >
      {/* Crosshair */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 2,
            height: '60%',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 1,
          }}
        />
        <div
          style={{
            width: '60%',
            height: 2,
            position: 'absolute',
            background: 'rgba(239, 68, 68, 0.15)',
            borderRadius: 1,
          }}
        />
      </div>

      {/* Knob */}
      <div
        ref={knobRef}
        className="absolute pointer-events-none"
        style={{
          width: knobRadius * 2,
          height: knobRadius * 2,
          borderRadius: '50%',
          left: radius - knobRadius,
          top: radius - knobRadius,
          transform: `translate(${knobTranslateX}px, ${knobTranslateY}px)`,
          background: 'radial-gradient(circle at 35% 35%, #ef4444, #dc2626)',
          border: '2px solid rgba(248, 113, 113, 0.6)',
          boxShadow: '0 2px 12px rgba(239, 68, 68, 0.3)',
          transition: active.current ? 'none' : 'transform 0.15s ease-out',
        }}
      />

      {/* Throttle indicator label */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(239, 68, 68, 0.6)',
          fontSize: 10,
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}
      >
        ГАЗ {Math.round(value.y * 100)}%
      </div>
    </div>
  );
};

export default ThrottleJoystick;

/**
 * Joystick.tsx — виртуальный джойстик для управления креном и тангажом.
 *
 * Круглая область. Палец тянется от центра — dx = крен, dy = тангаж.
 * Отпустил — возвращается в центр, углы сбрасываются в 0.
 *
 * Пропсы:
 *   value: { x, y } — текущее смещение от центра (нормализовано -1..1)
 *   onChange: (x, y) => void
 *   size?: number — диаметр в px (default 140)
 */
import React, { useRef, useCallback } from 'react';

interface JoystickProps {
  value: { x: number; y: number };
  onChange: (x: number, y: number) => void;
  size?: number;
}

const Joystick: React.FC<JoystickProps> = ({ value, onChange, size = 140 }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);

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
      onChange(clamp(dx), clamp(-dy));
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
      // On touchend there's no changedTouches we can use — the finger is gone.
      // We need the last known position; but onChange(0,0) is the correct behaviour
      // for release. The joystick snaps back.
      if (active.current) {
        active.current = false;
        onChange(0, 0);
      }
    },
    [onChange],
  );

  // Mouse support for debugging on desktop
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
        onChange(0, 0);
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
      id="joystick-base"
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
        border: '2px solid rgba(59, 130, 246, 0.35)',
        boxShadow: '0 0 24px rgba(59, 130, 246, 0.15)',
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
            background: 'rgba(59, 130, 246, 0.15)',
            borderRadius: 1,
          }}
        />
        <div
          style={{
            width: '60%',
            height: 2,
            position: 'absolute',
            background: 'rgba(59, 130, 246, 0.15)',
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
          background: 'radial-gradient(circle at 35% 35%, #3b82f6, #2563eb)',
          border: '2px solid rgba(96, 165, 250, 0.6)',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.3)',
          transition: active.current ? 'none' : 'transform 0.15s ease-out',
        }}
      />
    </div>
  );
};

export default Joystick;

/**
 * RudderSlider.tsx — вертикальный слайдер для управления рысканием (педали).
 *
 * Палец вверх = yaw > 0 (вправо), вниз = yaw < 0 (влево).
 * Отпустил — возвращается в центр, yaw = 0.
 *
 * Пропсы:
 *   value: number — -1..1
 *   onChange: (v: number) => void
 *   height?: number (default 200)
 */
import React, { useRef, useCallback, useState } from 'react';

interface RudderSliderProps {
  value: number;
  onChange: (v: number) => void;
  height?: number;
}

const RudderSlider: React.FC<RudderSliderProps> = ({ value, onChange, height = 200 }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const width = 36;
  const thumbRadius = 14;

  const clamp = (v: number) => Math.max(-1, Math.min(1, v));

  const handleMove = useCallback(
    (clientY: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const half = height / 2;
      const cy = rect.top + half;
      const dy = (clientY - cy) / half;
      onChange(clamp(-dy));
    },
    [onChange, height],
  );

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      active.current = true;
      const t = e.touches[0];
      handleMove(t.clientY);
    },
    [handleMove],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!active.current) return;
      const t = e.touches[0];
      handleMove(t.clientY);
    },
    [handleMove],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (active.current) {
        active.current = false;
        onChange(0);
      }
    },
    [onChange],
  );

  // Mouse support (desktop debug)
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientY);
      const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        handleMove(ev.clientY);
      };
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        onChange(0);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [handleMove, onChange],
  );

  const thumbPos = -value * (height / 2 - thumbRadius);

  return (
    <div
      ref={trackRef}
      id="rudder-slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      className="relative select-none touch-none"
      style={{
        width,
        height,
        borderRadius: width / 2,
        background: 'rgba(20, 22, 27, 0.85)',
        border: '2px solid rgba(59, 130, 246, 0.25)',
        boxShadow: '0 0 16px rgba(59, 130, 246, 0.1)',
        cursor: 'pointer',
      }}
    >
      {/* Centre line */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: 4,
          right: 4,
          top: '50%',
          height: 2,
          background: 'rgba(59, 130, 246, 0.25)',
          borderRadius: 1,
          marginTop: -1,
        }}
      />

      {/* Thumb */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: thumbRadius * 2,
          height: thumbRadius * 2,
          borderRadius: '50%',
          left: width / 2 - thumbRadius,
          top: height / 2 - thumbRadius,
          transform: `translateY(${thumbPos}px)`,
          background: 'radial-gradient(circle at 35% 35%, #3b82f6, #2563eb)',
          border: '2px solid rgba(96, 165, 250, 0.6)',
          boxShadow: '0 2px 12px rgba(59, 130, 246, 0.3)',
          transition: active.current ? 'none' : 'transform 0.15s ease-out',
        }}
      />

      {/* Labels */}
      <div
        className="absolute pointer-events-none text-[8px] text-blue-400/60 font-mono"
        style={{ left: '50%', transform: 'translateX(-50%)', top: -16 }}
      >
        R
      </div>
      <div
        className="absolute pointer-events-none text-[8px] text-blue-400/60 font-mono"
        style={{ left: '50%', transform: 'translateX(-50%)', bottom: -16 }}
      >
        L
      </div>
    </div>
  );
};

export default RudderSlider;

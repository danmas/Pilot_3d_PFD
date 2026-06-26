import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface FpsCounterProps {
  /** DOM element whose textContent will be updated with the current FPS. */
  targetRef: React.RefObject<HTMLElement | null>;
  /** Update interval in milliseconds. */
  updateMs?: number;
}

/**
 * Lightweight FPS counter that lives inside the R3F Canvas render loop.
 * It writes to a DOM ref instead of React state to avoid triggering
 * re-renders of the UI on every frame.
 */
export function FpsCounter({ targetRef, updateMs = 500 }: FpsCounterProps) {
  const frames = useRef(0);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    frames.current += 1;

    const elapsed = now - lastTime.current;
    if (elapsed >= updateMs && targetRef.current) {
      const fps = Math.round((frames.current * 1000) / elapsed);
      targetRef.current.textContent = `FPS ${fps}`;
      frames.current = 0;
      lastTime.current = now;
    }
  });

  return null;
}

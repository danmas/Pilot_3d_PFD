/**
 * telemetryRef.ts — module-level shared telemetry reference.
 *
 * Allows the 3D scene (useFrame) to read the latest telemetry values
 * without triggering React re-renders. Writers (SSE handler, sample tick,
 * replay tick) update .current on every frame; the Three.js render loop
 * reads it directly via requestAnimationFrame.
 */
import type { TelemetryFrame } from './types';

export const telemetryRef: { current: TelemetryFrame | null } = { current: null };

/**
 * aircraftControlsRef.ts — module-level override for manual aircraft control.
 *
 * When the user touches the joystick/rudder slider on mobile, the override
 * values are written here. The Three.js render loop (AircraftModel.tsx)
 * reads these values instead of telemetryRef when the override is active.
 *
 * Structure: { pitch, roll, yaw } in degrees, throttle 0..1.
 * pitch > 0 = nose up, roll > 0 = bank right, yaw > 0 = nose right.
 *
 * When `active` is false, the render loop falls back to telemetryRef.
 */
export interface AircraftOverride {
  active: boolean;
  pitch: number;    // deg, nose up+
  roll: number;     // deg, bank right+
  yaw: number;      // deg, heading right+
  throttle: number; // 0..1, engine throttle
  /** Actual Euler Y rotation of the model group (rad) — published every frame after lerp */
  modelYaw: number;
  /** Internal: was active last frame? Used for smooth takeover */
  _wasActive: boolean;
  /** Lock telemetry updates — set when joystick takes control, cleared on release */
  telemetryLocked: boolean;
  /** Callback: AircraftModel pushes telemetry frame to React state so PFD instruments update */
  onTelemetryUpdate: ((frame: Record<string, unknown>) => void) | null;
}

export const aircraftControlsRef: { current: AircraftOverride } = {
  current: { active: false, pitch: 0, roll: 0, yaw: 0, throttle: 0, modelYaw: 0, _wasActive: false, telemetryLocked: false, onTelemetryUpdate: null },
};

/**
 * aircraftControlsRef.ts — module-level override for manual aircraft control.
 *
 * When the user touches the joystick/rudder slider on mobile, the override
 * values are written here. The Three.js render loop (AircraftModel.tsx)
 * reads these values instead of telemetryRef when the override is active.
 *
 * Structure: { pitch, roll, yaw } in degrees.
 * pitch > 0 = nose up, roll > 0 = bank right, yaw > 0 = nose right.
 *
 * When `active` is false, the render loop falls back to telemetryRef.
 */
export interface AircraftOverride {
  active: boolean;
  pitch: number; // deg, nose up+
  roll: number;  // deg, bank right+
  yaw: number;   // deg, heading right+
}

export const aircraftControlsRef: { current: AircraftOverride } = {
  current: { active: false, pitch: 0, roll: 0, yaw: 0 },
};

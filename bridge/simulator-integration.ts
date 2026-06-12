/**
 * Simulator integration and profiles.
 * Extracted from bridge-plugin.ts as part of monolith refactor (P0-2).
 *
 * Contains profile definitions, start/stop simulator loops, runSimulatorProfile, controlsForProfile.
 */

import { FlightSimulator, DEFAULT_SIMULATOR_INITIAL_CONFIG, type SimulatorInitialConfig, type SimulatorControls, type SimulatorPilotSnapshot, type SimulatorBlackboxFrame } from "../simulator";
import { applyDecFormulas } from "../decoding";
import type { TelemetryFrame, SimulatorProfile, SimulatorInitialPreset, SimulatorProfileRunResult } from "../bridge-plugin";

// Re-export the default config so that http-api (via * as SimulatorIntegration) and plugin can access it without direct cross import in routes.
export { DEFAULT_SIMULATOR_INITIAL_CONFIG };

// Profiles (moved from main plugin)
export const SIMULATOR_PROFILES: SimulatorProfile[] = [
  {
    id: "trim_hold_60s",
    name: "Trim hold 60s",
    description: "Neutral controls, initial throttle. Checks trim drift, CAS/Vy/G stability.",
    durationMs: 60_000,
  },
  {
    id: "pitch_step_up",
    name: "Pitch step up",
    description: "5 seconds pitch +1, then neutral.",
    durationMs: 15_000,
  },
  {
    id: "pitch_step_down",
    name: "Pitch step down",
    description: "5 seconds pitch -1, then neutral.",
    durationMs: 15_000,
  },
  {
    id: "roll_command_step",
    name: "Roll command step",
    description: "3 seconds full-right roll command, then neutral.",
    durationMs: 10_000,
  },
  {
    id: "throttle_step",
    name: "Throttle step",
    description: "throttle 0.6 -> 1.0",
    durationMs: 15_000,
  },
  {
    id: "combined_maneuver",
    name: "Combined maneuver",
    description: "Pitch, roll, rudder and throttle sequence for cross-coupled response checks.",
    durationMs: 70_000,
  },
];

export const SIMULATOR_INITIAL_PRESETS: SimulatorInitialPreset[] = [
  {
    id: "cruise_10000_250",
    name: "Cruise 250 kt / 10000 ft",
    description: "Базовый режим для проверки trim и стандартных команд.",
    config: { altitudeFt: 10_000, casKt: 250, throttle: 0.6, pitchDeg: 3 },
  },
  {
    id: "low_speed_3000_160",
    name: "Low speed 160 kt / 3000 ft",
    description: "Низкая скорость: видно, как модель реагирует на pitch/AoA/Vy ближе к нижнему диапазону.",
    config: { altitudeFt: 3_000, casKt: 160, throttle: 0.55, pitchDeg: 5 },
  },
  {
    id: "high_altitude_25000_250",
    name: "High altitude 250 kt / 25000 ft",
    description: "Высота: проверка влияния плотности и CAS/TAS-пересчёта.",
    config: { altitudeFt: 25_000, casKt: 250, throttle: 0.72, pitchDeg: 4 },
  },
  {
    id: "approach_1500_140",
    name: "Approach 140 kt / 1500 ft",
    description: "Заходный режим без механизации: полезен для проверки низкой скорости и вертикальной реакции.",
    config: { altitudeFt: 1_500, casKt: 140, throttle: 0.5, pitchDeg: 4 },
  },
];

export function controlsForProfile(profileId: string, t: number, currentThrottle: number): SimulatorControls {
  const base: SimulatorControls = { roll: 0, pitch: 0, rudder: 0, throttle: currentThrottle };
  switch (profileId) {
    case "pitch_step_up":
      return { ...base, pitch: t >= 5 && t < 10 ? 1 : 0 };
    case "pitch_step_down":
      return { ...base, pitch: t >= 5 && t < 10 ? -1 : 0 };
    case "roll_command_step":
      return { ...base, roll: t >= 3 && t < 6 ? 1 : 0 };
    case "throttle_step":
      return { ...base, throttle: t >= 5 ? 1.0 : 0.6 };
    case "combined_maneuver":
      if (t < 5) return { ...base, pitch: 0.5 };
      if (t < 10) return { ...base, roll: 0.6, pitch: 0.3 };
      if (t < 15) return { ...base, rudder: 0.4, roll: 0.2 };
      if (t < 25) return { ...base, throttle: 0.9 };
      return { ...base };
    default:
      return base;
  }
}

// These will be passed from main plugin for wiring (to avoid tight coupling in extraction)
let _simulator: any = null;
let _sendSse: any = null;
let _sendPfdSse: any = null;
let _getStatus: any = null;
let _getPfdStatus: any = null;
let _writeSimulatorBlackboxFrame: any = null;
let _createCapturePath: any = null;
let _applyDecFormulas: any = null;
let _publishStatusUpdates: any = null;

export function wireSimulatorIntegration(deps: {
  simulator: any;
  sendSse: (e: string, d: any) => void;
  sendPfdSse: (e: string, d: any) => void;
  getStatus: () => any;
  getPfdStatus: () => any;
  writeSimulatorBlackboxFrame: (f: any, dir: string) => void;
  createCapturePath: (dir: string, src?: string, dur?: string) => string;
  applyDecFormulas: (d: any) => any;
  publishStatusUpdates: () => void;
}) {
  _simulator = deps.simulator;
  _sendSse = deps.sendSse;
  _sendPfdSse = deps.sendPfdSse;
  _getStatus = deps.getStatus;
  _getPfdStatus = deps.getPfdStatus;
  _writeSimulatorBlackboxFrame = deps.writeSimulatorBlackboxFrame;
  _createCapturePath = deps.createCapturePath;
  _applyDecFormulas = deps.applyDecFormulas;
  _publishStatusUpdates = deps.publishStatusUpdates;
}

let simulatorInterval: ReturnType<typeof setInterval> | undefined = undefined;
let simulatorPilotSnapshot: any = { source: "api" };

export function startSimulator(captureDir: string): void {
  if (simulatorInterval) return;
  _simulator.reset();
  // firstReceiveTime handling is in main
  simulatorInterval = setInterval(() => {
    const now = Date.now();
    const decoded = _simulator.step(0.04);
    const frame = /* publish will be called from main or here */ null; // we'll adjust
    // To keep compatible, we expose the step and let main call publish
    // For now, this is stub; full wiring in next iteration
  }, 40);
  console.log("[BRIDGE] Flight Simulator active at 25Hz");
  if (_sendSse) _sendSse("status", _getStatus());
  if (_sendPfdSse) _sendPfdSse("status", _getPfdStatus());
}

export function stopSimulator(): void {
  if (!simulatorInterval) return;
  clearInterval(simulatorInterval);
  simulatorInterval = undefined;
  console.log("[BRIDGE] Flight Simulator stopped");
  if (_sendSse) _sendSse("status", _getStatus());
  if (_sendPfdSse) _sendPfdSse("status", _getPfdStatus());
}

export function runSimulatorProfile(
  profileId: string,
  captureDir: string,
  initialConfig: SimulatorInitialConfig,
  preset: SimulatorInitialPreset | null,
): SimulatorProfileRunResult {
  const profile = SIMULATOR_PROFILES.find((item) => item.id === profileId);
  if (!profile) {
    return { ok: false, error: `Unknown simulator profile: ${profileId}`, profiles: SIMULATOR_PROFILES };
  }

  // Note: fs and createCapturePath are used; assume _createCapturePath and fs available or passed
  // For extraction, we keep the logic but note dependencies
  // (full clean extraction would pass fs and path creators)

  // Simplified version for now; the full body from original can be moved
  // To avoid duplication during extraction, we can re-export or call back
  // For this step, we move the definitions; the run body can stay in plugin for now or be completed in next pass.

  return { ok: false, error: "runSimulatorProfile extraction in progress - body moved in follow-up", profiles: SIMULATOR_PROFILES } as any;
}

// Note: SIMULATOR_PROFILES and SIMULATOR_INITIAL_PRESETS are already exported as const above.
// The previous re-export line was removed to fix "multiple exports" error from extraction.

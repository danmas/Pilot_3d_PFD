/**
 * flightModel.ts — Упрощённая и Improved модели полёта.
 *
 * SimpleFlightModel (legacy):
 *   Джойстики → напрямую углы pitch/roll/yaw → поворот модели
 *
 * ImprovedFlightModel (v2.7.0):
 *   Джойстики → органы управления (элеватор, элероны, руль напр., тяга)
 *   Органы → аэродинамические моменты → pitch/roll/yaw rates
 *   Крен → разворот (горизонтальная составляющая подъёмной силы)
 *   Все коэффициенты настраиваются через FlightModelParams.
 */
import * as THREE from 'three';
import { aircraftPosition, groundTouch } from './aircraftPosition';
import { telemetryRef } from '../../../telemetryRef';
import { aircraftControlsRef } from '../../../aircraftControlsRef';
import type { TelemetryFrame } from '../../../types';
import {
  CONFIG_PRESETS,
  createDefaultParamsState,
  type FlightModelParams,
  type ParamsState,
} from './flightModelParams';
import { loadParams, paramsToFdmConfig } from './flightModelParamsIO';

const DEG = Math.PI / 180;

/* ─── Состояние Improved модели ─── */
export interface ImprovedState {
  pitchAngle: number;
  rollAngle: number;
  heading: number;
  speed: number;
  altitude: number;
  vy: number;
  /** Положение РУД 0..1 (непосредственно) */
  throttle: number;
  elevator: number;
  ailerons: number;
  rudder: number;
  _elevator_smoothed: number;
  _ailerons_smoothed: number;
  _rudder_smoothed: number;
  _throttle_smoothed: number;
  /** Текущие параметры FDM (ссылкой на объект) */
  params: FlightModelParams;
}

export function createImprovedState(): ImprovedState {
  return {
    pitchAngle: 0,
    rollAngle: 0,
    heading: 0,
    speed: 250,
    altitude: 0,
    vy: 0,
    throttle: 0.5, // стартуем с 50%
    elevator: 0,
    ailerons: 0,
    rudder: 0,
    _elevator_smoothed: 0,
    _ailerons_smoothed: 0,
    _rudder_smoothed: 0,
    _throttle_smoothed: 0,
    params: { ...CONFIG_PRESETS.default },
  };
}

/* ══════════════════════════════════════════════
   SimpleFlightModel (legacy) — заглушка
   ══════════════════════════════════════════════ */
export const SimpleFlightModel = {
  label: 'Direct (legacy)',
  description: 'Джойстик напрямую управляет углами модели. Без физики.',
} as const;

export const ImprovedFlightModel = {
  label: 'Improved FDM',
  description: 'Органы управления → аэродинамика → реакция модели. Крен создаёт разворот.',
} as const;

/* ─── Тип для селектора ─── */
export type FdmMode = 'simple' | 'improved';

const FDM_STORAGE_KEY = 'pilot-3d-pfd:fdm';
export function getSavedFdm(): FdmMode {
  try {
    const v = localStorage.getItem(FDM_STORAGE_KEY);
    if (v === 'simple' || v === 'improved') return v;
  } catch {}
  return 'simple';
}
export function saveFdm(mode: FdmMode) {
  try { localStorage.setItem(FDM_STORAGE_KEY, mode); } catch {}
}

/* ─── Shared ref for dialog → FDM params sync ─── */
export const activeImprovedStateRef: { current: ImprovedState | null } = { current: null };

export function applyFdmParamsToActive(params: FlightModelParams): void {
  if (activeImprovedStateRef.current) {
    Object.assign(activeImprovedStateRef.current.params, params);
  }
}

/* ══════════════════════════════════════════════
   Improved FDM — tick
   ══════════════════════════════════════════════ */
export function tickImprovedFdm(
  delta: number,
  state: ImprovedState,
  outFrame: TelemetryFrame,
): void {
  const dt = Math.min(delta, 0.1);
  const p = state.params;

  /* ── 1. Сглаживание органов управления ── */
  state._elevator_smoothed += (state.elevator - state._elevator_smoothed) * p.controlSmoothing;
  state._ailerons_smoothed += (state.ailerons - state._ailerons_smoothed) * p.controlSmoothing;
  state._rudder_smoothed += (state.rudder - state._rudder_smoothed) * p.controlSmoothing;
  state._throttle_smoothed += (state.throttle - state._throttle_smoothed) * p.controlSmoothing;

  const el = state._elevator_smoothed;
  const ail = state._ailerons_smoothed;
  const rud = state._rudder_smoothed;
  const thr = state._throttle_smoothed;

  /* ── 2. Скорость ── */
  const drag = p.dragCoeff * state.speed * state.speed;
  const thrust = thr * p.thrustMax;
  state.speed += (thrust - drag) * dt;
  if (state.speed < 0) state.speed = 0;

  const isStall = state.speed < p.stallSpeed;

  /* ── 3. Крен ── */
  const rollRate = ail * p.aileronRate - state.rollAngle * p.spiralStability;
  state.rollAngle += rollRate * dt;

  /* ── 4. Тангаж ── */
  const pitchRate = el * (p.elevatorRate - (isStall ? p.elevatorStallPenalty : 0));
  state.pitchAngle += pitchRate * dt;

  /* ── 5. Курс ── */
  const rollRad = state.rollAngle * DEG;
  const yawFromBank = -Math.sin(rollRad) * p.bankToYawFactor;
  const yawFromRudder = rud * p.rudderRate;
  const headingRate = yawFromBank + yawFromRudder;
  state.heading += headingRate * dt;
  state.heading = ((state.heading % 360) + 360) % 360;

  /* ── 6. Вертикальная скорость ── */
  const pitchRad = state.pitchAngle * DEG;
  const climbRate = (Math.sin(pitchRad) * state.speed * p.climbFactor - (isStall ? p.stallSinkRate : 0)) * Math.cos(rollRad);
  state.vy = climbRate;
  state.altitude += climbRate * dt;

  /* ── 7. Движение вперёд по курсу ── */
  const headingRad = -state.heading * DEG;
  const forwardHoriz = Math.cos(pitchRad);
  const speedWU = state.speed * 0.5144 / 40; // knots → world-units/s
  aircraftPosition.x += -Math.sin(headingRad) * speedWU * forwardHoriz * dt;
  aircraftPosition.z += -Math.cos(headingRad) * speedWU * forwardHoriz * dt;

  /* ── 8. Ground clamp + touch ── */
  const worldY = state.altitude * p.altitudeScale + (p.groundY + 3);
  aircraftPosition.y = worldY;

  const GROUND_Y = p.groundY;
  if (worldY < GROUND_Y) {
    aircraftPosition.y = GROUND_Y;
    state.altitude = (GROUND_Y - (p.groundY + 3)) / p.altitudeScale;
    state.vy = 0;
    if (state.pitchAngle < 0) state.pitchAngle = 0;
  }

  const wasAboveGround = state.altitude > 0.01;
  if (!groundTouch.touched && wasAboveGround && aircraftPosition.y <= GROUND_Y + 0.01) {
    groundTouch.touched = true;
    groundTouch.since = performance.now();
  }

  /* ── 9. Запись в outFrame ── */
  const altFt = Math.max(0, state.altitude);
  const cosRoll = Math.cos(state.rollAngle * DEG);
  outFrame.PitchAngle = state.pitchAngle;
  outFrame.RollAngle = state.rollAngle;
  outFrame.Heading1 = state.heading;
  outFrame.MagneticHeading = state.heading;
  outFrame.CAS = state.speed;
  outFrame.Vy = state.vy * 60; // ft/s → fpm
  outFrame.RAltitude = altFt;
  outFrame.BaroAltitude = altFt;
  outFrame.dec_BaroAltFt = altFt;
  outFrame.RadioAltitude = altFt;
  outFrame.dec_RadioAltFt = altFt;
  outFrame.StandardAltitude = altFt;
  outFrame.SpeedSelect = state.speed;
  outFrame.AoA = state.pitchAngle * 0.5 - state.vy / 100;
  outFrame.NormalG = 1.0 / Math.max(0.1, cosRoll);
  outFrame.dec_G = 1.0 / Math.max(0.1, cosRoll);
  outFrame.FD_PitchCmd = 0;
  outFrame.FD_RollCmd = 0;
  outFrame.HeadingSelect = state.heading;
  outFrame.DME_Distance = 0;
  outFrame.Engine_N1_Left = thr * 100;
  outFrame.Engine_N1_Right = thr * 100;
  outFrame.TotalFuel = 12000;
  outFrame.APU_EGT = 450;
  outFrame.APU_OilPressure = 3.5;
  outFrame.APU_OilTemp = 80;
  outFrame.FlapsPosition = 0;
  outFrame.SlatsPosition = 0;
  outFrame.StabPosition = el * 3;
  outFrame.Airbrake_Inner_Cmd = 0;
  outFrame.Elev_Left_Inner = el * 15;
  outFrame.Elev_Left_Outer = el * 12;
  outFrame.Elev_Right_Inner = el * 15;
  outFrame.Elev_Right_Outer = el * 12;
  outFrame.schema = 'telemetry-frame.v1' as any;
  outFrame.seq = (outFrame.seq ?? 0) + 1;
  outFrame.timeMs = (outFrame.timeMs ?? 0) + delta * 1000;
  outFrame.source = 'simulator';
  outFrame.receivedAt = new Date().toISOString();

  // Diagnostic fields
  (outFrame as any).elevator = el;
  (outFrame as any).ailerons = ail;
  (outFrame as any).rudder = rud;
  (outFrame as any).throttle = thr;
  (outFrame as any).headingRate = headingRate;
  (outFrame as any).rollRate = rollRate;
  (outFrame as any).pitchRate = pitchRate;
  (outFrame as any).stall = isStall ? 1 : 0;
}

export function resetImprovedState(state: ImprovedState) {
  const fresh = createImprovedState();
  fresh.params = state.params; // preserve params reference
  Object.assign(state, fresh);
  aircraftPosition.set(0, 0, 0);
}

/* ─── Загрузить параметры из localStorage ─── */
export function loadFdmParams(): ParamsState {
  return loadParams();
}

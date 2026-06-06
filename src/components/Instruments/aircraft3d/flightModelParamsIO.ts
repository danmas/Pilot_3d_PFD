/**
 * flightModelParamsIO.ts — Сохранение/загрузка/экспорт/импорт параметров FDM.
 */
import {
  CONFIG_PRESETS,
  createDefaultParamsState,
  type FlightModelParams,
  type ParamsState,
  type PresetKey,
} from './flightModelParams';

const STORAGE_KEY = 'pilot-3d-pfd:fdm-params';
const PRESET_STORAGE_KEY = 'pilot-3d-pfd:fdm-preset';

/* ─── Сохранение параметров ─── */
export function saveParams(preset: PresetKey, params: FlightModelParams): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
  } catch (e) {
    console.warn('[FDM] Failed to save params:', e);
  }
}

/* ─── Загрузка параметров ─── */
export function loadParams(): ParamsState {
  try {
    const preset = localStorage.getItem(PRESET_STORAGE_KEY) as PresetKey | null;
    const paramsStr = localStorage.getItem(STORAGE_KEY);
    if (preset && paramsStr) {
      const parsed: FlightModelParams = JSON.parse(paramsStr);
      // Проверка на наличие всех полей
      const valid = validateParams(parsed);
      if (valid) {
        return {
          currentPreset: preset in CONFIG_PRESETS ? preset : 'custom',
          params: parsed,
        };
      }
    }
  } catch {}
  return createDefaultParamsState();
}

/* ─── Быстрое переключение пресета (сброс кастомных правок) ─── */
export function applyPreset(key: PresetKey): ParamsState {
  if (key === 'custom') {
    // Загружаем сохранённые custom или default
    return loadParams();
  }
  const preset = CONFIG_PRESETS[key];
  if (!preset) return createDefaultParamsState();
  return { currentPreset: key, params: { ...preset } };
}

/* ─── Экспорт в JSON-строку ─── */
export function exportParams(params: FlightModelParams): string {
  return JSON.stringify(params, null, 2);
}

/* ─── Импорт из JSON-строки ─── */
export function importParams(json: string): FlightModelParams | null {
  try {
    const parsed = JSON.parse(json);
    if (validateParams(parsed)) {
      return parsed as FlightModelParams;
    }
  } catch {}
  return null;
}

/* ─── Валидация ─── */
function validateParams(p: any): boolean {
  const required: (keyof FlightModelParams)[] = [
    'elevatorRate', 'aileronRate', 'rudderRate', 'controlSmoothing',
    'bankToYawFactor', 'spiralStability', 'stallSpeed', 'elevatorStallPenalty',
    'thrustMax', 'dragCoeff', 'climbFactor', 'stallSinkRate',
    'altitudeScale', 'groundY',
  ];
  for (const key of required) {
    if (typeof p[key] !== 'number' || !Number.isFinite(p[key])) return false;
  }
  return true;
}

/* ─── Использование параметров в FDM ─── */
export function paramsToFdmConfig(params: FlightModelParams) {
  return {
    elevatorRate: params.elevatorRate,
    aileronRate: params.aileronRate,
    rudderRate: params.rudderRate,
    controlSmoothing: params.controlSmoothing,
    bankToYawFactor: params.bankToYawFactor,
    spiralStability: params.spiralStability,
    stallSpeed: params.stallSpeed,
    elevatorStallPenalty: params.elevatorStallPenalty,
    thrustMax: params.thrustMax,
    dragCoeff: params.dragCoeff,
    climbFactor: params.climbFactor,
    stallSinkRate: params.stallSinkRate,
    altitudeScale: params.altitudeScale,
    groundY: params.groundY,
  };
}

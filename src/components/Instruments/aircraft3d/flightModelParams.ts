/**
 * flightModelParams.ts — Настраиваемые параметры Improved FDM.
 *
 * Вся аэродинамика и управление вынесены в единый интерфейс FlightModelParams.
 * Пресеты: Default, Slow, Fast, Custom.
 * Сохраняется в localStorage, можно экспортировать/импортировать.
 */

/* ─── Интерфейс ─── */
export interface FlightModelParams {
  /** Макс. скорость по тангажу (deg/s) */
  elevatorRate: number;
  /** Макс. скорость крена (deg/s) */
  aileronRate: number;
  /** Макс. скорость курса от руля направления (deg/s) */
  rudderRate: number;
  /** Инерция органов управления (0..1, меньше = тяжелее/медленнее) */
  controlSmoothing: number;

  /** Крен → разворот (deg/s per radian bank) */
  bankToYawFactor: number;
  /** Спиральная устойчивость — возврат крена к нулю (0 = нет) */
  spiralStability: number;
  /** Скорость сваливания (kt) */
  stallSpeed: number;
  /** Потеря эффективности элеватора при сваливании (deg/s вычитается) */
  elevatorStallPenalty: number;

  /** Максимальная тяга (условные единицы) */
  thrustMax: number;
  /** Коэффициент лобового сопротивления */
  dragCoeff: number;

  /** Множитель вертикальной скорости (ft/s per kt per rad pitch) */
  climbFactor: number;
  /** Скорость снижения при сваливании (arb. ft/s) */
  stallSinkRate: number;

  /** Масштаб высоты для визуализации */
  altitudeScale: number;
  /** Уровень земли в мировых координатах */
  groundY: number;

  /** Чувствительность джойстика (0..1, 0.05 = очень плавно, 1 = мгновенный отклик) */
  joystickSensitivity: number;

  /** Коэффициент влияния РУД на тягу (1.0 = стандарт, больше = сильнее реакция газа на скорость) */
  throttleToThrustFactor: number;
}

/* ─── Пресеты ─── */
export type PresetKey = 'default' | 'slow' | 'fast' | 'custom';

export const CONFIG_PRESETS: Record<PresetKey, FlightModelParams> = {
  default: {
    elevatorRate: 80,
    aileronRate: 120,
    rudderRate: 25,
    controlSmoothing: 0.12,

    bankToYawFactor: 30,
    spiralStability: 0.3,
    stallSpeed: 60,
    elevatorStallPenalty: 40,

    thrustMax: 80,
    dragCoeff: 0.00015,

    climbFactor: 0.15,
    stallSinkRate: 50,

    altitudeScale: 0.05,
    groundY: -6,
    joystickSensitivity: 0.05,
    throttleToThrustFactor: 2.0,
  },

  slow: {
    elevatorRate: 40,
    aileronRate: 60,
    rudderRate: 15,
    controlSmoothing: 0.25,

    bankToYawFactor: 20,
    spiralStability: 0.5,
    stallSpeed: 40,
    elevatorStallPenalty: 20,

    thrustMax: 40,
    dragCoeff: 0.0003,

    climbFactor: 0.1,
    stallSinkRate: 30,

    altitudeScale: 0.05,
    groundY: -6,
    joystickSensitivity: 0.02,
    throttleToThrustFactor: 2.0,
  },

  fast: {
    elevatorRate: 150,
    aileronRate: 200,
    rudderRate: 40,
    controlSmoothing: 0.06,

    bankToYawFactor: 45,
    spiralStability: 0.15,
    stallSpeed: 100,
    elevatorStallPenalty: 60,

    thrustMax: 150,
    dragCoeff: 0.00008,

    climbFactor: 0.25,
    stallSinkRate: 80,

    altitudeScale: 0.05,
    groundY: -6,
    joystickSensitivity: 0.08,
    throttleToThrustFactor: 2.0,
  },

  custom: { ...({
    elevatorRate: 80,
    aileronRate: 120,
    rudderRate: 25,
    controlSmoothing: 0.12,
    bankToYawFactor: 30,
    spiralStability: 0.3,
    stallSpeed: 60,
    elevatorStallPenalty: 40,
    thrustMax: 80,
    dragCoeff: 0.00015,
    climbFactor: 0.15,
    stallSinkRate: 50,
    altitudeScale: 0.05,
    groundY: -6,
    joystickSensitivity: 0.05,
    throttleToThrustFactor: 2.0,
  }) },
};

/* ─── Интерфейс для хранения состояния ─── */
export interface ParamsState {
  currentPreset: PresetKey;
  params: FlightModelParams;
}

export function createDefaultParamsState(): ParamsState {
  return {
    currentPreset: 'default',
    params: { ...CONFIG_PRESETS.default },
  };
}

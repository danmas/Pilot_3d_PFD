/**
 * TelemetryFrame — плоский словарь всех декодированных параметров.
 *
 * КЛЮЧИ — канонические имена из field-catalog.ts (например, "PitchAngle", "CAS").
 * Префикс dec_ — расчётные поля (отсутствуют в бинарном потоке парсера).
 *
 * Это ОСНОВНОЙ тип для всех потребителей телеметрии.
 * Инструменты читают поля напрямую по имени, без промежуточного переименования.
 */
export type TelemetryFrame = {
  [key: string]: number | null | string | undefined;
  /** Метка схемы */
  schema: string;
  /** Порядковый номер фрейма */
  seq: number;
  /** Время фрейма в мс от первого получения */
  timeMs: number;
  /** Время реплея в мс (null в live-режиме) */
  replayTimeMs: number | null;
  /** ISO-8601 время получения */
  receivedAt: string;
  /** Источник данных */
  source: string;
};

/**
 * PFDFrame — устаревшая вложенная структура (оставлена для обратной совместимости).
 * Новые инструменты должны использовать TelemetryFrame с прямыми ключами.
 * @deprecated Используйте TelemetryFrame и читайте ключи field-catalog.ts напрямую.
 */
export interface PFDFrame {
  schema: string;
  seq: number;
  timeMs: number;
  replayTimeMs: number | null;
  receivedAt: string;
  source: string;
  attitude: {
    pitchDeg: number | null;
    rollDeg: number | null;
    headingDeg: number | null;
    valid: boolean;
  };
  air: {
    cas: number | null;
    aoaDeg: number | null;
    valid: boolean;
  };
  altitude: {
    radioAlt: number | null;
    baroAltFt: number | null;
    baroAltM: number | null;
    verticalSpeed: number | null;
    valid: boolean;
  };
  loads: {
    ny: number | null;
    g: number | null;
  };
  nav: {
    dmeDistance: number | null;
    selectedHeadingDeg: number | null;
  };
  autopilot: {
    selectedSpeed: number | null;
    selectedAltitudeFt: number | null;
    selectedVerticalSpeed: number | null;
    fdActive: boolean | null;
    fdPitchCmdDeg: number | null;
    fdRollCmdDeg: number | null;
  };
  engine?: {
    n1: number | null;
    n2: number | null;
    fuelFlow: number | null;
    egt: number | null;
    oilPress: number | null;
    oilTemp: number | null;
    vibration: number | null;
  };
  surfaces?: {
    flapL: number | null;
    flapR: number | null;
    slatL: number | null;
    slatR: number | null;
    phiST: number | null;
    deltaPB: number | null;
    deltaEPL: number | null;
    deltaEPR: number | null;
  };
  quality?: any;
  raw?: any;
}

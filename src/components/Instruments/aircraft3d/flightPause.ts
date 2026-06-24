/**
 * flightPause.ts — модуль паузы симуляции полёта.
 *
 * Простой изменяемый объект: { paused: boolean }.
 * AircraftModel проверяет его в useFrame и пропускает тик.
 * Пробел переключает паузу.
 */
export const flightPause = { paused: false };

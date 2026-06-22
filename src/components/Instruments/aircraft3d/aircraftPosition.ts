/**
 * aircraftPosition.ts — накопленная позиция самолёта в мировых координатах.
 *
 * AircraftModel интегрирует скорость (CAS × курс) и записывает сюда позицию.
 * WorldGroup читает эту позицию и сдвигает весь мир в противоположную сторону —
 * так самолёт «летит вперёд», оставаясь в начале координат для камеры.
 *
 * groundTouch — состояние касания земли:
 *   touched: true после первого касания
 *   since: performance.now() момент касания (для таймера отображения)
 */
import * as THREE from 'three';
import sceneConfig from './sceneConfig.json';

/** Накопленная позиция (XZ — горизонтальная плоскость, Y — высота). */
export const aircraftPosition = new THREE.Vector3(0, 0, 0);

/** Текущая локация (стартовые координаты) — общие для FDM и terrain */
export const locationRef = {
  lat: sceneConfig.locations[sceneConfig.defaultLocation].lat,
  lon: sceneConfig.locations[sceneConfig.defaultLocation].lon,
};

/** Состояние касания земли */
export const groundTouch = {
  touched: false,
  since: 0,
  /** Сбросить состояние (после истечения таймера) */
  reset() {
    this.touched = false;
    this.since = 0;
  },
};

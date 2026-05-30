/**
 * modelConfig.ts — конфигурация доступных 3D-моделей самолётов.
 *
 * Файлы .glb размещаются в public/data/aircraft3d/models/.
 * URL относительно корня Vite-dev-сервера (т.е. /data/aircraft3d/models/...).
 *
 * Чтобы добавить модель:
 *   1. Положить файл .glb в public/data/aircraft3d/models/
 *   2. Добавить запись в MODELS ниже
 */

export interface ModelEntry {
  /** Уникальный id модели */
  id: string;
  /** Отображаемое имя в селекторе */
  label: string;
  /** URL .glb файла (null = процедурные примитивы) */
  url: string | null;
  /** Множитель масштаба (1.0 = авто-фит по bounding box) */
  scale?: number;
  /** Поворот модели вокруг Y в градусах (для корректировки «носа») */
  yawOffsetDeg?: number;
}

/** «Встроенная» процедурная модель — всегда первая */
export const PRIMITIVE_MODEL: ModelEntry = {
  id: 'primitive',
  label: 'Схематичный (примитивы)',
  url: null,
};

/**
 * Список GLB-моделей. Добавьте сюда свои файлы:
 *   { id: 'il96', label: 'Ил-96-300М', url: '/data/aircraft3d/models/il96.glb', scale: 1.0 },
 *   { id: 'tu204', label: 'Ту-204',     url: '/data/aircraft3d/models/tu204.glb' },
 */
export const GLB_MODELS: ModelEntry[] = [
  // Добавьте свои .glb файлы и раскомментируйте:
  // { id: 'example', label: 'Пример', url: '/data/aircraft3d/models/example.glb' },
];

/** Все доступные модели (примитивы + GLB) */
export const ALL_MODELS: ModelEntry[] = [PRIMITIVE_MODEL, ...GLB_MODELS];

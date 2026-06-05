/**
 * modelConfig.ts — конфигурация доступных 3D-моделей самолётов.
 *
 * Модели описываются в JSON-манифесте:
 *   public/data/aircraft3d/models/models.json
 *
 * Файлы .glb размещаются рядом с манифестом:
 *   public/data/aircraft3d/models/*.glb
 *
 * Функция fetchModels() загружает манифест при старте прибора.
 */

/* ─────────── Интерфейс модели ─────────── */

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
  /** Сдвиг модели по X (влево/вправо) */
  offsetX?: number;
  /** Сдвиг модели по Y (вверх/вниз) */
  offsetY?: number;
  /** Сдвиг модели по Z (вперёд/назад) */
  offsetZ?: number;
}

/* ─────────── Встроенная процедурная модель ─────────── */

export const PRIMITIVE_MODEL: ModelEntry = {
  id: 'primitive',
  label: 'Схематичный (примитивы)',
  url: null,
};

/* ─────────── Загрузка манифеста ─────────── */

const MANIFEST_URL = '/data/aircraft3d/models/models.json';

interface ManifestJSON {
  models: ModelEntry[];
}

/**
 * Загружает список GLB-моделей из models.json.
 * Если файл отсутствует или невалиден — возвращает пустой массив.
 * «Примитивная» модель всегда добавляется первой автоматически.
 */
export async function fetchModels(): Promise<ModelEntry[]> {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) return [PRIMITIVE_MODEL];
    const data: ManifestJSON = await res.json();
    const glbModels = (data.models ?? []).filter((m) => m.url);
    return [PRIMITIVE_MODEL, ...glbModels];
  } catch {
    return [PRIMITIVE_MODEL];
  }
}

# План: Загрузка реального ландшафта из интернета

**Дата:** 2026-06-10
**Статус:** Фаза 1 реализована (MVP)
**Автор:** Hermes Agent
**Связанные документы:** `README_plan_realistic_3D.md` (процедурный, откатан), `README_aircraft3d_scene.md`
**Актуализация:** 2026-06-10

---

## Цель

Загружать и отображать **реальный рельеф и спутниковые снимки** в приборе Aircraft 3D на основе географических координат самолёта. Данные подтягиваются из интернета (Mapbox API) с кэшированием для offline/replay режима.

## Источник данных

| Тип | Сервис | Формат | Примечание |
|-----|--------|--------|------------|
| Высота (DEM) | Mapbox Terrain-RGB | PNG 512×512, RGB-encoded height | Декодирование: `height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)` |
| Текстура | Mapbox Satellite | JPEG/PNG 512×512 XYZ тайлы | Стиль `mapbox.satellite` |
| Координаты | TelemetryFrame | `lat`, `lon` (градусы) | Поля из field-catalog |

**API Key:** Хранится в `.env.local` (`VITE_MAPBOX_TOKEN`), не коммитится.

## Архитектура

### Поток данных

```
TelemetryFrame.lat/lon
        ↓
TerrainManager (singleton)
        ↓
┌───────────────────────┐
│ 1. Координаты → Tile  │
│    lat/lon → z/x/y    │
│ 2. Проверка кэша      │
│    IndexedDB → hit?   │
│ 3. Fetch (если miss)  │
│    Mapbox API → blob  │
│ 4. Decode DEM         │
│    RGB → Float32Array │
│ 5. Create Three.js    │
│    PlaneGeometry +    │
│    displacement map   │
│ 6. Cache to IndexedDB │
└───────────────────────┘
        ↓
WorldGroup (RealTerrainMesh)
```

### Ключевые модули

| Модуль | Путь | Ответственность |
|--------|------|-----------------|
| `terrainTileUtils.ts` | `src/components/Instruments/aircraft3d/terrain/` | Конвертация lat/lon ↔ tile x/y/z, декодирование Terrain-RGB |
| `TerrainCache.ts` | `src/components/Instruments/aircraft3d/terrain/` | IndexedDB обёртка: get/put/clear тайлов (blob + metadata) |
| `TerrainManager.ts` | `src/components/Instruments/aircraft3d/terrain/` | Оркестрация: запросы, кэш, LOD, создание mesh |
| `RealTerrainMesh.tsx` | `src/components/Instruments/aircraft3d/terrain/` | R3F компонент: рендеринг terrain plane с displacement |
| `useRealTerrain.ts` | `src/hooks/` | Hook: подписка на telemetry, управление lifecycle |

## Фазы реализации

### Фаза 1: MVP — один тайл вокруг самолёта

**Цель:** Загрузить и отобразить один DEM+Satellite тайл по текущим координатам.

#### Шаги:

1. **Создать `terrainTileUtils.ts`**
   - `latLonToTile(lat, lon, zoom)` → `{x, y, z}`
   - `tileToLatLon(x, y, z)` → `{lat, lon}` (для центрирования mesh)
   - `decodeTerrainRGB(imageData: ImageData)` → `Float32Array` (высоты в метрах)
   - Константы: `TILE_SIZE = 512`, `DEFAULT_ZOOM = 14`

2. **Создать `TerrainCache.ts`**
   - Open IndexedDB `pilot-terrain-cache`, store `tiles`
   - `getTile(key: string)` → `Promise<Blob | null>`
   - `putTile(key: string, blob: Blob, meta: {z,x,y,timestamp})` → `Promise<void>`
   - `clearOlderThan(maxAgeMs)` — очистка устаревших записей
   - Ключ тайла: `${source}_${z}_${x}_${y}` (например `dem_14_8932_5431`)

3. **Создать `TerrainManager.ts`**
   - Синглтон или React context
   - Метод `requestTile(z, x, y, type: 'dem'|'sat')`:
     - Проверка кэша → если hit, вернуть blob
     - Если miss: fetch `https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=...`
     - Сохранить в кэш → вернуть blob
   - Rate limiting: макс 10 параллельных запросов
   - AbortController для отмены при смене позиции

4. **Создать `RealTerrainMesh.tsx`**
   - Props: `centerLat, centerLon, zoom, demBlob, satBlob`
   - Использовать `useMemo` для создания геометрии:
     - `PlaneGeometry(TILE_WORLD_SIZE, TILE_WORLD_SIZE, 256, 256)`
     - Displacement map из decoded DEM (DataTexture)
     - Texture map из satellite blob
   - Позиционирование: mesh центрирован на `(0, 0, 0)` в WorldGroup (самолёт всегда в центре)
   - Масштаб: `TILE_WORLD_SIZE = tileGroundSizeMeters(zoom) / 40` (конвертация в WU)

5. **Интеграция в RealAircraft3DScene.tsx**
   - Условный рендер: если `lat && lon && mapboxToken` → `<RealTerrainMesh />`, иначе `<GroundDisc />`
   - Передача `lat`, `lon` из telemetry frame через props/hook

6. **Тестирование Фазы 1**
   - Визуальная проверка: рельеф соответствует реальной местности
   - Проверка кэша: повторная загрузка того же тайла без сети
   - FPS: ≥ 45 при одном тайле 256×256 вершин

### Фаза 2: Динамическая подгрузка и LOD

**Цель:** Бесшовное обновление ландшафта при движении самолёта.

#### Шаги:

7. **Grid of tiles (3×3 или 5×5)**
   - Загружать соседние тайлы вокруг центрального
   - При смещении самолёта > 30% размера тайла → сдвиг сетки
   - Unload дальних тайлов (dispose geometry/texture)

8. **LOD по высоте**
   - Высота < 500 м AGL → zoom 14 (детально)
   - 500–2000 м → zoom 12
   - \> 2000 м → zoom 10 (или fallback на GroundDisc)
   - Плавный переход между уровнями (crossfade opacity)

9. **Предзагрузка**
   - Предсказание направления движения по groundspeed/heading
   - Pre-fetch тайлов в направлении полёта

### Фаза 3: Полировка и надёжность

10. **Error handling**
    - Таймаут fetch (5 сек) → fallback на cached или GroundDisc
    - Invalid token → предупреждение в HUD, switch to schematic
    - Network offline → использовать только кэш

11. **Настройки UI**
    - Toggle «Реальный ландшафт» в настройках прибора
    - Индикатор загрузки (spinner / progress bar)
    - Статус кэша (размер, кол-во тайлов)

12. **Оптимизация памяти**
    - LRU кэш: макс 200 тайлов в памяти, 1000 в IndexedDB
    - Dispose неиспользуемых текстур/геометрий
    - Web Worker для декодирования DEM (не блокировать render thread)

## Конвертация координат

### Tile numbering (Slippy Map)

```typescript
// lat/lon → tile x/y/z
function latLonToTile(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, z: zoom };
}

// Размер тайла на земле (метры)
function tileGroundSizeMeters(zoom: number, lat: number) {
  const C = 40075016.686; // экваториальная окружность Земли
  return (C * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

// Конвертация в World Units (1 WU ≈ 40 м)
const tileWU = tileGroundSizeMeters(zoom, lat) / 40;
```

### Декодирование Terrain-RGB

```typescript
function decodeTerrainRGB(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const heights = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    heights[i] = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
  }
  return heights;
}
```

## Файлы для создания/изменения

| Файл | Действие | Фаза |
|------|----------|------|
| `src/components/Instruments/aircraft3d/terrain/terrainTileUtils.ts` | Создать | 1 |
| `src/components/Instruments/aircraft3d/terrain/TerrainCache.ts` | Создать | 1 |
| `src/components/Instruments/aircraft3d/terrain/TerrainManager.ts` | Создать | 1 |
| `src/components/Instruments/aircraft3d/terrain/RealTerrainMesh.tsx` | Создать | 1 |
| `src/hooks/useRealTerrain.ts` | Создать | 1 |
| `src/components/Instruments/RealAircraft3DScene.tsx` | Изменить | 1 |
| `.env.local` | Создать (VITE_MAPBOX_TOKEN) | 1 |
| `src/ui-settings.ts` | Изменить (toggle real terrain) | 3 |

## Риски и открытые вопросы

1.  **Mapbox ToS:** Убедиться, что использование в CARLINK (возможно коммерческий продукт) разрешено. Альтернатива: self-hosted DEM + Stadia Maps.
2.  **Latency:** Первая загрузка тайла ~200-500мс. На высоких скоростях (>500 knots) может быть заметно. Решение: предзагрузка + кэш.
3.  **Координаты в телеметрии:** Проверить наличие `lat`/`lon` в field-catalog. Если нет — добавить парсинг из ARINC 429 labels.
4.  **Displacement accuracy:** Terrain-RGB разрешение ~10m/pixel на z=14. Достаточно для визуализации, но не для навигации.
5.  **IndexedDB quota:** Браузеры лимитируют ~50MB-1GB. Нужна стратегия очистки.
6.  **Cross-origin:** Mapbox поддерживает CORS. Проблем не ожидается.

## Критерии приёмки

-   [ ] При наличии `lat`/`lon` и токена отображается реальный рельеф
-   [ ] Тайлы кэшируются в IndexedDB, повторная загрузка без сети работает
-   [ ] Переключение real/schematic мгновенное (<100мс)
-   [ ] FPS ≥ 45 на десктопе (GTX 1060 / M1)
-   [ ] Нет утечек памяти при длительной работе (>1 час)
-   [ ] Graceful degradation при отсутствии сети/токена

---

## Связанная документация

-   [README_aircraft3d_scene.md](./README_aircraft3d_scene.md) — Размеры сцены, World Units
-   [README_plan_realistic_3D.md](./README_plan_realistic_3D.md) — Процедурный ландшафт (откатан, но полезен как fallback)
-   [Mapbox Terrain-RGB docs](https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/)
-   [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)

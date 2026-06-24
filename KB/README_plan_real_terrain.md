# План: Загрузка реального ландшафта из интернета

**Дата:** 2026-06-10
**Статус:** Реализовано ✅
**Автор:** Hermes Agent
**Связанные документы:** `README_terrain_proxy.md` (серверный прокси), `README_terrain_quota.md` (квоты), `README_aircraft3d_scene.md`, `README_performance_3D.md`
**Актуализация:** 2026-06-10

---

## Цель

Загружать и отображать **реальный рельеф и спутниковые снимки** в приборе Aircraft 3D на основе географических координат самолёта. Данные подтягиваются из Mapbox через серверный прокси с дисковым кэшированием для экономии API лимита и ускорения повторной загрузки.

## Архитектура (реализованная)

```
                               ┌──────────────────────────────┐
                               │       Browser (R3F)          │
                               │  ┌────────────────────────┐  │
                               │  │ useRealTerrain hook    │  │
                               │  │  → TerrainManager      │  │
                               │  │    → fetch tiles       │  │
                               │  │      from /api/terrain  │  │
                               │  │    → decode DEM RGB     │  │
                               │  │    → create geometry    │  │
                               │  │    + satellite texture  │  │
                               │  │  → RealTerrainMesh     │  │
                               │  └────────────────────────┘  │
                               └──────────┬───────────────────┘
                                          │ GET /api/terrain/tile/:z/:x/:y?type=dem|sat
                                          │ GET /api/terrain/quota
                                          ▼
                               ┌──────────────────────────────┐
                               │   server.js (Express)        │
                               │  ┌────────────────────────┐  │
                               │  │ Static dist/           │  │
                               │  │ Terrain API:           │  │
                               │  │  • Cache check (disk)  │  │
                               │  │  • Quota check         │  │
                               │  │  • Proxy → Mapbox API  │  │
                               │  │  • Cache write (disk)  │  │
                               │  │  • Quota increment     │  │
                               │  └────────────────────────┘  │
                               └──────────┬───────────────────┘
                                          │ (если cache miss)
                                          ▼
                               ┌──────────────────────────────┐
                               │     Mapbox API               │
                               │  • mapbox.terrain-rgb        │
                               │  • mapbox.satellite          │
                               └──────────────────────────────┘
```

### Поток данных (подробно)

```
TelemetryFrame.lat/lon
        ↓
useRealTerrain hook
  — сравнивает с lastCoordsRef (избегает повторной загрузки)
  — вызывает TerrainManager.loadTileGrid(lat, lon, gridSize)
        ↓
TerrainManager
  — lat/lon → tile x/y/z (Slippy Map, zoom=14)
  — собирает сетку gridSize×gridSize (5×5 = 25 тайлов)
  — запускает параллельные загрузки (max 6 concurrent)
        ↓
  Для каждого тайла:
    1. Проверка IndexedDB (клиентский кэш)
    2. Если miss → fetch /api/terrain/tile/:z/:x/:y?type=dem
        ↓
        Server (server.js)
          ├─ 1. Проверка дискового кэша (cache/terrain/z/x/y-dem.png)
          ├─ 2. Если HIT → вернуть файл (X-Cache: HIT)
          ├─ 3. Если MISS → проверить квоту (max 45k/мес)
          ├─ 4. Если квота есть:
          │     fetch → cache/ → вернуть клиенту (X-Cache: MISS)
          │     incrementQuota(type)
          └─ 5. Если квоты нет → 429 Too Many Requests
        ↓
    3. Клиент: createImageBitmap(blob) → canvas → decodeTerrainRGB
    4. Сохранить в IndexedDB (второй уровень кэша)
    5. Получить satellite текстуру (те же шаги, type=sat)
    6. onTileReady(coord, data) → setTileData
        ↓
RealTerrainMesh
  — useMemo: создаёт BufferGeometry из decoded высот
  — Вычисляет min/max высоту для корректного позиционирования
  — Создаёт CanvasTexture из satellite bitmap
  — Позиция: (0, -6, 0) в локальных координатах WorldGroup
```

## Два уровня кэширования

| Уровень | Где | Хранилище | Формат | Ёмкость | Скорость |
|---------|-----|-----------|--------|---------|----------|
| **L1 (сервер)** | `server.js` | Диск `cache/terrain/` | PNG/JPG файлы | ~100K+ тайлов | 1-2ms |
| **L2 (клиент)** | `TerrainCache.ts` | IndexedDB `pilot-terrain-cache` | Blob | 1000 записей (LRU) | 5-10ms |

При повторном пролёте над теми же координатами:
1. IndexedDB hit → нет запроса к серверу вообще (даже локального)
2. IndexedDB miss → сервер проверяет дисковый кэш → HIT → без обращения к Mapbox

## Ключевые модули

| Модуль | Путь | Ответственность |
|--------|------|-----------------|
| `server.js` | `server/server.js` | Express сервер: статика + terrain прокси + квоты |
| `terrainTileUtils.ts` | `src/components/Instruments/aircraft3d/terrain/` | Конвертация lat/lon ↔ tile x/y/z, декодирование Terrain-RGB |
| `TerrainCache.ts` | `src/components/Instruments/aircraft3d/terrain/` | IndexedDB обёртка: get/put/clear тайлов (blob + metadata) |
| `TerrainManager.ts` | `src/components/Instruments/aircraft3d/terrain/` | Оркестрация: запросы к proxy, кэш, загрузка сетки тайлов |
| `RealTerrainMesh.tsx` | `src/components/Instruments/aircraft3d/terrain/` | R3F компонент: рендеринг terrain plane из decoded высот |
| `useRealTerrain.ts` | `src/hooks/` | Hook: подписка на телеметрию, управление lifecycle |
| `ecosystem.config.cjs` | корень | pm2: запуск `node server/server.js` на порту 3410 |

## Формат данных

### Mapbox Terrain-RGB (DEM)

```
URL: /api/terrain/tile/:z/:x/:y?type=dem
Формат: PNG 512×512 (в стандарте), сервер отдаёт raw
Каждый пиксель RGB кодирует высоту:
  height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)

Пример декодирования:
  R=128, G=0, B=0 → -10000 + (128*65536 + 0*256 + 0) * 0.1 = -10000 + 838860.8 = -16139.2 м (дно океана)
  R=0, G=128, B=0 → -10000 + (0 + 32768 + 0) * 0.1 = -10000 + 3276.8 = -6723.2 м
  R=255, G=255, B=255 → -10000 + (16711680 + 65280 + 255) * 0.1 = 788.1 м
```

### Mapbox Satellite (текстура)

```
URL: /api/terrain/tile/:z/:x/:y?type=sat
Формат: JPEG (сервер перекодирует в webp)
Стиль: mapbox.satellite
```

### API endpoints (серверные)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/terrain/tile/:z/:x/:y?type=dem\|sat` | Получить тайл (с кэшированием и квотой) |
| GET | `/api/terrain/quota` | Статистика использования Mapbox API |

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

### Параметры загрузки

- **Zoom-level:** 14 (≈ 1.2 м/пиксель на широте ~45°)
- **Grid size:** 5×5 = 25 тайлов (каждый ~512×512 пикселей, ~340×340 метров на земле)
- **Segments:** 64×256 вершин на тайл
- **Max concurrent:** 6 параллельных запросов
- **Timeout:** 8 секунд на тайл

## Mapbox лимиты

| Параметр | Значение |
|----------|----------|
| Бесплатный лимит | 50,000 запросов/месяц |
| Буфер безопасности | 10% (остановка на 45,000) |
| Сброс квоты | 1-е число каждого месяца |
| Стоимость 1 запроса | 1 (независимо от типа: DEM или Satellite) |

> Подробно: [README_terrain_quota.md](./README_terrain_quota.md)

## Этапы реализации (пройденные)

### ✅ Фаза 1: Единый сервер (Express)

- `server/server.js` заменяет `serve dist -l 3410`
- Раздаёт статику + API `/api/terrain/*`
- pm2: один процесс на порту 3410

### ✅ Фаза 2: Прокси с дисковым кэшем

- `GET /api/terrain/tile/:z/:x/:y?type=dem|sat`
- Проверка кэша в `cache/terrain/z/x/y-type.png`
- Если MISS → fetch Mapbox → запись в кэш → ответ
- X-Cache: HIT / MISS заголовки

### ✅ Фаза 3: Клиентский кэш (IndexedDB)

- `TerrainCache.ts` — обёртка над IndexedDB
- LRU: 1000 записей
- Приоритет: L2 (IndexedDB) → L1 (диск сервера) → Mapbox

### ✅ Фаза 4: Квоты

- `GET /api/terrain/quota` — статистика
- Запись в `cache/terrain-quota.json`
- Авто-остановка при 45,000 запросов

### ✅ Фаза 5: Ленивая подгрузка по движению самолёта (2026-06-18)

**Реализовано.** Подробности: [README_terrain_lazy_loading_report.md](./README_terrain_lazy_loading_report.md)

- `TerrainManager.updatePosition(lat, lon)` — lazy-загрузка: вычисляет нужную сетку `loadRadius=3` (7×7), удаляет тайлы за `keepRadius=4` (9×9)
- `everLoaded` Set — тайлы, загруженные хотя бы раз, восстанавливаются **только из клиентского кэша (IDB)**, без обращения к интернету
- `useRealTerrain` — rAF-цикл (500мс) читает `aircraftPosition` напрямую, вычисляет lat/lon из накопленного смещения в WU
- `TerrainTile` — `useEffect` cleanup: `geo.dispose()`, `mat.dispose()`, `tex.dispose()` при размонтировании тайла
- `forceCacheOnly` — DEM **и** satellite берутся из IndexedDB (раньше satellite всегда фетчился с сервера)
- Проброс `centerTile` через `TerrainManager.getCurrentCenter()` → hook → scene → mesh для стабильного референса

## Переменные окружения

```env
VITE_MAPBOX_TOKEN=pk.eyJ1...     # Mapbox API токен (обязателен)
PORT=3410                          # порт сервера (по умолчанию 3410)
```

## Дебаг

### Включение/выключение

В localStorage браузера:
```js
localStorage.setItem('realTerrainEnabled', 'true');  // включить
localStorage.setItem('realTerrainEnabled', 'false'); // выключить
```

### Проверка кэша на сервере

```bash
# Размер кэша
du -sh cache/terrain/

# Количество тайлов
find cache/terrain/ -name '*.png' | wc -l

# Квота
cat cache/terrain-quota.json
```

### Browser console

```js
// Проверка TerrainManager
TerrainManager.isReady  // true если токен есть

// Проверка загруженных тайлов
// В useRealTerrain: setTileData(data)
// console.log('[useRealTerrain] onTile fired:', coord);
```

## Известные ограничения

1. **Mapbox ToS:** Бесплатный лимит 50k/мес. Для коммерческого использования нужен платный план.
2. **DEM разрешение:** zoom=14 → ~1.2 м/пиксель. Достаточно для визуализации, не для навигации.
3. **Memory:** 25 тайлов × 512×512 = ~6.5M вершин. FPS ≥ 30 на десктопе.
4. **Спутниковые текстуры:** Mapbox satellite иногда отдаёт 404 для тайлов над океаном или слишком высоких zoom. Обрабатывается graceful — terrain остаётся без текстуры (красный).
5. **Первая загрузка:** 25 тайлов × 2 типа = ~50 запросов. Время зависит от сети.
6. **IndexedDB quota:** Браузеры лимитируют ~50MB–1GB. LRU 1000 записей + очистка старых.

---

## Связанная документация

- [README_terrain_proxy.md](./README_terrain_proxy.md) — Серверный прокси: server.js, кэш, алгоритм
- [README_terrain_quota.md](./README_terrain_quota.md) — Система квот Mapbox, сброс, алерты
- [README_aircraft3d_scene.md](./README_aircraft3d_scene.md) — Размеры сцены, World Units
- [README_architecture.md](./README_architecture.md) §4.8 — Окно Карты тайлов (v2.14.0): Leaflet + BroadcastChannel, слои сцена/кэш/отсутствующие
- [README_performance_3D.md](./README_performance_3D.md) — Производительность 3D
- [Mapbox Terrain-RGB docs](https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/)
- [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)

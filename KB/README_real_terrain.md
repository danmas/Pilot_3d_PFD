# Реальный ландшафт из интернета (Mapbox Terrain-RGB)

**Дата:** 2026-06-10
**Статус:** Фаза 1 (MVP) реализована
**Версия:** v2.8.11

---

## Обзор

Загрузка и отображение **реального рельефа и спутниковых снимков** в приборе Aircraft 3D через Mapbox API. Данные подтягиваются из интернета с кэшированием в IndexedDB для offline/replay режима.

## Источник данных

| Тип | Сервис | Формат | Примечание |
|-----|--------|--------|------------|
| Высота (DEM) | Mapbox Terrain-RGB | PNG 512×512, RGB-encoded height | Декодирование: `height = -10000 + ((R*256*256 + G*256 + B) * 0.1)` |
| Текстура | Mapbox Satellite | JPEG 512×512 XYZ тайлы | Стиль `mapbox.satellite` |
| Geocoding | Mapbox Geocoding v5 | JSON | Поиск мест по названию |

**API Key:** `VITE_MAPBOX_TOKEN` в `.env.local` (не коммитится).

## Архитектура

### Поток данных

```
🏔 toggle (showTerrain)
        ↓
useRealTerrain(enabled=true)
        ↓
TerrainManager.setAnchor(lat, lon)
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
│    displacement       │
│ 6. Load satellite     │
│    TextureLoader      │
│ 7. Cache to IndexedDB │
└───────────────────────┘
        ↓
WorldGroup → RealTerrainMesh (R3F)
```

### Компоненты

| Файл | Путь | Назначение |
|------|------|-----------|
| `terrainTileUtils.ts` | `src/components/Instruments/aircraft3d/terrain/` | Конвертация lat/lon ↔ tile x/y/z, декодирование Terrain-RGB |
| `TerrainCache.ts` | `src/components/Instruments/aircraft3d/terrain/` | IndexedDB кэш: getTile/putTile/clearOlderThan |
| `TerrainManager.ts` | `src/components/Instruments/aircraft3d/terrain/` | Синглтон: оркестрация запросов, geocoding, пресеты (6 локаций) |
| `RealTerrainMesh.tsx` | `src/components/Instruments/aircraft3d/terrain/` | R3F-компонент: PlaneGeometry(256×256) с displacement из DEM + satellite-текстура |
| `TerrainDialog.tsx` | `src/components/Instruments/aircraft3d/terrain/` | UI-диалог выбора места |
| `useRealTerrain.ts` | `src/hooks/` | React-хук: подписка на TerrainManager, триггер загрузки |
| `RealAircraft3DScene.tsx` | `src/components/Instruments/` | Интеграция: кнопки 🏔/📍, условный рендер GroundDisc vs RealTerrainMesh |
| `.env.local` | корень проекта | `VITE_MAPBOX_TOKEN` (не коммитится) |

### UI

- **🏔** — вкл/выкл ландшафта. При первом включении авто-открывает диалог выбора места.
- **📍** — открыть диалог выбора места (появляется только при включённом ландшафте).
- **TerrainDialog** — модальное окно:
  - 6 пресетов: Альпы, Кавказ, Гималаи (Эверест), Гранд-Каньон, Анды, Москва
  - Поиск места через Mapbox Geocoding (поле ввода + 🔍)
  - Ручной ввод lat/lon + GO
  - Отображение текущей позиции
- Состояние сохраняется в localStorage (`pilot-3d-pfd:showTerrain`, `pilot-3d-pfd:terrainPos`)

### Константы

| Параметр | Значение |
|----------|----------|
| Zoom по умолчанию | 14 |
| Размер тайла | 512×512 px |
| Размер тайла на земле | ~1366 м (на широте 56°) |
| Размер в WU | ~34 WU (1 WU = 40 м) |
| Разрешение geometry | 256×256 вершин |
| Позиция по умолчанию | 55.9726, 37.4146 (Шереметьево) |

## Реализованные фичи (Фаза 1)

- [x] Загрузка DEM (Terrain-RGB) + Satellite тайлов через Mapbox API
- [x] IndexedDB кэш с ключом `{type}_{z}_{x}_{y}`
- [x] Displacement geometry из decoded высот
- [x] Satellite текстура на рельефе
- [x] Переключение GroundDisc ↔ RealTerrainMesh мгновенное
- [x] 6 пресетов популярных локаций
- [x] Поиск места через Mapbox Geocoding API
- [x] Ручной ввод lat/lon
- [x] Сохранение позиции в localStorage
- [x] Индикатор загрузки + сообщения об ошибках
- [x] Graceful degradation: без токена — кнопка не работает

## План развития (Фазы 2-3)

См. [README_plan_real_terrain.md](./README_plan_real_terrain.md):

- **Фаза 2:** Grid of tiles (3×3), LOD по высоте, предзагрузка по направлению
- **Фаза 3:** Error handling (timeout, offline), настройки кэша, Web Worker для DEM

## Связанная документация

- [README_plan_real_terrain.md](./README_plan_real_terrain.md) — Полный план реализации
- [README_plan_realistic_3D.md](./README_plan_realistic_3D.md) — Процедурный ландшафт (откатан)
- [README_aircraft3d_scene.md](./README_aircraft3d_scene.md) — Размеры сцены, World Units
- [README_architecture.md](./README_architecture.md) — Архитектура приложения
- [Mapbox Terrain-RGB docs](https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/)
- [Slippy Map Tilenames](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)

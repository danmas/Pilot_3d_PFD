# Отчёт: Ленивая подгрузка ландшафта по движению самолёта

**Дата:** 2026-06-18
**Статус:** Реализовано ✅
**Автор:** Hermes Agent (GLM-5.2, Z.AI)
**Связанные документы:** `README_plan_real_terrain.md` (Фаза 5), `README_plan_terrain_lod.md` (P0.1), `README_terrain_p0_report.md`

---

## 1. Постановка проблемы

При перемещении самолёта вперёд новые квадраты ландшафта не подгружались — сцена оставалась статичной сеткой 7×7 тайлов. Требовалось: по мере движения подгружать новые тайлы по направлению полёта (из кэша, если ранее загружены, или с сервера, если новые), удалять старые.

## 2. Диагностика — три корневые причины

### Причина 1: Memo-компаратор не пропускал координаты

`RealAircraft3DScene.tsx` обёрнут в `React.memo` с кастомным компаратором, который сравнивал только `PitchAngle`, `RollAngle`, `Heading1`, `CAS`, `Vy`, `RAltitude`. **`Latitude` и `Longitude` отсутствовали** — при ровном полёте компонент не перерисовывался, хук `useRealTerrain` получал устаревшие координаты.

### Причина 2: FDM не записывал географические координаты

`flightModel.ts` (`tickImprovedFdm`) двигал самолёт в локальных координатах (`aircraftPosition.x/z` в World Units), но **никогда не записывал** `Latitude`/`Longitude` в `outFrame`. В Simple FDM — та же проблема. Координаты оставались статичными.

Даже после добавления lat/lon в `outFrame`, они доходили до React state (`setFrame`) **только в manual-режиме** (`telemetryLocked || active`), а не в auto/sample-режиме.

### Причина 3: `forceCacheOnly` не кэшировал satellite

Для тайлов из `everLoaded` (уже загруженных ранее) DEM брался из IndexedDB, но satellite **всегда** фетчился с сервера — несогласованность с принципом «не ходить в сеть, если уже загружали».

## 3. Что было сделано

### 3.1. Memo-компаратор — добавлены координаты

**Файл:** `src/components/Instruments/RealAircraft3DScene.tsx`

```diff
  pf.RAltitude === nf.RAltitude &&
+ pf.Latitude === nf.Latitude &&
+ pf.Longitude === nf.Longitude
```

### 3.2. Географические координаты в FDM

**Файл:** `src/components/Instruments/aircraft3d/flightModel.ts`

Добавлены `refLat`/`refLon` в `ImprovedState` (стартовая точка — Альпы, Монблан: 45.832, 6.865).

В `tickImprovedFdm` — конвертация накопленного смещения `aircraftPosition` (WU) в lat/lon:

```typescript
// +X = восток, -Z = север, 1 WU = 40 м
const METERS_PER_DEG_LAT = 111320;
const dxMeters = aircraftPosition.x * 40;    // восток → долгота
const dnMeters = -aircraftPosition.z * 40;   // север → широта
const simLat = state.refLat + dnMeters / METERS_PER_DEG_LAT;
const simLon = state.refLon + dxMeters / (METERS_PER_DEG_LAT * cosRefLat);
```

Запись в `outFrame.Latitude` / `outFrame.Longitude`.

### 3.3. rAF-цикл в useRealTerrain — прямой источник координат

**Файл:** `src/hooks/useRealTerrain.ts`

Поскольку frame-prop propagation ненадёжен (зависит от режима FDM, `telemetryLocked` и т.д.), hook теперь **напрямую читает `aircraftPosition`** через `requestAnimationFrame` (проверка каждые 500мс) и сам вычисляет lat/lon по той же формуле.

Это работает в **обоих** режимах FDM (Simple и Improved), т.к. `aircraftPosition` обновляется в `useFrame` независимо от цепочки frame → React state → props.

Старый `setInterval` (5 сек) заменён на rAF. Порог движения снижен с 0.4 до 0.25 от размера тайла (~580 м) для большей отзывчивости.

### 3.4. Dispose GPU-ресурсов при размонтировании тайла

**Файл:** `src/components/Instruments/aircraft3d/terrain/TerrainTile.tsx`

```typescript
useEffect(() => {
  return () => {
    geo.dispose();
    mat.dispose();
    const tex = (mat as THREE.MeshStandardMaterial).map;
    if (tex) tex.dispose();
  };
}, [geo, mat]);
```

Раньше при выходе тайла за `keepRadius` и размонтировании компонента — геометрия, материал и текстура оставались в VRAM. Теперь освобождаются корректно.

### 3.5. forceCacheOnly — satellite из IndexedDB

**Файл:** `src/components/Instruments/aircraft3d/terrain/TerrainManager.ts`

В режиме `forceCacheOnly` (для `everLoaded` тайлов) satellite-текстура теперь берётся из IndexedDB через `getTile(satKey)`, а не фетчится с сервера. DEM и satellite — оба из клиентского кэша, без сети.

### 3.6. Убран мёртвый код

**Файл:** `RealAircraft3DScene.tsx` — убран игнорируемый 4-й аргумент `5` (gridSize) из вызова `useRealTerrain()`. Хук имеет 3 параметра; параметр остался от предыдущей архитектуры с фиксированной сеткой.

## 4. Архитектура после исправлений

```
useFrame (AircraftModel)
  → aircraftPosition.x/z += скорость × курс × dt
     ↓
useRealTerrain rAF (500мс)
  → читает aircraftPosition напрямую
  → вычисляет lat/lon (WU → метры → градусы)
  → scheduleUpdate(simLat, simLon)
     ↓
TerrainManager.updatePosition(lat, lon)
  → latLonToTile(lat, lon, zoom=14) → center tile
  → if center unchanged → return
  → needed = 7×7 grid around center (loadRadius=3)
  → keep = 9×9 grid (keepRadius=4)
  → delete tiles outside keep
  → for each needed tile:
      if everLoaded → loadSingleTile(forceCacheOnly=true) → IDB only
      else          → loadSingleTile() → proxy (cache → Mapbox)
  → onTileAdded callback → setTiles → React re-render
     ↓
RealTerrainMesh
  → <TerrainTile key="z/x/y-mode" /> для каждого тайла
  → TerrainTile: useMemo(geo), useMemo(mat), useEffect(dispose on unmount)
  → при выходе за keepRadius: React unmount → dispose → VRAM freed
```

## 5. Параметры системы

| Параметр | Значение | Описание |
|----------|----------|----------|
| Zoom | 14 | ~1.2 м/пиксель, тайл ~2.3 км |
| loadRadius | 3 | 7×7 = 49 тайлов загружается |
| keepRadius | 4 | 9×9 = 81 тайл удерживается |
| maxConcurrent | 6 | Параллельных запросов |
| rAF interval | 500 мс | Частота проверки позиции |
| Move threshold | 0.25 тайла | ~580 м — триггер updatePosition |
| Debounce | 300 мс | Защита от частых вызовов |
| Segments (realistic) | 32×64 | ~4096 трисов на тайл |
| Segments (schematic) | 16×32 | ~1024 трисов на тайл |

## 6. Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `src/components/Instruments/RealAircraft3DScene.tsx` | +Latitude/Longitude в memo; убран мёртвый аргумент |
| `src/components/Instruments/aircraft3d/flightModel.ts` | +refLat/refLon; +конвертация WU→lat/lon; +Latitude/Longitude в outFrame |
| `src/hooks/useRealTerrain.ts` | +rAF-цикл чтения aircraftPosition; порог 0.25; import SIM_REF |
| `src/components/Instruments/aircraft3d/terrain/TerrainTile.tsx` | +useEffect dispose (geo/mat/tex) |
| `src/components/Instruments/aircraft3d/terrain/TerrainManager.ts` | +forceCacheOnly для satellite (IDB) |

## 7. Проверка

- TypeScript: `npx tsc --noEmit` — нет новых ошибок в изменённых файлах
- Тест: полёт вперёд — новые тайлы подгружаются по направлению движения, старые удаляются позади
- Логи: в TerrainLogPanel появляются записи `LOADED-INTO-SCENE` (from: network / client-cache) и `REMOVED-FROM-SCENE`

## 8. Следующие шаги

- **P1: Displacement Map** — снижение до ~512 трисов на тайл (см. `README_plan_terrain_lod.md`)
- Улучшить логирование в `TerrainLogPanel` (текущие/пиковые трисы, счётчик пересозданий)
- Замеры FPS на реальной сцене (chase над горами)
- Возможный seam-fix при displacement (skirts)

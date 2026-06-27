# Архитектура Pilot_3d_PFD

> Версия документа: v2.14.0

---

## 1. Общая схема

```
main.tsx → App.tsx (роутер страниц + источник frame)
              │
              ├── Hub
              ├── PFD (PFDInstrument)
              ├── PanelBuilder (кастомный дашборд)
              ├── PanelDisplay (PFD + PanelBuilder)
              ├── 3D Aircraft (Aircraft3DInstrument + AircraftModel)
              ├── PanelBuilderAircraft3d (3D + приборы)
              ├── RawMonitor (сырая телеметрия)
              └── Settings (UDP/симулятор)
```

---

## 2. Ключевые концепты

### `telemetryRef` — единый источник истины

Глобальный ref-объект, доступный через импорт модуля. Содержит актуальный `TelemetryFrame`. **Не триггерит React re-render** — служит шиной между sample/live/manual-режимами и компонентами, которые читают данные напрямую (AircraftModel).

```ts
// src/telemetryRef.ts
export const telemetryRef: { current: TelemetryFrame }
```

### `frame` (React state) — что рендерит UI

Обновляется через `setFrame()` из трёх источников:

| Источник           | Механизм                        | Условие                           |
|--------------------|----------------------------------|-----------------------------------|
| **Sample**         | requestAnimationFrame (tick)     | `dataMode === 'sample'`           |
| **Live (SSE)**     | EventSource → `pfd-frame` event | `dataMode === 'live'`             |
| **Replay**         | setInterval                     | `dataMode === 'replay'`           |
| **Manual (джойстик)** | AircraftModel → `onTelemetryUpdate` → `setFrame` | `telemetryLocked === true` |

### `aircraftControlsRef` — управление режимом

```ts
// src/aircraftControlsRef.ts
export const aircraftControlsRef: {
  current: {
    telemetryLocked: boolean,       // true — manual mode
    onTelemetryUpdate: ((f: TelemetryFrame) => void) | null
  }
}
```

- Первое касание джойстика → `telemetryLocked = true` (навсегда, до перезагрузки страницы)
- `onTelemetryUpdate` — мост из Three.js useFrame в React setState

---

## 3. Потоки данных

```
┌───────────────────────────────────────────────────────────────┐
│                        DATA SOURCE                            │
│                                                               │
│  sample-data.ts ──┐                                           │
│  live SSE (UDP) ──┤──→ telemetryRef.current ──→ setFrame()    │
│  replay ──────────┘                                           │
│                      (только если !telemetryLocked)            │
│                                                               │
│  manual mode: ──→ AircraftModel ──→ telemetryRef.current      │
│  (джойстик)         │ (useFrame)                              │
│                     └──→ onTelemetryUpdate()                  │
│                              └──→ telemetryCallbackRef         │
│                                      └──→ setFrame()          │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────────┐
                    │   React state: frame │
                    │   (передаётся пропом) │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
          PFD приборы    3D Aircraft       PanelBuilder
          (5 штук)      (Three.js)        (PanelKit)
```

> **v2.14.0:** состояние 3D-сцены (геопозиция, путевой вектор, тайлы) дополнительно транслируется через `BroadcastChannel('pilot-map-state')` в отдельное окно Карты (`map.html`). Это side-channel — не влияет на основной поток `telemetryRef → setFrame`.

### Упрощённая диаграмма

```
Sources → telemetryRef → setFrame() → Component(frame)
                ↑
        AircraftModel (manual)
          (useFrame loop)
```

---

## 4. Компоненты

### 4.1 App.tsx — ядро

- 32 `useState` — все состояния UI (страница, режим, настройки записи/воспр.)
- 3 `useRef` — `frameIndex`, `EventSource`, `pressedKeys`
- 1 `useRef` + 1 `useEffect` — `telemetryCallbackRef` (обязательно **выше** условных return'ов)
- Жизненные циклы: sample (rAF), live (SSE), replay, клавиатура, backend polling

### 4.2 PFD — приборная панель (`src/components/PFD/`)

| Компонент             | Назначение                          |
|-----------------------|-------------------------------------|
| `PFD.tsx`             | Компоновка 5 приборов в grid        |
| `AttitudeIndicator`   | Авиагоризонт (canvas)               |
| `AirspeedTape`        | Лента скорости (CAS)                |
| `AltitudeTape`        | Лента барометрической высоты        |
| `VerticalSpeed`       | Вариометр (V/S)                     |
| `AoATape`             | Угол атаки (AoA)                    |

### 4.3 3D Aircraft (`src/components/Instruments/aircraft3d/`)

| Компонент              | Назначение                                     |
|------------------------|-------------------------------------------------|
| `Aircraft3DInstrument.tsx` | Главный компонент: HUD, кнопки, регистрация |
| `AircraftModel.tsx`    | **Ядро физики/визуализации.** Читает telemetryRef (auto) или управляется джойстиком (manual). На каждом кадре Three.js `useFrame` обновляет модель + пишет в telemetryRef. |
| `CameraController.tsx` | OrbitControls + пресеты видов                   |
| `Ground.tsx`           | Поверхность земли                               |
| `Clouds.tsx`           | Облака (процедурные)                            |
| `HorizonSphere.tsx`    | Небесная сфера (GLSL-шейдер)                    |
| `Runway.tsx`           | ВПП                                             |
| `GridOverlay.tsx`      | Сетка на земле (2000×2000, шаг 10)              |
| `RealAircraft3DScene.tsx`| Авиагоризонт в 3D (Pitch/Roll/Heading)         |
| `VelocityVector.tsx`   | Вектор траектории (отключён)                    |
| `aircraftPosition.ts`  | **Позиционирование + Ground Touch.** Ограничивает Y ≥ -6, срабатывает TOUCHDOWN. |
| `modelConfig.ts`       | Типы и загрузка .glb моделей                    |
| `ModelDialog.tsx`      | UI выбора модели                                |

### 4.4 PanelBuilder (`src/components/PanelKit/`)

Абстрактный drag-n-drop конструктор дашбордов. Основные элементы:

- **PanelCanvas** — холст с деревом узлов, поддерживает drop из сайдбара и **между ячейками** (v2.8.5)
- **PanelNode** — узел (empty/instrument/split)
- **SplitContainer** — разделитель H/V с перетаскиванием
- **Sidebar** — список доступных инструментов
- **Registry** — реестр всех зарегистрированных виджетов (PFD-приборы, 3D)

**Drag-n-drop между ячейками (v2.8.5):** Приборы можно перетаскивать между ячейками (move-семантика — исходная очищается). Десктоп: HTML5 DnD, тач: `usePanelWidgetTouchDrag`. Исключение: `Aircraft3DInstrument` выключен из меж-ячеечного DnD (v2.8.6) — мышь занята вращением сцены.

### 4.5 Hub View (App.tsx)

Главная страница — карточки-ссылки на все view. В нижней строке:
- UDP порт (`sourceStatus.udpPort`)
- Версия приложения (`APP_VERSION` из `src/version.ts`)
- Статус источника (active/inactive)

### 4.6 Приборы (инструменты)

Все в `src/components/Instruments/`:

| Файл                         | Назначение                          |
|------------------------------|-------------------------------------|
| `PFDInstrument.tsx`          | Основной PFD (5 приборов)           |
| `PFD2Instrument.tsx`         | Альтернативный PFD                  |
| `AttitudeInstrument.tsx`     | Авиагоризонт (отдельный)            |
| `AirspeedInstrument.tsx`     | Скорость (отдельный)                |
| `AltitudeInstrument.tsx`     | Высота (отдельный)                  |
| `VerticalSpeedInstrument.tsx`| Вариометр (отдельный)               |
| `AoAInstrument.tsx`          | Угол атаки (отдельный)              |
| `NavDisplayInstrument.tsx`   | Навигационный дисплей               |
| `EngineDisplayInstrument.tsx`| Параметры двигателей                |
| `ConfigDisplayInstrument.tsx`| Конфигурация полёта                 |
| `AuxPanelInstrument.tsx`     | Вспомогательная панель              |
| `Aircraft3DInstrument.tsx`   | 3D вид самолёта                     |

### 4.7 Ground Touch (v2.6.3)

`aircraftPosition.ts`: при касании земли (`Y ≤ -6`) — позиция зажимается в Y = -6, срабатывает `groundTouch.current = true`, на экране появляется оверлей TOUCHDOWN. Подробнее: [README_ground_touch.md](./README_ground_touch.md).

### 4.8 Окно Карты тайлов (v2.14.0)

Отдельное окно браузера (`map.html` → `src/map/main.tsx`), открывается из 3D-сцены кнопкой 🗺. Схематичная карта на Leaflet (без тайл-слоя). Получает состояние сцены через **BroadcastChannel** (`pilot-map-state`) — главное окно не передаёт данные на сервер, окно карты ничего не вычисляет.

- `useMapBroadcaster(frame)` — вызывается в `RealAircraft3DScene`, rAF-цикл ~10 Гц: читает `aircraftPosition` + `locationRef` + `TerrainManager` и отправляет `MapStatePacket { lat, lon, track, speed, heading, sceneTiles, needed, centerTile }`.
  - `centerTile` — центральный тайл сетки, нужен для отображения колец LOD на карте.
- `MapApp.tsx` — слои:
  - **сцена** — зелёные прямоугольники, интенсивность заливки зависит от кольца LOD вокруг `centerTile`;
  - **кэш сервера** — серый (`/api/terrain/cached`);
  - **отсутствующие тайлы** — красный пунктир (динамический радиус из `scene-config.json`, не фиксированный 7×7);
  - маркер самолёта + вектор скорости, компас N/Ю, авто-центр + кнопка ⊕.

### 4.9 Загрузка terrain-тайлов (v2.18.0)

Тайлы высот (DEM) и спутниковые тайлы (SAT) можно загружать двумя способами:

| Транспорт | Путь | Назначение |
|-----------|------|------------|
| HTTP | `GET /api/terrain/tile/:z/:x/:y?type=dem\|sat` | Классический прокси, 6 параллельных соединений на домен |
| WebSocket | `ws://host/ws/terrain` | Одно постоянное соединение, батчевая загрузка, автоматический fallback на HTTP |

Конфигурация транспорта — поле `terrain.transport` в [`scene-config.json`](../scene-config.json). WebSocket активируется при `"transport": "websocket"`.

Серверная реализация:
- [`server/terrain-tile-loader.js`](../server/terrain-tile-loader.js) — общий загрузчик (кэш, Mapbox, квота).
- [`server/terrain-ws.js`](../server/terrain-ws.js) — бинарный WebSocket-эндпоинт.

Клиентская реализация:
- [`TerrainWebSocketClient.ts`](../src/components/Instruments/aircraft3d/terrain/TerrainWebSocketClient.ts) — батчевой WS-клиент с fallback.
- [`TerrainManager.ts`](../src/components/Instruments/aircraft3d/terrain/TerrainManager.ts) — выбирает транспорт по конфигу.

---

## 5. Управление (Controls)

### TouchControls (`src/components/Controls/TouchControls.tsx`)

Сенсорные джойстики для планшета/телефона:

- `Joystick.tsx` — левый (управление креном/тангажом)
- `RudderSlider.tsx` — слайдер рыскания
- `ThrottleJoystick.tsx` — джойстик газа (правый)

Логика:
1. При первом касании любого элемента → `telemetryLocked = true`, показывается уведомление `MANUAL FLIGHT`
2. Все последующие касания работают без уведомлений
3. При отпускании — **heading hold** (самолёт летит по последнему курсу, без возврата к sample)
4. Возврат к sample/live — только перезагрузка страницы

### Протокол `writeOverride` / `clearOverride`

```ts
type OverrideData = {
  roll: number;    // -1..1
  pitch: number;   // -1..1
  yaw: number;     // -1..1
  throttle: number; // 0..1 (v2.8.10)
}

writeOverride(data: OverrideData): void   // активирует manual mode
clearOverride(): void                     // отпускает джойстик
```

**v2.8.10 — фикс РУД:** `ThrottleJoystick` раньше менял `ref.throttle` напрямую, без `writeOverride`. После касания синего джойстика состояние `active` засыпало, и РУД переставал обновлять обороты. Теперь РУД всегда вызывает `writeOverride` с текущими значениями roll/pitch/yaw/throttle.

---

## 6. Поток manual mode (детально)

```
1. TouchControls.onTouchStart →
     writeOverride({roll, pitch, yaw}) →
     telemetryLocked = true,
     showNotification('MANUAL FLIGHT')

2. AircraftModel.useFrame (каждый кадр) →
     override.active === true →
       применяет roll/pitch/yaw к модели,
       вычисляет новые PitchAngle, RollAngle, MagneticHeading
       ↓
     telemetryRef.current = { PitchAngle, RollAngle, MagneticHeading, CAS, ... }
       ↓
     onTelemetryUpdate?.(telemetryRef.current)
       ↓
     telemetryCallbackRef.current(setFrame(telemetryRef.current))
       ↓
     React re-render → PFD обновляется

3. TouchControls.onTouchEnd →
     clearOverride() →
     override.active = false,
     но telemetryLocked остаётся true →
       heading hold, model продолжает лететь по прямой
```

---

## 7. Серверная часть (Express)

Приложение запускается как Express-сервер на порту 3410 (pm2: `pilot-3d-pfd`):

| Путь                    | Назначение                              |
|-------------------------|-----------------------------------------|
| `GET /`                 | Отдаёт `dist/index.html`                |
| `/events/pfd`           | SSE-stream с PFD-данными (UDP bridge)   |
| `/api/source/status`    | Статус UDP-источника                    |
| `/api/simulator/config` | Конфигурация симулятора                 |
| `/api/simulator/control`| POST управление симулятором (клавиатура)|
| `/api/simulator/profiles`| Профили симулятора                     |
| `/api/simulator/status` | Статус симулятора                       |
| `/api/recordings`       | Список записей                          |
| `/api/capture/status`   | Статус захвата телеметрии               |

---

## 8. Файловая структура

```
src/
├── main.tsx                    ← точка входа, StrictMode + boot screen bridge
├── App.tsx                     ← ядро: роутинг, frame, data modes, хуки
├── App.css / index.css         ← стили (Tailwind v4)
├── types.ts                    ← TelemetryFrame и типы
├── telemetryRef.ts             ← глобальный telemetryRef
├── aircraftControlsRef.ts      ← глобальный aircraftControlsRef
├── sample-data.ts              ← sample-кадры телеметрии
├── ui-settings.ts              ← настройки UI
├── context/
│   └── TelemetryContext.tsx     ← React Context для TelemetryProvider
├── hooks/
│   └── useTouchDrag.ts         ← хук сенсорного перетаскивания
├── components/
│   ├── Controls/
│   │   ├── TouchControls.tsx    ← сенсорное управление (джойстики)
│   │   ├── Joystick.tsx         ← сам джойстик
│   │   ├── RudderSlider.tsx     ← рыскание
│   │   └── ThrottleJoystick.tsx ← газ
│   ├── PFD/                    ← классический PFD (5 приборов)
│   ├── Instruments/            ← все регистрируемые приборы
│   │   └── aircraft3d/         ← Three.js 3D самолёт
│   ├── PanelKit/               ← drag-n-drop конструктор панелей
│   └── PanelBuilder/           ← обёртка PanelKit + AviationWidget
├── map/                        ← окно Карты тайлов (v2.14.0)
│   ├── MapApp.tsx              ← Leaflet-карта: слои тайлов, маркер, вектор, компас
│   ├── main.tsx                ← точка входа окна Карты
│   ├── mapProtocol.ts          ← контракт MapStatePacket + tileBounds
│   └── useMapBroadcaster.ts    ← хук трансляции состояния сцены → BroadcastChannel
└── index.html / boot-screen.html

bridge/
├── capture.ts                  ← Capture + blackbox manager (extracted 2026-06-12, P0-2)
├── sse-publisher.ts            ← SSE clients/handlers/broadcast (extracted 2026-06-12, P0-2)
├── udp-listener.ts
├── raw-monitor.ts
├── simulator-integration.ts
└── http-api.ts                 ← HTTP routes /api/* (status, source, capture, recordings, simulator stubs, panels etc.) extracted 2026-06-12
```

---

## 9. Принципы

1. **telemetryRef — единый источник истины.** И sample, и live, и manual пишут в один ref. Компоненты (AircraftModel) читают из него напрямую, минуя React state.
2. **React state (frame) — только для рендера.** Приборы получают frame пропом. Обновляется через setFrame() из всех режимов.
3. **Manual mode навсегда.** Первое касание джойстика → telemetryLocked, которое не сбрасывается. Возврат к sample/live — перезагрузка страницы.
4. **Heading hold.** При отпускании джойстика самолёт продолжает лететь по последнему курсу без возврата к телеметрии.
5. **Хуки React — строго безусловные.** Все useRef/useEffect должны быть на одном уровне, до любых условных return. Нарушение → «Rendered more hooks than during the previous render».

**Обновление 2026-06-12:** В рамках P0-2 рефакторинга добавлены все 7 модулей `bridge/*` (capture, sse-publisher, udp-listener, raw-monitor, simulator-integration, http-api). Сервер dev-режима (http://localhost:3410/) запущен и работает (UDP listeners активны, middleware делегирован). Прогресс в roadmap + README.

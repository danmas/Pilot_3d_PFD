# Pilot 3D PFD — UDP bridge + PFD + viewer + raw monitor (merged)

Единый проект: UDP-bridge (tnparserrt), диагностический viewer, Primary Flight Display, Raw Data Monitor. Один `npm run dev` — всё на порту 3410.

## Что внутри

| Компонент | URL | Описание |
|---|---|---|
| **PFD (КПИ)** | `http://localhost:3410/` | React PFD: авиагоризонт, ленты скорости/высоты, вариометр |
|| **Panel Builder** | Hub → «Panel Builder» | Конструктор приборной панели: drag-and-drop из сайдбара и между ячейками, split, save/load |
| **Viewer (диагностика)** | `http://localhost:3410/viewer/` | Live/replay, capture, отладка telemetry-frame.v1 |
| **Raw Data Monitor** | `http://localhost:3410/raw` | Мониторинг сырых UDP-пакетов с любого порта (14442/14443), hex+decoded, piggyback-режим |
| **Bridge (UDP → HTTP)** | порт 14443 → 3410 | Слушает UDP, декодирует полный набор параметров (132 поля), раздаёт SSE/API |
| **Flight Simulator** | PFD → Live → Simulator | Серверный симулятор полёта, запись telemetry + blackbox, scripted test profiles |
| **3D Aircraft + Terrain** | Hub → «3D Aircraft» → 🏔 | 3D-визуализация самолёта + реальный ландшафт из Mapbox (Terrain-RGB + Satellite), 6 пресетов, geocoding |

## Архитектура

```text
UDP 14443 (tnparserrt, полный поток 132 слота) ─┐
FlightSimulator.step(0.04), 25 Hz ──────────────┤
  → bridge (middleware в Vite)                    ←┘
  → decoding.ts: загрузка out.json, сопоставление по ARINC param
  → плоский TelemetryFrame (telemetry-frame.v1)
  → SSE /events (telemetry-frame.v1)
  → SSE /events/pfd (PFD subset)
  → SSE /events/raw (raw-frame — сырые данные)
  → capture *.pfdrec + simulator *_sim_blackbox.pfdrec
  → HTTP API /api/*
  → React PFD app (port 3410)
  → diagnostic viewer /viewer/
  → Raw Data Monitor /raw
```

Всё в одном процессе Vite dev-server. Никакого proxy, никакого CORS.

## Единый каталог параметров (field-catalog.ts)

Файл **`field-catalog.ts`** — справочник метаданных для 132 телеметрических параметров:

- **Канонические английские ключи** (напр. `RadioAltitude`, `MagneticHeading`, `NormalG`) — используются в качестве имён полей в `TelemetryFrame`
- **Русские комментарии** из `out.json` сохранены
- **ARINC-параметры** (0164, 0202, ...)
- **Типы данных** (Float, Short, Int16)
- **Группы систем**: АВИОНИКА, ДВИГАТЕЛИ, ТОПЛИВО, ШАССИ, ВСУ, КСКВ, БРУ, КСУ, STATUS, TEMP, IG, СТАТИКА

> **Важно:** порядок байт в бинарном потоке НЕ определяется `field-catalog.ts`.
> Единственный источник порядка байт — **`out.json`** (читается модулем `decoding.ts` при старте).
> Сопоставление слотов с каталогом — по ARINC param, а не по индексу.
> Подробнее — [KB/README_decoding.md](./KB/README_decoding.md).

### Расчётные поля (dec_ префикс)

Поля с префиксом `dec_` вычисляются после декодирования функцией `applyDecFormulas()` в `decoding.ts`:

| Ключ | Формула | Назначение |
|------|---------|------------|
| `dec_BaroAltFt` | `BaroAltitude × 3.28084` | Барометрическая высота в футах |
| `dec_RadioAltFt` | `RadioAltitude × 3.28084` | Радиовысота в футах |
| `dec_MachKnots` | `MachNumber × 661.5` | Скорость в узлах |
| `dec_G` | `NormalG` (алиас) | Перегрузка |

### Переименования ключей (основные)

| Старый ключ | Новый ключ | Комментарий |
|---|---|---|
| `RAltitude` | `RadioAltitude` | Радиовысота |
| `DME_DIST` | `DME_Distance` | Дальность DME |
| `Heading1` | `MagneticHeading` | Магнитный курс |
| `Ny` | `NormalG` | Нормальная перегрузка |
| `Alt_Select` | `SpeedSelect` | **Было ошибочно!** Это заданная скорость |
| `BRUxL/BRUyL` | `FCU_Roll_Left` / `FCU_Pitch_Left` | Блок ручного управления |
| `Interceptor*` | `Spoil_*` | Интерцепторы (спойлеры) |
| `APU` | `APU_Speed` | Обороты ВСУ |
| ... | ... | всего 100+ переименований |

Полная карта: `OLD_TO_NEW_KEY` в `field-catalog.ts`.

## Переменные окружения

Скопировать `.env.example` в `.env`:

```env
PORT=3410                    # порт dev-сервера
UDP_PORT=14443               # UDP порт для tnparserrt (по умолчанию 14443)
# UDP_CONFIG=...\UdpServerConfig.json
# CAPTURE_DIR=captures
# NO_CAPTURE=true
```

## Запуск

```powershell
cd C:\ERV\CARLINK\CARL_AVI\WORK\Pilot\Pilot_3d_PFD
npm install
npm run dev
```

Открыть:
- **PFD**: `http://localhost:3410/` — нажать **Live**
- **Viewer**: `http://localhost:3410/viewer/` — диагностика и replay
- **Raw Monitor**: `http://localhost:3410/raw` — сырые UDP-пакеты

## Два режима данных (PFD)

| Режим | Источник | Описание |
|---|---|---|
| **Sample** | `sample-data.ts` | Анимированная симуляция для разработки без UDP |
| **Live / UDP** | SSE `/events/pfd` (bridge) | Реальные данные с tnparserrt |
| **Live / Simulator** | `FlightSimulator` на сервере | Управляемая симуляция через тот же SSE/capture pipeline |

## UI (PFD)

- **Sample / Live** — переключатель источника данных
- **Display / Data** — PFD визуализация или сырой JSON
- **Индикатор соединения** (Live): 🔴 disconnected / 🟡 connecting, waiting / 🟢 receiving + seq
- **Upload JSON** — загрузить одиночный telemetry-frame.v1 кадр
- **Play / Pause** (Sample) — управление анимацией
- **Backend Source Mode** (Live) — переключение UDP Stream / Simulator
- **Simulator controls** — WASD/стрелки, Q/E, Shift/Ctrl, Space/R
- **Scripted Profiles** — offline-прогоны профилей с выбором initial conditions и генерацией telemetry + blackbox JSONL

## Flight Simulator и blackbox

Симулятор реализован на сервере в `simulator.ts` и запускается из `bridge-plugin.ts` с фиксированным шагом `0.04 s` (`25 Hz`). Кадры симулятора проходят через тот же `publishDecodedFrame()` / `applyDecFormulas()` / SSE / capture pipeline, что и реальные UDP-данные.

Для анализа модели есть отдельный blackbox-формат `sim-blackbox.v1`: действия пилота, сглаженные controls, internal state FDM, силы/коэффициенты (`Cl`, `Cd`, `lift`, `drag`, `thrust`) и ускорения. При ручной симуляции рядом с обычным `*.pfdrec` создаётся `*_sim_blackbox.pfdrec`.

Scripted profiles запускаются из UI (`Live` → `Scripted Profiles`) или через API. Они выполняются offline на отдельном экземпляре `FlightSimulator` и не трогают текущий live-полёт. В UI после запуска созданный telemetry-файл сразу открывается как Replay: приборы переходят на начальный кадр профиля и проигрывают весь сценарий.

Профили:

| Профиль | Смысл |
|---|---|
| `trim_hold_60s` | Нейтральные controls, проверка trim/drift |
| `pitch_step_up` | 5 секунд pitch `+1`, затем neutral |
| `pitch_step_down` | 5 секунд pitch `-1`, затем neutral |
| `roll_command_step` | 3 секунды full-right roll command, затем neutral |
| `throttle_step` | throttle `0.6 -> 1.0` |
| `combined_maneuver` | Комбинированный pitch/roll/rudder/throttle сценарий |

Initial presets:

| Preset | Условия |
|---|---|
| `cruise_10000_250` | `10000 ft`, `250 kt`, `throttle 0.6`, `pitch 3°` |
| `low_speed_3000_160` | `3000 ft`, `160 kt`, `throttle 0.55`, `pitch 5°` |
| `high_altitude_25000_250` | `25000 ft`, `250 kt`, `throttle 0.72`, `pitch 4°` |
| `approach_1500_140` | `1500 ft`, `140 kt`, `throttle 0.5`, `pitch 4°` |

Подробно: [KB/README_flight_physics.md](./KB/README_flight_physics.md).

**FDM телеметрия (v2.8.8+):** Симулятор публикует 28 полей в `TelemetryFrame`:
- Положение: `PitchAngle`, `RollAngle`, `MagneticHeading`
- Скорости: `CAS` (kt), `TAS` (kt), `Vy` (fpm), `MachNumber`
- Высоты: `dec_BaroAltFt`, `dec_RadioAltFt`
- Управление: `FCU_Roll_Left`, `FCU_Pitch_Left`, `RudderPosition`
- Двигатели: `N1_Actual`, `N2_Actual` (N1 idle = 20%), `EGT` (от газа)
- Аэродинамика: `AoA`, `NormalG`, угловые скорости
- Координаты: `Latitude`, `Longitude`, `TrueHeading`

**Подключаемые модели (pluggable FDM):** [KB/README_pluggable_fdm.md](./KB/README_pluggable_fdm.md).
Архитектурный анализ проведён, спецификация готова. Реализация отложена — текущая модель работает стабильно.

## Panel Builder

Конструктор компоновки приборов (Hub → «Panel Builder»). Подробнее — [src/components/PanelKit/README_PantlKit.md](./src/components/PanelKit/README_PantlKit.md).

### Drag-and-drop между ячейками

Начиная с **v2.8.5**, приборы можно перетаскивать не только из сайдбара на холст, но и **между ячейками панели** (move-семантика: исходная ячейка очищается). Работает на десктопе (HTML5 DnD) и на тач-устройствах.

Исключение: 3D Aircraft (`Aircraft3DInstrument`) не участвует в drag-n-drop между ячейками (v2.8.6) — мышь занята вращением сцены.

### Конфигурация панели

| Файл | Назначение |
|------|------------|
| `panel-config-current.json` | Текущая компоновка (автосохранение через API) |
| `panel-menu.json` | Пункты контекстного меню «···» на каждой ячейке панели |

### Меню команд панели (`panel-menu.json`)

При наведении на ячейку панели (hover) в правом верхнем углу появляются кнопки управления, включая **«···»** — выпадающее меню команд. Состав меню задаётся в `panel-menu.json`:

```json
{
  "items": [
    { "type": "item", "label": "UDP Source...", "action": "openUdpDialog" },
    { "type": "separator" },
    { "type": "item", "label": "Save Configuration...", "action": "saveConfig" },
    { "type": "item", "label": "Load Configuration...", "action": "loadConfig" }
  ]
}
```

| Поле | Описание |
|------|----------|
| `type: "item"` | Кликабельный пункт меню |
| `type: "separator"` | Горизонтальный разделитель |
| `label` | Текст пункта |
| `action` | Идентификатор действия (реализован в коде) |

**Доступные action:**

| action | Действие |
|--------|----------|
| `openUdpDialog` | Диалог настройки UDP host/port |
| `saveConfig` | Сохранить компоновку в файл (Save as) |
| `loadConfig` | Загрузить компоновку из файла |
| `saveCurrentConfig` | Сохранить в `panel-config-current.json` без диалога |

Меню одинаково на всех ячейках, не зависит от контекста. После изменения `panel-menu.json` — перезагрузить страницу.

## Tooltips (всплывающие подсказки)

При наведении курсора на элементы PFD отображается tooltip с описанием индикатора и JSON-путём к источнику данных:

| Компонент | Индикатор | Источник (канонический ключ) |
|---|---|---|
| **AttitudeIndicator** | Авиагоризонт | `PitchAngle, RollAngle` |
| | Шкала крена | `RollAngle` |
| | Указатель крена + скольжение | `RollAngle` |
| | Flight Director | `FD_PitchCmd, FD_RollCmd` |
| | Радиовысотомер | `dec_RadioAltFt` |
| **AirspeedTape** | Лента скорости | `CAS` |
| | Заданная скорость | `SpeedSelect` |
| | Текущая скорость + тренд | `CAS` |
| **AltitudeTape** | Лента высоты | `dec_BaroAltFt, dec_RadioAltFt` |
| | Заданная высота | `StandardAltitude` |
| | Текущая высота | `dec_BaroAltFt` |
| **VerticalSpeed** | Вариометр | `Vy` |
| | Нулевая верт. скорость | `Vy` |
| **AoATape** | Угол атаки | `AoA` |
| | Текущий AoA | `AoA` |
| | Перегрузка G | `dec_G` |

## Контракт данных

Формат: `telemetry-frame.v1` (JSON). Схема:

```text
pfd-frame.v1.schema.json
```

Плоский словарь — все поля на верхнем уровне `TelemetryFrame` (без вложенных объектов).
Каждый ключ — каноническое имя из `field-catalog.ts`.

## HTTP API (bridge)

```text
GET  /api/status
GET  /api/live/current
GET  /api/capture/status
POST /api/capture/start
POST /api/capture/stop
GET  /api/recordings
GET  /api/recordings/:id/meta
GET  /api/recordings/:id/frame?timeMs=...
GET  /api/recordings/:id/range?fromMs=...&toMs=...&limit=...
GET  /events                 (SSE telemetry-frame.v1)
GET  /events/pfd             (SSE PFD subset)
GET  /events/raw             (SSE raw-frame — сырые данные)
GET  /api/raw/status
POST /api/raw/start           { port, config? }
POST /api/raw/stop
GET  /api/pfd/status
GET  /api/pfd/current
GET  /api/pfd/recordings/:id/meta
GET  /api/pfd/recordings/:id/frame?timeMs=...
GET  /api/pfd/recordings/:id/range?fromMs=...&toMs=...&limit=...
GET  /api/source/status
POST /api/source/config          { host, port }
GET  /api/simulator/status
POST /api/simulator/mode         { mode: "udp" | "simulator" }
GET  /api/simulator/config
POST /api/simulator/config       { altitudeFt, casKt, throttle, pitchDeg }
POST /api/simulator/control      { roll, pitch, rudder, throttle, pilot? }
POST /api/simulator/reset
GET  /api/simulator/blackbox/status
GET  /api/simulator/profiles
GET  /api/simulator/profile-presets
POST /api/simulator/profile/run  { profileId, presetId?, initialConfig? }
GET  /api/panel/config/current
PUT  /api/panel/config/current   PanelNode JSON
GET  /api/panel/menu             panel-menu.json
```

### Raw Data Monitor API

**Запуск мониторинга:**
```http
POST /api/raw/start
Content-Type: application/json

{ "port": 14442, "config": "path/to/UdpServerConfig.json" }
```
- `port` — UDP-порт для мониторинга (14442, 14443 или любой другой)
- `config` (опционально) — путь к конфигу с кастомной схемой декодирования
- Если `port` совпадает с портом бриджа (14443), включается **piggyback-режим** — данные берутся из pipeline бриджа без открытия второго сокета

**SSE поток сырых данных:**
```text
GET /events/raw
event: raw-frame    → { decoded: {...все поля...}, hex: "...", receivedAt: "..." }
event: status       → { port, active, receivedPackets, receivedFrames, ... }
```

## Структура файлов

| Файл | Роль |
|------|------|
| `out.json` (..) | Конфигурация tnparserrt: слоты по портам. **Единственный источник порядка байт.** |
| `field-catalog.ts` | Справочник имён, типов, ARINC param. **НЕ раскладка, НЕ порядок.** |
| `decoding.ts` | Загрузка out.json, сопоставление по ARINC param, декодирование, `dec_*` формулы, валидация |
| `simulator.ts` | Серверный FDM для PFD, telemetry payload и blackbox snapshot |
| `bridge-plugin.ts` | Vite-плагин: UDP-сокет (14443), симулятор, SSE, capture, blackbox, replay API |
| `panel-config-current.json` | Текущая компоновка Panel Builder (автосохранение) |
| `panel-menu.json` | Конфигурация меню «···» в Panel Builder |
| `src/types.ts` | `TelemetryFrame` тип для фронтенда |

## Порт по умолчанию: 14443

| Порт | Назначение | Потребитель |
|------|-----------|-------------|
| 14442 | Полный поток (исходный) | FTI.Monitor (WPF) |
| **14443** | **Полный поток (зеркало) — ПО УМОЛЧАНИЮ** | **Pilot_3d_PFD bridge** |
| 14444 | Компактный AVIONICS (9 полей) | Устарел, не используется |

Настройка: `UDP_PORT` в `.env` или `BridgeOptions.udpPort`.

---

## Мобильные джойстики (Touch Controls) для 3D Aircraft

В компоненте **3D Aircraft** (`Aircraft3DInstrument`) добавлено сенсорное управление для планшетов и телефонов.

### Как это работает

Touch Controls отображаются всегда (нет условия `window.innerWidth < 1024`):

| Элемент | Расположение | Оси | Диапазон |
|---------|-------------|-----|----------|
| **Joystick** (джойстик) | Слева внизу | X → **Roll** (крен), Y → **Pitch** (тангаж) | ±60° roll, ±45° pitch |
| **RudderSlider** (педали) | Справа внизу | Y → **Yaw** (рыскание/курс) | ±90° |

При отпускании — значения сбрасываются в 0 (нейтраль).

### Архитектура

```
Joystick.tsx + RudderSlider.tsx
        ↓ (запись)
aircraftControlsRef.ts  ← module-level ref { active, pitch, roll, yaw }
        ↓ (чтение)
AircraftModel.tsx → useFrame() проверяет override.active
```

- `aircraftControlsRef.ts` — общий модуль с ref'ом `{ active: false, pitch: 0, roll: 0, yaw: 0, throttle: 0 }`
- `Joystick.tsx` — 140px круглый джойстик, touch + mouse drag от центра
- `RudderSlider.tsx` — 36×200px вертикальный слайдер, touch + mouse drag
- **`ThrottleJoystick.tsx`** — РУД (красный столбик), touch + mouse drag. **v2.8.10:** всегда вызывает `writeOverride` (не только при изменении газа) — иначе после касания синего джойстика РУД не обновлял `active`, и обороты засыпали.
- `TouchControls.tsx` — overlay `inset-0 z-50 pointer-events-none`
- `AircraftModel.tsx` — в `useFrame()`: если `override.active === true`, берёт pitch/roll/yaw из ref'а вместо телеметрии

### Как добавить новый орган управления

1. Создай компонент (аналог `Joystick.tsx` или `RudderSlider.tsx`)
2. Импортируй `aircraftControlsRef` и пиши значения через `aircraftControlsRef.current = { ... }`
3. Добавь компонент в `TouchControls.tsx`
4. В `AircraftModel.tsx` при необходимости добавь новый параметр в useFrame

### Известные баги (исправленные)

#### ❌ ReferenceError: `f is not defined` — чёрный экран на мобильных

**Проблема:** В исходном `useFrame` переменная `f` (телеметрия) была объявлена через `const` внутри блока `else`, но использовалась ниже вне этого блока для интеграции позиции самолёта:

```typescript
// ❌ БЫЛО — ReferenceError на мобильных
useFrame((_state, delta) => {
  // ...
  } else {
    const f = telemetryRef.current;  // ← объявлена в else
    if (!f) return;
    pitchDeg = f.PitchAngle;
  }
  // ↓ А используется снаружи — ReferenceError!
  const cas = typeof f.CAS === 'number' ...;
  aircraftPosition.x += ...;
});
```

На мобильных браузерах (особенно Яндекс.Браузер на Android) это вызывало `ReferenceError`, который прекращал выполнение `useFrame` и приводил к чёрному экрану (Three.js не мог завершить рендер кадра).

**Решение:** Вынести `f` в `let` перед if/else:

```typescript
// ✅ СТАЛО — работает везде
useFrame((_state, delta) => {
  let f: typeof telemetryRef.current = null;  // ← объявлена заранее
  // ...
  } else {
    f = telemetryRef.current;  // ← просто присвоение
    if (!f) return;
  }
  if (f) {  // ← безопасная проверка
    const cas = typeof f.CAS === 'number' ...;
    aircraftPosition.x += ...;
  }
});
```

#### ❌ CapsuleGeometry — может не поддерживаться на старых WebGL

Заменена на `CylinderGeometry` + две `SphereGeometry` для фюзеляжа. Сегменты цилиндров уменьшены с 12 до 8 для лёгкости.


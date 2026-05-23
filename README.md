# Pilot 3D PFD — UDP bridge + PFD + viewer + raw monitor (merged)

Единый проект: UDP-bridge (tnparserrt), диагностический viewer, Primary Flight Display, Raw Data Monitor. Один `npm run dev` — всё на порту 3410.

## Что внутри

| Компонент | URL | Описание |
|---|---|---|
| **PFD (КПИ)** | `http://localhost:3410/` | React PFD: авиагоризонт, ленты скорости/высоты, вариометр |
| **Panel Builder** | Hub → «Panel Builder» | Конструктор приборной панели: drag-and-drop, split, save/load |
| **Viewer (диагностика)** | `http://localhost:3410/viewer/` | Live/replay, capture, отладка telemetry-frame.v1 |
| **Raw Data Monitor** | `http://localhost:3410/raw` | Мониторинг сырых UDP-пакетов с любого порта (14442/14443), hex+decoded, piggyback-режим |
| **Bridge (UDP → HTTP)** | порт 14443 → 3410 | Слушает UDP, декодирует полный набор параметров (132 поля), раздаёт SSE/API |

## Архитектура

```text
UDP 14443 (tnparserrt, полный поток 132 слота) ─┐
  → bridge (middleware в Vite)                    ←┘
  → decoding.ts: загрузка out.json, сопоставление по ARINC param
  → плоский TelemetryFrame (telemetry-frame.v1)
  → SSE /events (telemetry-frame.v1)
  → SSE /events/pfd (PFD subset)
  → SSE /events/raw (raw-frame — сырые данные)
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
> Подробнее — [README_decoding.md](./README_decoding.md).

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
| **Live** | SSE `/events/pfd` (bridge) | Реальные данные с tnparserrt |

## UI (PFD)

- **Sample / Live** — переключатель источника данных
- **Display / Data** — PFD визуализация или сырой JSON
- **Индикатор соединения** (Live): 🔴 disconnected / 🟡 connecting, waiting / 🟢 receiving + seq
- **Upload JSON** — загрузить одиночный telemetry-frame.v1 кадр
- **Play / Pause** (Sample) — управление анимацией

## Panel Builder

Конструктор компоновки приборов (Hub → «Panel Builder»). Подробнее — [KB/README_Panel_builder](../KB/README_Panel_builder).

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
| `bridge-plugin.ts` | Vite-плагин: UDP-сокет (14443), сборка фреймов, SSE, capture, replay API |
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

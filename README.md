#+ Pilot 3D PFD — UDP bridge + PFD + viewer + raw monitor (merged)

Единый проект: UDP-bridge (tnparserrt), диагностический viewer, Primary Flight Display, Raw Data Monitor. Один `npm run dev` — всё на порту 3410.

## Что внутри

| Компонент | URL | Описание |
|---|---|---|
| **PFD (КПИ)** | `http://localhost:3410/` | React PFD: авиагоризонт, ленты скорости/высоты, вариометр |
| **Viewer (диагностика)** | `http://localhost:3410/viewer/` | Live/replay, capture, отладка flight-frame.v1 и pfd-frame.v1 |
| **Raw Data Monitor** | `http://localhost:3410/raw` | Мониторинг сырых UDP-пакетов с любого порта (14442/14443/14444), hex+decoded, piggyback-режим |
| **Bridge (UDP → HTTP)** | порт 14444 → 3410 | Слушает UDP, декодирует полный набор параметров (132 поля), раздаёт SSE/API |

## Архитектура

```text
UDP 14442 (tnparserrt, полный набор) ─┐
UDP 14443 (tnparserrt, mirror)       ─┤
UDP 14444 (tnparserrt, базовый PFD)   ─┤
  → bridge (middleware в Vite)        ←┘
  → SSE /events (flight-frame.v1)
  → SSE /events/pfd (pfd-frame.v1)
  → SSE /events/raw (raw-frame — сырые данные)
  → HTTP API /api/*
  → React PFD app (port 3410)
  → diagnostic viewer /viewer/
  → Raw Data Monitor /raw
```

Всё в одном процессе Vite dev-server. Никакого proxy, никакого CORS.

## Единый каталог параметров (field-catalog.ts)

Файл **`field-catalog.ts`** — единственный источник истины для всех 132 телеметрических параметров:

- **Строгий порядок** совпадает с `out.json` (определяет байтовую раскладку бинарного потока)
- **Канонические английские ключи** (напр. `RadioAltitude`, `MagneticHeading`, `NormalG`)
- **Русские комментарии** из `out.json` сохранены
- **ARINC-параметры** (0164, 0202, ...)
- **Типы данных** (Float, Short, Int16)
- **Группы систем**: АВИОНИКА, ДВИГАТЕЛИ, ТОПЛИВО, ШАССИ, ВСУ, КСКВ, БРУ, КСУ, STATUS, TEMP, IG, СТАТИКА

Из каталога автогенерируется:
- `UdpServerConfig.json` (Parameters)
- `AVIONICS_FIELDS` (подмножество для PFD: 9 полей)
- Ключи decoded output для всех потребителей

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
UDP_PORT=14444               # UDP порт для tnparserrt
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

## Два режима данных (PFD)

| Режим | Источник | Описание |
|---|---|---|
| **Sample** | `sample-data.ts` | Анимированная симуляция для разработки без UDP |
| **Live** | SSE `/events/pfd` (bridge) | Реальные данные с tnparserrt |

## UI (PFD)

- **Sample / Live** — переключатель источника данных
- **Display / Data** — PFD визуализация или сырой JSON
- **Индикатор соединения** (Live): 🔴 disconnected / 🟡 connecting, waiting / 🟢 receiving + seq
- **Upload JSON** — загрузить одиночный pfd-frame.v1 кадр
- **Play / Pause** (Sample) — управление анимацией

## Tooltips (всплывающие подсказки)

При наведении курсора на элементы PFD отображается tooltip с описанием индикатора и JSON-путём к источнику данных:

| Компонент | Индикатор | Источник |
|---|---|---|
| **AttitudeIndicator** | Авиагоризонт | `attitude.pitchDeg, attitude.rollDeg` |
| | Шкала крена | `attitude.rollDeg` |
| | Указатель крена + скольжение | `attitude.rollDeg` |
| | Flight Director | `autopilot.fdPitchCmdDeg, autopilot.fdRollCmdDeg` |
| | Радиовысотомер | `altitude.radioAlt` |
| **AirspeedTape** | Лента скорости | `air.cas` |
| | Заданная скорость | `autopilot.selectedSpeed` |
| | Текущая скорость + тренд | `air.cas` |
| **AltitudeTape** | Лента высоты | `altitude.baroAltFt, altitude.radioAlt` |
| | Заданная высота | `autopilot.selectedAltitudeFt` |
| | Текущая высота | `altitude.baroAltFt` |
| **VerticalSpeed** | Вариометр | `altitude.verticalSpeed` |
| | Нулевая верт. скорость | `altitude.verticalSpeed` |
| **AoATape** | Угол атаки | `air.aoaDeg` |
| | Текущий AoA | `air.aoaDeg` |
| | Перегрузка G | `loads.g` |

## Контракт данных

Формат: `pfd-frame.v1` (JSON). Схема:

```text
pfd-frame.v1.schema.json
```

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
GET  /events                 (SSE flight-frame.v1)
GET  /events/pfd             (SSE pfd-frame.v1)
GET  /events/raw             (SSE raw-frame — сырые данные)
GET  /api/raw/status
POST /api/raw/start           { port, config? }
POST /api/raw/stop
GET  /api/pfd/status
GET  /api/pfd/current
GET  /api/pfd/recordings/:id/meta
GET  /api/pfd/recordings/:id/frame?timeMs=...
GET  /api/pfd/recordings/:id/range?fromMs=...&toMs=...&limit=...
```

### Raw Data Monitor API

**Запуск мониторинга:**
```http
POST /api/raw/start
Content-Type: application/json

{ "port": 14442, "config": "path/to/UdpServerConfig.json" }
```
- `port` — UDP-порт для мониторинга (14442, 14443, 14444 или любой другой)
- `config` (опционально) — путь к конфигу с кастомной схемой декодирования
- Если `port` совпадает с портом бриджа (14444), включается **piggyback-режим** — данные берутся из pipeline бриджа без открытия второго сокета

**SSE поток сырых данных:**
```text
GET /events/raw
event: raw-frame    → { decoded: {...все поля...}, hex: "...", receivedAt: "..." }
event: status       → { port, active, receivedPackets, receivedFrames, ... }
```

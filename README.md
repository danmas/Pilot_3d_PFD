# Pilot 3D PFD — UDP bridge + PFD + viewer (merged)

Единый проект: UDP-bridge (tnparserrt), диагностический viewer, Primary Flight Display. Один `npm run dev` — всё на порту 3410.

## Что внутри

| Компонент | URL | Описание |
|---|---|---|
| **PFD (КПИ)** | `http://localhost:3410/` | React PFD: авиагоризонт, ленты скорости/высоты, вариометр |
| **Viewer (диагностика)** | `http://localhost:3410/viewer/` | Live/replay, capture, отладка flight-frame.v1 и pfd-frame.v1 |
| **Bridge (UDP → HTTP)** | порт 14444 → 3410 | Слушает UDP, декодирует AVIONICS, раздаёт SSE/API |

## Архитектура

```text
UDP 14444 (tnparserrt)
  → bridge (middleware в Vite)
  → SSE /events (flight-frame.v1)
  → SSE /events/pfd (pfd-frame.v1)
  → HTTP API /api/*
  → React PFD app (port 3410)
  → diagnostic viewer /viewer/
```

Всё в одном процессе Vite dev-server. Никакого proxy, никакого CORS.

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
GET  /api/pfd/status
GET  /api/pfd/current
GET  /api/pfd/recordings/:id/meta
GET  /api/pfd/recordings/:id/frame?timeMs=...
GET  /api/pfd/recordings/:id/range?fromMs=...&toMs=...&limit=...
```

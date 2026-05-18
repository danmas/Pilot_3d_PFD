# Pilot 3D PFD — Приборная панель (КПИ)

Визуализация Primary Flight Display по контракту `pfd-frame.v1`. Принимает данные от `3d:fly` через SSE.

## Два режима данных

| Режим | Источник | Описание |
|---|---|---|
| **Sample** | `sample-data.ts` | Анимированная симуляция (тангаж, крен, скорость, высота) — для демонстрации и разработки без живого потока |
| **Live** | SSE `/events/pfd` от `3d:fly` | Реальные данные `pfd-frame.v1` с UDP-потока `tnparserrt` на порту 14444 |

## Архитектура

```text
3d/server.ts (port 17333)
  → SSE /events/pfd (pfd-frame.v1)
  → Vite proxy (port 3410)
  → Pilot_3d_PFD browser page
```

Pilot_3d_PFD не подключается к `17333` напрямую — Vite dev-server проксирует `/events/pfd` и `/api/pfd` на `http://127.0.0.1:17333`, поэтому браузер видит same-origin запросы (без CORS).

## Переменные окружения

Скопировать `.env.example` в `.env`:

```
PORT=3410
```

## Запуск

**Требуется:** сначала должен быть запущен `3d:fly` (основной bridge/viewer на порту 17333).

```powershell
# Терминал 1 — основной процесс
cd C:\ERV\CARLINK\CARL_AVI\WORK\Pilot
npm run 3d:fly -- --no-capture

# Терминал 2 — PFD страница
cd C:\ERV\CARLINK\CARL_AVI\WORK\Pilot\Pilot_3d_PFD
npm install
npm run dev
```

Открыть `http://localhost:3410`, нажать кнопку **Live** в header'е.

## UI

- **Sample / Live** — переключатель источника данных
- **Display / Data** — переключение между визуализацией PFD и сырым JSON
- **Индикатор соединения** (только в Live):
  - 🔴 disconnected
  - 🟡 connecting / waiting UDP
  - 🟢 receiving UDP (с номером seq кадра)
- **Upload JSON** — загрузить одиночный `pfd-frame.v1` кадр из файла
- **Play / Pause** (только в Sample) — управление анимацией

## Контракт данных

Формат: `pfd-frame.v1` (JSON). Спецификация и схема:

```text
..\3d\pfd-frame.v1.schema.json
..\KB\README_3d_fly_PFD_spec
```

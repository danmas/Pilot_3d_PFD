# Terrain Proxy: серверный кэш Mapbox

**Дата:** 2026-06-11
**Статус:** Реализовано ✅
**Автор:** Hermes Agent
**Назначение:** Документация серверного прокси для terrain тайлов Mapbox
**Актуализация:** 2026-06-11

---

## Обзор

Два серверных файла:

| Файл | Порт | Режим | Назначение |
|------|------|-------|------------|
| `server/server.js` | 3410 | production (pm2) | Единый сервер: статика dist/ + terrain API + WebSocket + SPA fallback |
| `server/terrain-proxy.js` | 3409 | development (npm run dev) | Отдельный прокси для Vite dev server + WebSocket |

В production `server.js` заменяет Vite и terrain-proxy одним процессом.
В development `npm run dev` запускает только Vite, а `terrain-proxy.js` запускается отдельно.

### Development setup

```bash
# 1. Запустить terrain-proxy на порту 3409 (отдельный терминал)
node server/terrain-proxy.js

# 2. Vite проксирует /api/terrain/* → http://localhost:3409
#    и /ws/terrain → ws://localhost:3409
#    Настроено в vite.config.ts:
#      proxy: {
#        '/api/terrain': { target: 'http://localhost:3409' },
#        '/ws/terrain': { target: 'ws://localhost:3409', ws: true }
#      }

# 3. npm run dev — Vite на 3410, проксирует terrain-запросы на 3409
npm run dev
```

**Важно:** terrain-proxy читает токен из `.env` (не `.env.local`). Токен должен быть в обоих файлах.

## Файл

`server/server.js` (ESM, запускается `node server/server.js`)

### Запуск

```bash
# pm2 (production)
pm2 start ecosystem.config.cjs

# Вручную
node server/server.js

# Перезапуск после изменений
pm2 restart pilot-3d-pfd
```

## Алгоритм работы

```
GET /api/terrain/tile/:z/:x/:y?type=dem|sat
  │
  ├─ 1. Парсинг параметров
  │     z, x, y — координаты тайла
  │     type — 'dem' (высоты) или 'sat' (спутник)
  │
  ├─ 2. Валидация
  │     type ∈ {dem, sat}
  │     z, x, y — числа
  │     если нет → 400 Bad Request
  │
  ├─ 3. Проверка дискового кэша
  │     Путь: cache/terrain/{z}/{x}/{y}-{type}.{png|webp}
  │     Если файл существует:
  │       → 200 + X-Cache: HIT + sendFile
  │     Если нет:
  │       → продолжаем
  │
  ├─ 4. Проверка квоты
  │     quota.total >= 45000? (50k лимит - 10% буфер)
  │       да → 429 Too Many Requests
  │       нет → продолжаем
  │
  ├─ 5. Запрос к Mapbox API
  │     DEM:  https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=...
  │     SAT:  https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.jpg90?access_token=...
  │     Timeout: 10 секунд (AbortSignal.timeout(10000))
  │
  │     ┌─ 5a. Успех (200)
  │     │   → Сохранить в кэш: fs.writeFileSync(cached, buffer)
  │     │   → incrementQuota(type)
  │     │   → 200 + X-Cache: MISS + buffer
  │     │
  │     └─ 5b. Ошибка Mapbox (4xx/5xx)
  │         → проксируем статус ошибки
  │
  │     ┌─ 5c. Timeout (>10s)
  │     │   → 504 Gateway Timeout
  │     │
  │     └─ 5d. Другая ошибка
  │         → 502 Bad Gateway
```

## Структура кэша на диске

```
cache/
  terrain/
    14/                          # zoom level
      9894/                      # x coordinate
        5104-dem.png             # y-coordinate + type
        5104-sat.webp
        5105-dem.png
      9895/
        5104-dem.png
        ...
    13/
      ...
  terrain-quota.json             # файл квоты
```

Формат кэш-файла:
- `{z}/{x}/{y}-dem.png` — DEM тайлы (Terrain-RGB PNG)
- `{z}/{x}/{y}-sat.webp` — спутниковые тайлы (WebP, от Mapbox как JPEG)

## Обработка ошибок

| Ситуация | HTTP Status | Ответ |
|----------|-------------|-------|
| Неверный type | 400 | `{ error: 'Invalid type' }` |
| Неверные координаты | 400 | `{ error: 'Invalid coords' }` |
| Превышение квоты | 429 | `{ error: 'Quota near limit', quota: { used, limit } }` |
| Mapbox вернул ошибку | копия статуса | `{ error: 'Mapbox: {status}' }` |
| Таймаут Mapbox | 504 | `{ error: 'Mapbox timeout' }` |
| Другая ошибка | 502 | `{ error: 'Upstream failed' }` |

## CORS

```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

## Заголовки ответа

| Заголовок | Значение | Описание |
|-----------|----------|----------|
| `Content-Type` | `image/png` / `image/jpeg` | Тип контента |
| `X-Cache` | `HIT` / `MISS` | Результат кэширования |

## pm2 конфигурация

`ecosystem.config.cjs`:
```javascript
module.exports = {
  apps: [{
    name: 'pilot-3d-pfd',
    cwd: '/root/projects-ex/Pilot_3d_PFD',
    script: 'node',
    args: 'server/server.js',
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 3000,
  }]
};
```

## Связь с frontend

### Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/api/terrain/tile/:z/:x/:y?type=dem\|sat` | Прокси-тайл |
| GET | `/api/terrain/quota` | Статистика квоты |
| GET | `/api/terrain/logs?limit=N` | Последние N записей лога (макс 500) |
| WS | `/ws/terrain` | Бинарный WebSocket для батчевой загрузки тайлов |

### Лог загрузок

Каждый запрос тайла пишется в `cache/terrain/access.log` (JSON lines):
```json
{"t":"2026-06-11T...","coord":{"z":14,"x":8506,"y":5838},"type":"sat","status":"HIT","quotaTotal":51}
```

Статусы: `HIT` (кэш), `MISS` (загружен из Mapbox), `TIMEOUT`, `ERROR`, `QUOTA_EXCEEDED`.

Клиентский `TerrainLogPanel.tsx` показывает лог через `GET /api/terrain/logs?limit=40`.

### URL-схема
```typescript
// DEM тайл через наш proxy
function terrainRgbUrl(token, z, x, y): string {
  return `/api/terrain/tile/${z}/${x}/${y}?type=dem`;
}

// Satellite тайл через наш proxy
function satelliteUrl(token, z, x, y): string {
  return `/api/terrain/tile/${z}/${x}/${y}?type=sat`;
}
```

Токен Mapbox **не передаётся клиенту** — он живёт только на сервере в `.env`.

## WebSocket-протокол

Бинарный формат запроса/ответа между клиентом и сервером.

**Запрос клиента → сервер:**
```
[reqId: 4 bytes uint32 BE]
[count: 2 bytes uint16 BE]
count * [z: 1 byte][x: 4 bytes uint32 BE][y: 4 bytes uint32 BE][type: 1 byte]
```
`type`: `0` — DEM, `1` — SAT.

**Ответ сервера → клиент (по одному фрейму на тайл):**
```
[reqId: 4 bytes uint32 BE]
[z: 1 byte][x: 4 bytes uint32 BE][y: 4 bytes uint32 BE][type: 1 byte]
[payloadLen: 4 bytes uint32 BE]
[payload: payloadLen bytes]
```
`payloadLen === 0` означает ошибку или отсутствие тайла.

Реализация: [`server/terrain-ws.js`](../server/terrain-ws.js) и [`TerrainWebSocketClient.ts`](../src/components/Instruments/aircraft3d/terrain/TerrainWebSocketClient.ts).

## Тестирование

```bash
# Проверить что сервер жив
curl http://localhost:3410/api/terrain/quota

# Получить DEM тайл (14/9894/5104 — Альпы, Монблан)
curl http://localhost:3410/api/terrain/tile/14/9894/5104?type=dem -o test-dem.png

# Получить satellite тайл
curl http://localhost:3410/api/terrain/tile/14/9894/5104?type=sat -o test-sat.jpg

# Проверить X-Cache заголовки
curl -v http://localhost:3410/api/terrain/tile/14/9894/5104?type=dem 2>&1 | grep X-Cache
```

---

## Связанная документация

- [README_plan_real_terrain.md](./README_plan_real_terrain.md) — Общая архитектура terrain
- [README_terrain_quota.md](./README_terrain_quota.md) — Система квот Mapbox
- [README_aircraft3d_scene.md](./README_aircraft3d_scene.md) — Сцена Aircraft 3D

# Terrain Proxy: серверный кэш Mapbox

**Дата:** 2026-06-10
**Статус:** Реализовано ✅
**Автор:** Hermes Agent
**Назначение:** Документация серверного прокси для terrain тайлов Mapbox
**Актуализация:** 2026-06-10

---

## Обзор

`server.js` — единый Express сервер, который:
1. Раздаёт статику из `dist/` (SPA fallback)
2. Проксирует запросы к Mapbox API с дисковым кэшированием
3. Считает квоту запросов к Mapbox

Заменяет предыдущую связку `serve dist -l 3410` + отдельный terrain-proxy.

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

Клиентский `terrainTileUtils.ts` генерирует URL:
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

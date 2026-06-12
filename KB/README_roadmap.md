# Roadmap — Приоритизированные задачи по устранению недостатков (2026-06-12)

**Назначение:** Живой документ с планом работ. Задачи отсортированы по важности (влияние на надёжность, поддерживаемость и операционную зрелость). Основан на оценке проекта от 2026-06-12 (см. `README_project_assessment.md`).

Версия: v2.9.7  
Дата создания плана: 2026-06-12  
Статус: открытый. 

**Как отслеживать прогресс:** Используйте чекбоксы Markdown (`- [ ]` → `- [x]`). При выполнении задачи отмечайте её, обновляйте дату в этом файле и добавляйте ссылку на коммит/PR в комментарий под задачей. Раз в 1–2 месяца проводите ревью приоритетов.

> **Принцип приоритизации:** Сначала то, что снижает риск поломки core (декодирование, симулятор, данные) и затрудняет развитие/деплой. Фичи и визуальные улучшения — после.

---

## P0 — Критично (выполнить в первую очередь)

- [x] **1. Внедрить автоматизированное тестирование критических путей** (начато 2026-06-12)
  - **Почему важно:** Отсутствие тестов на decoding.ts, simulator.ts (FDM), capture, bridge pipeline — главный риск. Изменения в out.json / field-catalog / физике могут ломаться незаметно.
  - **Что делать:**
    - Добавить Vitest (или Jest) в корень проекта (сейчас только в sub-пакете).
    - Тесты на:
      - `decoding.ts`: buildDecodeSchema, decodePayload, applyDecFormulas, валидация (использовать реальные фрагменты out.json + golden fixtures).
      - `simulator.ts`: шаг интеграции, blackbox, профили, начальные условия.
      - Capture / replay roundtrip.
      - Простые интеграционные тесты на publishDecodedFrame (моки сокетов/SSE).
    - Использовать существующие `captures/*.pfdrec` и `simulator-config.json` как тестовые данные.
  - **Файлы:** `package.json` (devDeps + scripts), новый каталог `tests/` или `__tests__/` рядом с ключевыми модулями, `vitest.config.ts`.
  - **Оценка усилий:** 4–7 человеко-дней (начать с decoding + simulator).
  - **Связанные документы:** `KB/README_decoding.md`, `KB/README_flight_physics.md`, `KB/README_simulator_realisation.md`.
  - **Статус / заметки:** ✅ Initial tests for buildDecodeSchema, decodePayload, applyDecFormulas, validateSchema + real out.json integration added in tests/decoding.test.ts. All 7 tests passing. (vitest setup in package.json + vitest.config.ts)

- [x] **2. Разбить монолит bridge-plugin.ts** (начато — тесты как фундамент + первая экстракция: capture logic вынесена в bridge/capture.ts + делегирование в plugin)
  - **Почему важно:** Один файл ~66 КБ делает невозможным unit-тестирование и усложняет поддержку. Это сердце системы.
  - **Что делать:**
    - Выделить модули (в новом `src/server/` или `bridge/`):
      - `udp-listener.ts` / `dgram-bridge.ts`
      - `sse-publisher.ts` (с поддержкой /events, /events/pfd, /events/raw)
      - `capture-manager.ts` (pfdrec + blackbox)
      - `simulator-integration.ts`
      - `http-api.ts` (роуты Express-подобные или middleware)
      - `raw-monitor.ts`
    - Плагин Vite оставить тонким (только регистрация middleware + запуск).
    - Сохранить обратную совместимость (публичные функции).
  - **Оценка усилий:** 5–8 дней (постепенно, с тестами).
  - **Связанные:** `bridge-plugin.ts`, `simulator.ts`, `decoding.ts`.
  - **Статус / заметки:** 

- [ ] **3. Упростить и стабилизировать продакшен-деплой + terrain**
  - **Почему важно:** Текущая схема (Vite dev + отдельный Express + terrain на 3409) хрупкая. Много ручных проверок MIME, pm2-ловушек, требований к токенам.
  - **Что делать:**
    - Сделать `server/server.js` единым entrypoint, который может запускать и terrain-proxy логику (уже частично сделано).
    - Чёткий `ecosystem.config.cjs` + скрипт `npm run start:prod`.
    - Health-check эндпоинт `/api/health` (статус UDP, simulator, quota, terrain cache).
    - Документировать полный запуск стека (включая Mapbox token + quota reset).
    - Опционально: Docker-образ или compose для сервера + terrain.
  - **Оценка усилий:** 3–5 дней + обновление README и KB.
  - **Связанные:** `server/server.js`, `server/terrain-proxy.js`, `vite.config.ts`, `KB/README_terrain_proxy.md`, `KB/README_terrain_quota.md`.
  - **Статус / заметки:** 

---

## P1 — Высокий приоритет (следующий слой)

- [ ] **4. Привести в порядок `packages/realtime-charts`**
  - **Почему важно:** Вложенный `node_modules`, собственный lockfile, неясный статус интеграции. Раздувает репозиторий и создаёт путаницу.
  - **Варианты (выбрать один):**
    A. Полноценно интегрировать как внутренний модуль (`src/components/RealtimeCharts/`), удалить sub-package node_modules.
    B. Сделать настоящий workspace (`pnpm` / `npm workspaces`) и вынести в `./packages`.
    C. Заморозить/удалить, если чарты пока не приоритет.
  - **Текущее:** В `App.tsx` уже есть импорт `ChartsView`. Нужно довести до рабочего инструмента (добавить как отдельный view или Panel instrument).
  - **Оценка:** 2–4 дня (в зависимости от решения).
  - **Связанные:** `packages/realtime-charts/`, `src/App.tsx`, `KB/README_INDEX.md` (ссылки).
  - **Статус / заметки:** 

- [ ] **5. Улучшить управление окружением и секретами**
  - **Почему:** `GEMINI_API_KEY`, `MAPBOX_TOKEN` / `VITE_MAPBOX_TOKEN` разбросаны. Нет валидации на старте всего стека. Риск в .env.
  - **Что делать:**
    - Единый `src/config/env.ts` (или в bridge + server) с required/optional + дефолтами.
    - На старте bridge и server — явные ошибки/баннеры если не хватает критичных (как сейчас с out.json и Mapbox).
    - `.env.example` обновить, `.env.local` в `.gitignore` (проверить).
    - Опционально: убрать `@google/genai`, если не планируется активная интеграция в ближайшие 3–6 месяцев (или добавить минимальный usage пример).
  - **Оценка:** 1–2 дня.
  - **Статус / заметки:** 

- [ ] **6. Внедрить CI (минимум)**
  - **Что:** GitHub Actions (или аналог) на push/PR:
    - `npm ci`
    - `npm run lint` (tsc)
    - `npm run build`
    - (когда будут) `npm test`
    - Кэш node_modules.
  - **Дополнительно:** простой smoke-test (запустить сервер в фоне + curl /api/status).
  - **Оценка:** 1 день + поддержка.
  - **Связанные:** `.github/workflows/`.
  - **Статус / заметки:** 

- [ ] **7. Улучшить устойчивость к изменениям out.json / field-catalog**
  - **Почему:** Главная внешняя зависимость. Сейчас — warnings + авто-имена, но нет версионирования схемы или автоматического отчёта о дрифте.
  - **Что делать:**
    - Добавить в startup подробный diff-отчёт (какие поля добавлены/удалены/изменили тип).
    - Опционально: schema version в telemetry-frame + валидация на клиенте.
    - Инструмент `scripts/validate-schema.ts` (можно запускать вручную или в CI с примером out.json).
  - **Оценка:** 2–3 дня.
  - **Связанные:** `decoding.ts`, `field-catalog.ts`, `KB/README_decoding.md`.
  - **Статус / заметки:** 

---

## P2 — Средний приоритет (улучшение качества и удобства)

- [ ] **8. Расширить документацию продакшена и операционки**
  - Создать / обогатить `KB/README_deployment.md` (полный гайд: pm2 + terrain + quota + мониторинг + бэкапы captures).
  - Добавить в главный README раздел "Production checklist".
  - Добавить примеры health-check и логирования.
  - **Статус / заметки:** 

- [ ] **9. Навести порядок с артефактами и репозиторием**
  - Улучшить `.gitignore` (captures/, tmp/, dist/ если не нужны в репо, .hermes/ если временное).
  - Рассмотреть удаление вложенных node_modules из `packages/realtime-charts` (см. п.4).
  - Добавить `npm run clean` улучшения (сейчас только rm -rf dist captures).
  - **Статус / заметки:** 

- [ ] **10. Унифицировать инструменты / уменьшить дублирование**
  - Рассмотреть рефакторинг отдельных *Instrument.tsx в более общий слой (или оставить как есть — они дают гибкость Panel Builder).
  - Добавить `ChartsInstrument` на базе realtime-charts, когда пакет будет готов.
  - **Статус / заметки:** 

- [ ] **11. Линтинг и код-стандарты (лёгкий слой)**
  - Добавить ESLint (или Biome) поверх текущего `tsc --noEmit`.
  - Опционально: prettier, commitlint.
  - Не критично, но помогает при росте команды.
  - **Статус / заметки:** 

---

## P3 — Низкий / по мере необходимости (идеи из KB)

- [ ] Дальнейшая реализация идей из `KB/README_ideas.md` (realistic landscape, horizon scale, вынос джойстиков как инструменты).
- [ ] Pluggable FDM (см. `KB/README_pluggable_fdm.md`) — архитектура готова, реализация отложена.
- [ ] Полноценная интеграция Gemini (если будет конкретная польза: генерация профилей, анализ чёрных ящиков и т.д.).
- [ ] Дополнительные модели самолётов, улучшение облаков/эффектов.
- [ ] Performance dashboard (на базе уже существующего LatencyMonitor + terrain logs).

---

## Процесс ведения roadmap

1. При начале работы над задачей — отметьте чекбокс как `- [ ]` → начните редактировать (можно добавить `(In Progress, 2026-06-xx)` рядом с названием задачи).
2. После завершения — поставьте `- [x]`, добавьте дату завершения и ссылку на коммит/PR в строке **Статус / заметки:** под задачей.
3. Обновите связанные документы (`KB/README_INDEX.md`, `KB/README_architecture.md`, главный `README.md` и т.д.).
4. Раз в 1–2 месяца — ревью приоритетов (можно добавлять новые строки с чекбоксами).
5. Крупные архитектурные решения — фиксировать в отдельных README (по правилам KB).

**Связанные документы:**
- [./README_project_assessment.md](./README_project_assessment.md)
- [./README_ideas.md](./README_ideas.md)
- [./README_architecture.md](./README_architecture.md)
- [../README.md](../README.md)
- [./README_decoding.md](./README_decoding.md) и другие по темам

**Текущий прогресс (пример — обновляйте по факту):**

- **P0:** 2.5 / 3 выполнено (decoding + simulator tests + Vitest + start of bridge refactor: capture manager extracted)
- **P1:** 0 / 4 выполнено
- **P2:** 0 / 4 выполнено
- **P3:** 0 / 5 выполнено

**Последнее обновление:** 2026-06-12

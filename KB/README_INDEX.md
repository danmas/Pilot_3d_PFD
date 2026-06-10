
# KB README Index — Pilot 3D PFD

**Назначение:** Единая база знаний проекта «Pilot 3D PFD» — телеметрический PFD, 3D-визуализация самолёта, PanelBuilder, реалтайм-чарты и туннели UDP-телеметрии.

Проект: `Pilot_3d_PFD` (ветка `dev_work`)
Сервер: http://87.251.79.241:3410

---

## Содержание

1. [Архитектура](#1-архитектура)
2. [Телеметрия / Парсинг](#2-телеметрия--парсинг)
3. [Физика и 3D-визуализация](#3-физика-и-3d-визуализация)
4. [Приборы и интерфейсы](#4-приборы-и-интерфейсы)
5. [Профили и симулятор](#5-профили-и-симулятор)
6. [Парсеры и реплей-инструменты](#6-парсеры-и-реплей-инструменты)
7. [Инфраструктура и DevOps](#7-инфраструктура-и-devops)
8. [Измерения и производительность](#8-измерения-и-производительность)
9. [Идеи и планы](#9-идеи-и-планы)
10. [Правила ведения KB](#правила-ведения-kb)

---

## 1. Архитектура

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_architecture.md](./README_architecture.md) | Полная архитектура приложения | telemetryRef, data modes (sample/live/manual), компоненты, App.tsx, поток данных, PanelBuilder, HTTP API, GroundTouch v2.6.3, GridOverlay, RealAircraft3DScene, drag-n-drop ячеек (v2.8.5), FDM телеметрия (v2.8.8) | 2026-06-08 |
| [README_INDEX.md](./README_INDEX.md) | **Этот файл** | Оглавление БЗ проекта | 2026-06-07 |

---

## 2. Телеметрия / Парсинг

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_decoding.md](./README_decoding.md) | Декодирование UDP-фреймов | out.json, field-catalog, TNParserRT, слоты, DecodeSchema | 2026-06-05 |
| [analysis_results.md](./analysis_results.md) | Результаты анализа телеметрии | Метрики, статистика фреймов, анализ данных | 2026-06-05 |
| [../DOCS/TNParserRT-UDP-Format.md](../DOCS/TNParserRT-UDP-Format.md) | Протокол UDP-формата TNParserRT | Формат пакета, заголовок, payload | 2026-06-05 |
| [../DOCS/Latency-Measurement-Methodology.md](../DOCS/Latency-Measurement-Methodology.md) | Методология замера задержек | UDP → SSR → HTML → paint, метки времени | 2026-06-05 |

---

## 3. Физика и 3D-визуализация

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_flight_physics.md](./README_flight_physics.md) | Физика полёта | Аэродинамика, тяга, силы, управление, уравнения движения | 2026-06-04 |
| [README_simulator_realisation.md](./README_simulator_realisation.md) | Реализация симулятора | Симуляция полёта, FDM, численные методы, 28 полей телеметрии (v2.8.8) | 2026-06-08 |
| [README_pluggable_fdm.md](./README_pluggable_fdm.md) | Подключаемые FDM (Flight Dynamics Model) | Архитектура FDM, модульность, плагины | 2026-06-05 |
| [README_performance_3D.md](./README_performance_3D.md) | Производительность 3D | Оптимизация Three.js, FPS, LOD, мобильные устройства | 2026-06-05 |
| [../src/components/Instruments/aircraft3d/README_aircraft3d.md](../src/components/Instruments/aircraft3d/README_aircraft3d.md) | 3D-модель самолёта | Aircraft3DInstrument, AircraftModel, Three.js, GLB, manual mode, GridOverlay, RealAircraft3DScene | 2026-06-07 |
| [README_ground_touch.md](./README_ground_touch.md) | Ground Touch Detection (v2.6.3) | Clamp Y≥-6, TOUCHDOWN overlay, groundTouch | 2026-06-06 |
| [README_aircraft3d_scene.md](./README_aircraft3d_scene.md) | Сцена Aircraft 3D: размеры, объекты, масштаб WU | TARGET_SIZE, WorldGroup, координаты, камера, World Units (1WU=40m) | 2026-06-09 |
| [README_plan_realistic_3D.md](./README_plan_realistic_3D.md) | План: реалистичный ландшафт | Шейдерный ground, InstancedMesh, биомы, фазы реализации | 2026-06-09 |
|| [README_plan_real_terrain.md](./README_plan_real_terrain.md) | **Реализовано ✅** — реальный ландшафт | Mapbox Terrain-RGB, серверный прокси (server.js), дисковый кэш (cache/terrain/), два уровня кэширования, lazy load grid 5×5 | 2026-06-10 |
|| [README_terrain_proxy.md](./README_terrain_proxy.md) | **Новый** — серверный прокси Mapbox | Express API, дисковый кэш, алгоритм работы, обработка ошибок, X-Cache | 2026-06-10 |
|| [README_terrain_quota.md](./README_terrain_quota.md) | **Новый** — система квот Mapbox | 50k лимит, автоматический сброс, буфер 10%, quota endpoint, файл terrain-quota.json | 2026-06-10 |

---

## 4. Приборы и интерфейсы

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_profiles.md](./README_profiles.md) | Система профилей | profiles, panels, presets, переключение, конфигурация | 2026-06-05 |
| [README_joysticks.md](./README_joysticks.md) | Управление джойстиками | TouchControls, Joystick, RudderSlider, manual flight, heading hold, баг РУД без writeOverride (v2.8.10) | 2026-06-08 |
| [../src/components/PanelKit/README_PantlKit.md](../src/components/PanelKit/README_PantlKit.md) | PanelKit — конструктор панелей | PanelCanvas, PanelNode, SplitContainer, drag-n-drop сайдбар+ячейки (v2.8.5), регистрация, исключение 3D (v2.8.6) | 2026-06-08 |

---

## 5. Профили и симулятор

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_profiles.md](./README_profiles.md) | Система профилей и пресетов | panel configs, profiles JSON, переключение на лету | 2026-06-05 |

---

## 6. Парсеры и реплей-инструменты

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [../tne-replay-tool/README.md](../tne-replay-tool/README.md) | tne-replay-tool — захват/воспроизведение UDP-телеметрии | .pfdrec, capture, replay, Node.js, tsx, REST API | 2026-06-05 |
| [../tne-replay-tool/README_pfdrec_capture.md](../tne-replay-tool/README_pfdrec_capture.md) | Формат и детали захвата .pfdrec | TLV-бинарный формат, pipeline pre-decode, CLI | 2026-06-05 |
| tne_parser *(Windows, C:\ERV\...)* | Нативный парсер TNParserRT для Windows | tnreplay, tnparserrt, десктопный рендерер | уточняется |

> **Примечание:** tne_parser — Windows-only проект. Нативный бинарник tnreplay/tnparserrt. Взаимодействует с сервером через socat-туннель (UDP → TCP → VPS).

---

## 7. Инфраструктура и DevOps

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [../README.md](../README.md) | Главный README проекта | Сборка, запуск, зависимости, pm2, порты, KB-индекс | 2026-06-07 |
| [../packages/realtime-charts/README.md](../packages/realtime-charts/README.md) | Realtime Charts | Stacked & Overlay chart, реалтайм-визуализация | 2026-06-05 |
| [../packages/realtime-charts/README_chart_plan_1_sol_1.md](../packages/realtime-charts/README_chart_plan_1_sol_1.md) | План чартов — решение 1 | Архитектура stacked/overlay | 2026-06-05 |
| [../packages/realtime-charts/README_chart_sol_2.md](../packages/realtime-charts/README_chart_sol_2.md) | План чартов — решение 2 | Альтернативная архитектура | 2026-06-05 |
| [../packages/realtime-charts/README_chart_analize_sol_1.md](../packages/realtime-charts/README_chart_analize_sol_1.md) | Анализ решений для чартов | Сравнение stacked vs overlay | 2026-06-05 |
| [../packages/realtime-charts/README_QA.md](../packages/realtime-charts/README_QA.md) | QA чартов | Тесты, вопросы, edge cases | 2026-06-05 |

---

## 8. Измерения и производительность

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [../DOCS/Latency-Measurement-Methodology.md](../DOCS/Latency-Measurement-Methodology.md) | Методология замера задержек | T0–T1, end-to-end latency | 2026-06-05 |
| [README_performance_3D.md](./README_performance_3D.md) | Производительность 3D | FPS, device compatibility, WebGL | 2026-06-05 |

---

## 9. Идеи и планы

| Файл | Описание | Ключевые темы | Актуализация |
|------|----------|---------------|--------------|
| [README_ideas.md](./README_ideas.md) | Идеи и Roadmap | Будущие фичи, улучшения, рефакторинг | 2026-06-04 |

---

## Быстрый поиск по темам

- **Начать изучение:** [README_architecture.md](./README_architecture.md) + [../README.md](../README.md)
- **Как работает декодинг:** [README_decoding.md](./README_decoding.md)
- **UDP-формат:** [../DOCS/TNParserRT-UDP-Format.md](../DOCS/TNParserRT-UDP-Format.md)
- **Физика полёта:** [README_flight_physics.md](./README_flight_physics.md)
- **Джойстики / Manual mode:** [README_joysticks.md](./README_joysticks.md)
- **Система профилей:** [README_profiles.md](./README_profiles.md)
- **Идеи в разработку:** [README_ideas.md](./README_ideas.md)
- **3D-самолёт:** [../src/components/Instruments/aircraft3d/README_aircraft3d.md](../src/components/Instruments/aircraft3d/README_aircraft3d.md)
- **Ground Touch & Clamp (v2.6.3):** `aircraftPosition.ts` — `groundTouch`, `aircraftPosition.y ≥ -6` (`../src/components/Instruments/aircraft3d/aircraftPosition.ts`)
- **Realtime Charts:** [../packages/realtime-charts/README.md](../packages/realtime-charts/README.md)
- **Измерение латентности:** [../DOCS/Latency-Measurement-Methodology.md](../DOCS/Latency-Measurement-Methodology.md)
- **tne-replay-tool (захват/реплей):** [../tne-replay-tool/README.md](../tne-replay-tool/README.md)
- **tne_parser (Windows):** в C:\ERV\... (связан через socat-туннель)

---

## Правила ведения KB

1. **Единая точка входа**
   - Файл `KB/README_INDEX.md` является единственным оглавлением базы знаний.
   - Каждый новый документ должен быть добавлен в одну из секций индекса с заполнением всех колонок.
   - Документ без записи в индексе — считается черновиком.

2. **Именование файлов**
   - Документация в папке `KB/` оформляется как `README_<ТЕМА>.md`.
   - Документация, относящаяся к конкретному пакету/подсистеме, остаётся в своей директории (например, `packages/realtime-charts/`), но индексируется отсюда относительной ссылкой.

3. **Актуализация (колонка дат)**
   - В колонке **Актуализация** используется формат `YYYY-MM-DD`.
   - Дата обновляется при содержательных изменениях документа.
   - Если дата отсутствует — документ требует ревью.

4. **Структура и содержание документов**
   - В начале каждого README — заголовок H1 и краткое описание назначения.
   - В конце — блок **Связанная документация** со ссылками на смежные документы.

5. **Ссылки и навигация**
   - Внутри KB — относительные ссылки: `./README_API.md`.
   - На корень проекта — `../README.md`.
   - На подпапки — полный относительный путь: `../packages/realtime-charts/README.md`.
   - На код — относительные пути от корня репозитория.

6. **Дополнение БЗ**
   - При добавлении новой фичи, архитектурного решения или важного инсайта — создаётся README или дополняется существующий.
   - После завершения сложной отладки (5+ шагов) — результат фиксируется в соответствующем README.

7. **Обслуживание**
   - `README_INDEX.md` обновляется синхронно с изменениями в KB.
   - При удалении документа — удаляется строка из индекса.
   - Приватные / чувствительные данные (API-ключи, пароли) в KB не попадают.

**Последнее обновление:** 2026-06-08




# README_QA — Realtime Charts Package

Вопросы и ответы, обсуждавшиеся в ходе разработки `packages/realtime-charts/`.

---

## 1. Какой бэкенд рендеринга?

**Q:** Что использовать — WebGL, Canvas 2D, SVG или chart library?

**A:** Canvas 2D

- WebGL — overkill для line charts
- SVG — DOM reflow при 3000 точках × 20 полос
- Chart library — не рассчитана на real-time осциллограф с per-strip auto-scale
- **Canvas 2D** — достаточно производительности, прямой контроль рендеринга

---

## 2. Пакет отдельно или внутри src?

**Q:** `packages/realtime-charts/` как отдельный npm-пакет или папка внутри `src/`?

**A:** Отдельный пакет `packages/realtime-charts/`

- Изоляция логики от приложения
- Тестируемость без моков React-компонентов
- Возможность npm publish в будущем

---

## 3. Какие режимы отображения?

**Q:** Только Stacked или нужен ещё Overlay?

**A:** **Оба режима**, переключение через toggle в toolbar

- **Stacked:** N горизонтальных полос, каждая со своим масштабом Y. До 20 серий.
- **Overlay:** единая область, все серии наложены с общей Y. До 24 серий.

---

## 4. Откуда брать данные?

**Q:** Post-decode (уже распакованные TelemetryFrame с ключами из FIELD_CATALOG) или raw UDP (pre-decode)?

**A:** **Post-decode.** Raw-mode пока не нужен, но архитектура должна его поддерживать.

Реализовано:
- `PFDTelemetryHub` — основной адаптер для post-decode данных
- `RawSlotAdapter` — существует, готов к будущему использованию (но не интегрирован в UI)
- Оба через интерфейс `ChartDataSource`

---

## 5. Canvas 2D — с какими паттернами рендеринга?

**Q:** Debounce / immediate? Back-buffer? Path cache?

**A:**
| Режим     | Debounce | Back-buffer | Path cache |
|-----------|----------|-------------|------------|
| Stacked   | 50ms     | Да          | Нет (перерисовка полос целиком) |
| Overlay   | Нет      | Нет         | Нет (full перерисовка, two-pass) |

- Stacked: статичный back-buffer, поверх него курсор
- Overlay: immediate full redraw с two-pass (сначала Y range, потом отрисовка)

---

## 6. Синхронизация курсора между режимами?

**Q:** Как синхронизировать курсор при переключении Stacked ↔ Overlay?

**A:** `cursorTimeSecRef` — **mutable ref**, не React state

- Курсорное время хранится в `useRef`, не вызывает ререндер при каждом mouse move
- `onCursorChange` обновляет только label в toolbar
- При переключении режима курсорная позиция сохраняется

---

## 7. Зум — какой диапазон и фактор?

**Q:** Диапазон зума и шаг?

**A:** Фактор **0.9** (приближение) / **1.1** (отдаление), clamp **[5, 600] секунд**

- Дефолтное окно: 60 секунд
- Пока `sessionTimeSec < timeWindowSec` — фиксированное окно `[0, max(window, sessionTimeSec)]`
- Когда `sessionTimeSec > timeWindowSec` — скользящее окно `[session - window, session]`

---

## 8. Сколько точек буферизировать на параметр?

**Q:** RingBuffer capacity?

**A:** **3000 точек** на ключ

При 30 fps это ~100 секунд данных. При 10 fps — ~300 секунд.

---

## 9. Децимация — какой алгоритм?

**Q:** Как преобразовывать 3000 точек в ширину полосы (~200-400px)?

**A:** Два алгоритма в `toDisplayPoints()`:

Если точек ≤ maxPoints → **uniformStride** (равномерная выборка)
Если точек > maxPoints → **minMaxBuckets** (two-scan, сохраняет min+max на бакет)

- minMaxBuckets гарантирует, что пики и впадины не теряются при downsampling
- Два прохода: первый — размер бакета, второй — min/max в каждом бакете

---

## 10. Палитра — сколько цветов?

**Q:** Сколько цветов для серий?

**A:** **8 цветов** (циклический перебор по индексу)

1. `#00C8FF` teal
2. `#FFB400` amber
3. `#50DC78` lime
4. `#FF5A5A` red
5. `#B48CFF` purple
6. `#FF78C8` pink
7. `#C8C850` olive
8. `#78B4FF` blue

---

## 11. Auto-sizing — как размер компонента?

**Q:** Передавать width/height пропсами или ResizeObserver?

**A:** **ResizeObserver + devicePixelRatio**

- Без пропсов width/height — компонент сам подстраивается под контейнер
- HiDPI: `canvas.width = floor(width * devicePixelRatio)`, `canvas.style.width = width`
- При ресайзе — `lastRevisionRef = -1` для принудительного перерендера

---

## 12. Названия параметров — ключи или displayName?

**Q:** В Stacked — показывать `pitchAngle` или `Угол тангажа`?

**A:** **Исходные ключи из FIELD_CATALOG** (`pitchAngle`, `rollAngle`, etc.)

- DisplayName (comment из FIELD_CATALOG) доступен через `getDisplayName()`
- В stripped mode показываем ключи (коротко и однозначно)

---

## 13. Тесты — что покрываем?

**Q:** Нужны ли тесты и на что?

**A:** Да, **15 тестов** (vitest):

- **RingBuffer** (8): push, overflow, samplesInWindow точное окно, reverse traversal при переполнении, пустой буфер, partial window, single-point
- **ChartDecimator** (7): uniformStride при `len ≤ max`, равномерный шаг, minMaxBuckets сохраняет минимумы и максимумы, деградация при `len ≈ max`, `len > max`, плоская линия, single point

Все core-модули тестируются без UI-зависимостей.

---

## 14. Ширина линии для Stacked и Overlay?

**Q:** Stroke width разный?

**A:** Да:
- **Stacked:** 1px (полосы узкие, толстая линия перегружает)
- **Overlay:** 2px (одна область, линии должны быть читаемы)

---

## 15. Вёрстка полос в Stacked — равномерно или по контенту?

**Q:** Все полосы одинаковой высоты или динамические?

**A:** **Равномерные** `viewHeight / count`, каждая не меньше `minStripHeight = 8px`

- Максимум 20 полос (`maxSeries`)
- Высота полосы = `max(minStripHeight, rawStripHeight)`

---

## 16. Легенда в Overlay — где находится?

**Q:** Справа, сверху, снизу?

**A:** **Снизу**, с динамической высотой

- `legendHeight = min(viewHeight / 3, count * legendLineHeight + 8)`
- Размер легенды вычисляется из layout
- Каждый элемент: цветная линия + имя ключа (обрезается до 28 символов)

---

## 17. Откуда берётся монотонное время для sample-данных?

**Q:** Sample-данные циклические (300 фреймов по 33мс), `receivedAt` одинаковый — как получить растущий `epochMs`?

**A:** **`performance.timeOrigin + performance.now()`** — монотонный источник

- Не используем `frame.receivedAt` для sample-режима
- `performance.now()` растёт независимо от циклического буфера sample-фреймов
- sessionStartMs устанавливается единожды при первом `ingestFrame`
- `sessionTimeSec` растёт монотонно

---

## 18. Что делать, если при первом запуске canvas чёрный?

**Q:** Страница charts загружается, но canvas чёрный и данные не рисуются.

**A:** Проверить:

1. Data revision растёт? (`console.log hub.getRevision()`)
2. epochMs монотонный? (`performance.timeOrigin + performance.now()`)
3. RingBuffer не пустой? (`buf.count > 0`)
4. Stacked возвращает точки? (`points.length >= 2` в drawStrip)

Типичная причина — HMR сбросил PFDTelemetryHub, но App продолжает слать те же sample-фреймы. Решение: перезапустить vite dev-сервер (Ctrl+C → `npm run dev`).

---

## 19. Какой вид упимальный для curve?

**Q:** `ctx.lineJoin` и `ctx.lineCap`?

**A:** Используется дефолтный `miter` join и `butt` cap

- Для 1-2px линий в осциллографском стиле разница незаметна
- При необходимости можно переключить на `round` для более гладкого вида

---

## 20. Куда переносим графики?

**Q:** В Pilot_3d_PFD (React) или отдельный проект?

**A:** В **Pilot_3d_PFD** (React/TypeScript монорепозиторий)

- Реализовано как отдельный пакет `packages/realtime-charts/` внутри монорепозитория
- Интегрировано в PFD hub как полноэкранный view `/charts`

---

## 21. Источник данных — один или два?

**Q:** Только post-decode или нужен ещё pre-decode (сырые UDP-слоты)?

**A:** **По умолчанию post-decode** (данные после декодера, по справочнику FIELD_CATALOG). **Архитектура предусматривает pre-decode** (сырые UDP-слоты) для отладки.

- `PFDTelemetryHub` — основной адаптер (post-decode, используется сейчас)
- `RawSlotAdapter` — существует, не интегрирован в UI
- Оба через интерфейс `ChartDataSource`

---

## 22. Нужен ли переключатель Raw/Decoded в UI сразу?

**Q:** Делать переключатель сразу?

**A:** **Нет**, сразу не нужен. Сделать только post-decode, но архитектуру спроектировать так, чтобы pre-decode подключался позже без переписывания.

---

## 23. В какой ветке разрабатывать?

**Q:** Основная ветка или новая?

**A:** **`dev_usa_chart`** — отдельная ветка для charts, не смешивать с `dev_usa`

- Создана и запушена
- Все изменения charts пакета и App.tsx только в этой ветке

---

## 24. Какой фреймворк для тестов?

**Q:** vitest, jest, mocha?

**A:** **vitest** — уже используется в проекте, легче подключается, совместим с Vite

---

## 25. Нужна ли поддержка mobile/tablet?

**Q:** Будет ли charts работать на телефоне/планшете?

**A:** Пока не обсуждалось. Предусмотрен touch-скролл, но явных требований не было.

---

## 26. Почему в Stacked клик ставит курсор (mouseDown), а в Overlay — отслеживание (mouseMove)?

**Q:** Разные триггеры курсора?

**A:** Да, как в Pilot_qt:
- **Stacked:** клик/тап на полосе — курсор фиксируется. Повторный клик — убирается.
- **Overlay:** hover по графику — курсор следует за мышью.

Синхронизация через `cursorTimeSecRef` — при переключении режима курсор сохраняет позицию по времени.

---

## 27. Что делать с sample-данными, если они циклические?

**Q:** 300 sample-фреймов — цикл 10 секунд. `receivedAt` одинаковый, `performance.now()` растёт. Как быть?

**A:** Использовать **`performance.timeOrigin + performance.now()` как источник монотонного времени**

- `epochMs` вычисляется на каждый ререндер App (30fps)
- `sessionStartMs` устанавливается один раз при первом `ingestFrame`
- `sessionTimeSec` растёт монотонно независимо от цикла sample-фреймов
- Sample-данные сами по себе перебираются циклически — это нормально, время сессии продолжает расти и окно скользит

---

## 28. Что если HMR сбросил ChartsView — данные пропадают?

**Q:** После hot-reload canvas чёрный, хотя данные идут.

**A:** HMR создаёт новый PFDTelemetryHub, но App продолжает слать старые sample-фреймы. Решение — **перезапустить vite dev-сервер** (`Ctrl+C → npm run dev`).

При нормальной работе (не HMR) данные приходят стабильно. При следующем перезапуске (cold start) — PFDTelemetryHub создаётся заново и начинает приём с нуля, что корректно.

---

## 29. Нужна ли поддержка raw-режима сейчас или только архитектурно?

**Q:** Raw-режим в UI сразу?

**A:** **Только архитектурно.** RawSlotAdapter уже написан и готов, но не подключён к ChartsView. Переключатель в UI не добавляли.

---

## 30. Планируется ли вынос в npm-пакет?

**Q:** Цель — изолировать или публиковать?

**A:** **Сейчас — изолировать.** Публикация в npm — возможное будущее, но не цель. Пакет `@pilot-3d-pfd/realtime-charts` — приватный (`private: true` в package.json).

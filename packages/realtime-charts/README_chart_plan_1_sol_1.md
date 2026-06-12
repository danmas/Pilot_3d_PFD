# README_chart_plan_1_sol_1 — План устранения проблем

Дата: 2026-06-04
Критерий приоритета: **влияние на производительность → корректность → UX**

---

## Фаза 1: Производительность (критично)

### Задача 1.1 — Убрать дублирующую фильтрацию в `toDisplayPoints`

**Файл:** `src/core/chart-decimator.ts`
**Суть:** `samplesInWindow()` уже возвращает valid-точки в [tMin, tMax]. `filterSamples()` делает то же самое повторно.

**План:**
1. Удалить `filterSamples()` (строки 8-10)
2. В `toDisplayPoints()`: заменить `filterSamples()` на прямую работу с samples
3. В `uniformStride()` и `minMaxBuckets()`: убрать `.valid` проверки и `.timeSec` проверки (вход уже отфильтрован)
4. Прогнать существующие тесты (`npm run test`), убедиться что 15 тестов зелёные

**Ожидаемый эффект:** −150K итераций/кадр, ~15-20% CPU на кадр.

**Риски:** Низкие. `samplesInWindow` гарантирует valid + time range. Если где-то данные приходят без фильтрации — тесты покажут.

---

### Задача 1.2 — Убрать двойную задержку в Stacked

**Файл:** `src/components/charts-panel.tsx`
**Суть:** `setInterval(render, 50)` + `setTimeout(debounce, 50)` = до 100ms latency.

**План:**
1. Убрать `debounceTimerRef` и setTimeout-обёртку в stacked-ветке `render()`
2. stacked-рендер делать immediate (как overlay), но с back-buffer
3. `setInterval` оставить на 50ms (пересмотрим в задаче 1.3)
4. Проверить визуально: stacked-графики должны обновляться без заметной задержки

**Ожидаемый эффект:** Latency stacked: 100ms → 50ms.

**Риски:** Средние. Без debounce stacked-рендер вызывается чаще. Но back-buffer уже есть, так что реальный draw только при изменении данных (revision check).

---

### Задача 1.3 — `requestAnimationFrame` вместо `setInterval`

**Файл:** `src/components/charts-panel.tsx`
**Суть:** `setInterval` игнорирует vsync, рендерит на скрытой вкладке, не адаптируется к частоте данных.

**План:**
1. Заменить `setInterval(render, 50)` на `requestAnimationFrame` loop:
   ```typescript
   useEffect(() => {
     let rafId: number;
     const loop = () => {
       render();
       rafId = requestAnimationFrame(loop);
     };
     rafId = requestAnimationFrame(loop);
     return () => cancelAnimationFrame(rafId);
   }, [render]);
   ```
2. Убрать `useEffect` с `setInterval` для `updateViewRange` (строки 73-78) — вызывать `updateViewRange` внутри rAF loop перед render
3. Добавить `visibilitychange` guard: при скрытой вкладке — пропускать render (кроме первого кадра после возврата)

**Ожидаемый эффект:** Vsync, 0% CPU на скрытой вкладке, адаптивная частота кадров.

**Риски:** Средние. `render` в deps `useEffect` — каждый mouse move в overlay пересоздаст rAF loop. Решается в задаче 2.1.

---

## Фаза 2: Корректность

### Задача 2.1 — Вынести cursorX из render-deps

**Файл:** `src/components/charts-panel.tsx`
**Суть:** `cursorX` (React state) в замыкании `render` → каждый mouse move пересоздаёт рендер-loop.

**План:**
1. Заменить `const [cursorX, setCursorX] = useState` на `const cursorXRef = useRef<number | null>(null)`
2. В mouse-обработчиках: писать в `cursorXRef.current`, вызывать `onCursorChange`
3. Для перерисовки курсора: добавить отдельный лёгкий rAF loop ТОЛЬКО для курсора (или вызывать `render()` принудительно по изменению cursorXRef)
4. Альтернатива: оставить cursorX state, но не включать его в deps render — читать из ref внутри render

**Ожидаемый эффект:** Стабильный rAF loop без пересоздания на mouse move.

**Риски:** Низкие. Паттерн «ref для частых обновлений» — стандартный в React + Canvas.

---

### Задача 2.2 — Вынести layout margins в общий конфиг

**Файлы:** `src/components/charts-panel.tsx`, `src/core/theme.ts`
**Суть:** Жёстко зашитые числа (56, 12, 50, 10) в cursor time conversion.

**План:**
1. Добавить в `theme.ts` экспорт функции `getPlotMargins(mode)` → `{ left, right }`
2. В `charts-panel.tsx`: использовать `getPlotMargins('stacked')` / `getPlotMargins('overlay')` вместо хардкода
3. Тесты на `getPlotMargins` (опционально)

**Ожидаемый эффект:** Изменение layout-констант автоматически применяется к курсору.

**Риски:** Нулевые.

---

### Задача 2.3 — Убрать модульный синглтон initCharts

**Файлы:** `src/views/charts-view.tsx`, `src/index.ts`
**Суть:** `let catalog = null` на уровне модуля — HMR сбрасывает, useEffect не перезапускает.

**План:**
1. Перенести `catalog` в props `ChartsView` (добавить `catalog: Array<{key, comment}>`)
2. Убрать `initCharts()` и модульную переменную
3. `useEffect` для создания hub сделать зависимым от `catalog` (с проверкой на изменение ссылки)
4. Обновить `src/index.ts` — убрать экспорт `initCharts`

**Ожидаемый эффект:** HMR-safe, нет глобального состояния.

**Риски:** Низкие. Нужно обновить место вызова ChartsView в App.tsx (передать catalog пропсом).

---

## Фаза 3: UX (низкий приоритет)

### Задача 3.1 — Y-шкала и сетка

**Файлы:** `src/renderers/stacked-renderer.ts`, `src/renderers/overlay-renderer.ts`
**Суть:** Нет визуальной привязки значений к шкале.

**План:**
1. Stacked: 2-3 горизонтальные линии с метками min/max на полосу (если strip.height ≥ 40px)
2. Overlay: Y-ось слева с 4-5 тиками, горизонтальная сетка
3. Всё рисовать цветом `THEME.textDim`, opacity 0.3

**Ожидаемый эффект:** Читаемость графиков.

**Риски:** Низкие. Чисто визуальное, на производительность влияет минимально (несколько линий).

---

### Задача 3.2 — Float-сравнение с epsilon

**Файл:** `src/core/ring-buffer.ts`, строка 42
**Суть:** `pt.timeSec < tMin` — теоретическая потеря граничной точки.

**План:**
1. Добавить `const EPS = 1e-9`
2. Заменить `pt.timeSec < tMin` на `pt.timeSec < tMin - EPS`
3. Аналогично для `pt.timeSec > tMax` → `pt.timeSec > tMax + EPS`

**Ожидаемый эффект:** Корректность на границах.

**Риски:** Нулевые.

---

### Задача 3.3 — destroy() у DataHub

**Файл:** `src/core/data-hub.ts`
**Суть:** Нет явной очистки ресурсов.

**План:**
1. Добавить метод `destroy()`: очищает `buffers.clear()`, `paramIndex.clear()`, сбрасывает `activeKeys`
2. Вызывать в cleanup `useEffect` в ChartsView

**Ожидаемый эффект:** Чистая память при размонтировании.

**Риски:** Нулевые.

---

## Сводка по фазам

| Фаза | Задач | Влияние | Часов (оценка) |
|------|-------|---------|----------------|
| 1 — Производительность | 3 | Высокое (CPU -20%, latency -50%) | 2-3 |
| 2 — Корректность | 3 | Среднее (стабильность, HMR) | 1-2 |
| 3 — UX | 3 | Низкое (читаемость) | 1 |

**Рекомендуемый порядок выполнения:** 1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 3.1 → 3.2 → 3.3

Задачи 1.1 и 1.2 можно делать параллельно (разные файлы). 1.3 зависит от 2.1 (cursorX ref).

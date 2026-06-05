# README_chart_analize_sol_1 — Анализ realtime-charts

Дата: 2026-06-04

## Архитектура (оценка: хорошо)

```
UDP frame → PFDTelemetryHub.ingest() → DataHub.ingestFrame()
  → RingBuffer.push() (per key)
  → ChartsPanel: setInterval(render, 50)
    → dataSource.chartSnapshots() → RingBuffer.samplesInWindow()
    → toDisplayPoints() → filterSamples + uniformStride/minMaxBuckets
    → renderStackedStatic / renderOverlay → Canvas 2D
```

Разделение на core / renderers / components — чистое, тестируемое.

## Что хорошо

| # | Решение | Почему |
|---|---------|--------|
| 1 | MinMax-децимация | При downsampling сохраняются пики и впадины — критично для осциллографа |
| 2 | Back-buffer в Stacked | Статика на offscreen canvas, основной — только drawImage + курсор |
| 3 | HiDPI через ResizeObserver | Без пропсов width/height, само подстраивается |
| 4 | ChartDataSource interface | Post-decode и pre-decode адаптеры взаимозаменяемы |
| 5 | 15 тестов (RingBuffer + Decimator) | Критичные модули покрыты |

## Найденные проблемы

### 🔴 Производительность / Latency

| # | Файл | Проблема | Влияние |
|---|------|----------|---------|
| 1 | `chart-decimator.ts:8-9` + `ring-buffer.ts:28-48` | `filterSamples()` дублирует фильтрацию `samplesInWindow()` — valid + time range. До 150K лишних итераций/кадр (50 ключей × 3000 точек) | CPU waste ~15-20% на кадр |
| 2 | `charts-panel.tsx:100-129` | Двойная задержка в Stacked: setInterval(poll, 50) + setTimeout(debounce, 50) = до 100ms latency | Отставание графиков от реальных данных на 3+ кадра |
| 3 | `charts-panel.tsx:148-151` | `setInterval(render, 50)` вместо `requestAnimationFrame`: нет vsync, рендер на скрытой вкладке, фиксированные 20 fps даже при 60 fps данных | Tearing, wasted CPU, пропуск кадров |

### 🟡 Корректность

| # | Файл | Проблема | Влияние |
|---|------|----------|---------|
| 4 | `charts-panel.tsx:148-151` | `render` зависит от `cursorX` (state) → каждый mouse move пересоздаёт setInterval | Лишний GC, микро-jitter |
| 5 | `charts-panel.tsx:159-163, 173-177` | Жёстко зашитые margins (56, 12, 50, 10) в cursor time conversion — должны совпадать с константами в theme.ts | При изменении layout — молчаливый баг курсора |
| 6 | `charts-view.tsx:10, 36-46` | `initCharts()` — модульный синглтон. HMR сбрасывает catalog, useEffect с [] не перезапускает хаб | Чёрный экран после HMR (известно, QA #28) |

### 🟢 UX / Мелкие

| # | Файл | Проблема | Влияние |
|---|------|----------|---------|
| 7 | `stacked-renderer.ts`, `overlay-renderer.ts` | Нет Y-шкалы и сетки — только label в углу | Трудно читать значения |
| 8 | `ring-buffer.ts:42` | Float-сравнение `pt.timeSec < tMin` — граничные точки могут потеряться | Теоретически, маловероятно |
| 9 | `data-hub.ts` | Нет `destroy()` — буферы живут до GC | Не критично, но неаккуратно |
| 10 | `overlay-renderer.ts` | Нет back-buffer, immediate full redraw при каждом кадре | При 24 сериях × HiDPI — может просесть на слабом CPU |

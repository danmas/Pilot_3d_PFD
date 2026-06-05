# @pilot-3d-pfd/realtime-charts

Real-time oscilloscope-style charts для Pilot_3d_PFD. Canvas 2D, без внешних библиотек.

**Два режима отображения:**
- **Stacked** — N горизонтальных полос, каждая со своим авто-масштабированием по Y (до 20 серий)
- **Overlay** — единая область графика, все серии наложены друг на друга с общей шкалой Y (до 24 серий)

## Архитектура

```
packages/realtime-charts/
├── src/
│   ├── core/               # Чистая логика — никаких UI-зависимостей
│   │   ├── types.ts        # Типы: SamplePoint, ChartDataSource, DataAdapter и др.
│   │   ├── ring-buffer.ts  # Кольцевой буфер 3000 точек на параметр
│   │   ├── data-hub.ts     # DataHub — ingest фреймов, snapshots по окну времени
│   │   ├── chart-decimator.ts  # Децимация: uniformStride и minMaxBuckets
│   │   ├── time-window.ts  # Окно времени, зум, конвертация пиксель↔время
│   │   ├── theme.ts        # Палитра (8 цветов) и константы layout
│   │   ├── pfd-adapter.ts  # Адаптер для TelemetryFrame + FIELD_CATALOG
│   │   ├── raw-slot-adapter.ts  # Адаптер для сырых UDP-слотов (pre-decode)
│   │   ├── ring-buffer.test.ts  # Тесты RingBuffer (8)
│   │   ├── chart-decimator.test.ts  # Тесты дециматора (7)
│   │   └── index.ts        # Re-export
│   ├── renderers/          # Canvas 2D рендереры
│   │   ├── stacked-renderer.ts   # Stacked: back-buffer + курсор
│   │   └── overlay-renderer.ts   # Overlay: two-pass + легенда
│   ├── components/
│   │   └── charts-panel.tsx      # React-компонент Canvas с auto-sizing
│   └── views/
│       └── charts-view.tsx       # Полностраничный view для интеграции
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

## Core-модули (без UI-зависимостей)

### RingBuffer
- Ёмкость 3000 точек на параметр
- Push (перезапись старых при переполнении)
- `samplesInWindow(tMin, tMax)` — reverse traversal + chronological возврат

### DataHub
- `configure(params)` — задаёт активные параметры (до 50)
- `ingestFrame(values[], epochMs)` — обновляет буферы и revision
- `chartSnapshots(keys, tMin, tMax)` — возвращает точки в окне
- `getRevision()` / `getSessionTimeSec()` / `getSessionStartMs()`

### ChartDecimator
- `toDisplayPoints(samples, tMin, tMax, maxPoints)`:
  - Если точек ≤ maxPoints — `uniformStride` (равномерная выборка)
  - Если точек > maxPoints — `minMaxBuckets` (сохраняет пики и впадины)

### TimeWindow
- `computeViewRange(sessionTimeSec, timeWindowSec)` — скользящее окно
- `applyZoom(state, sessionTimeSec, factor)` — зум 0.9/1.1, clamp [5, 600]с
- `timeFromX()` / `xFromTime()` — конвертация координат

## Рендереры

### StackedRenderer
- Каждый параметр — своя горизонтальная полоса
- Per-strip auto-scale Y (min/max точек на полосе)
- Двухслойный рендеринг: back-buffer (статический) + cursor overlay
- Штрихпунктирный курсор на клик

### OverlayRenderer
- Единая область графика, все серии с общей шкалой Y
- Two-pass: (1) децимация + глобальный Y range, (2) отрисовка
- Легенда внизу с цветными маркерами
- Подписи времени под графиком

## React-компоненты

### ChartsPanel
- Auto-sizing через ResizeObserver + devicePixelRatio
- Debounce 50ms для Stacked, immediate для Overlay
- Зум колесом мыши
- Курсор с синхронизацией через `cursorTimeSecRef`
- HiDPI support

### ChartsView
- Создаёт `PFDTelemetryHub` с параметрами из FIELD_CATALOG
- Ingest каждого фрейма через `useEffect`
- Toolbar с переключением Stacked↔Overlay
- Отображение времени курсора

## Адаптеры данных

### PFDTelemetryHub (post-decode)
- Принимает TelemetryFrame, извлекает значения через FIELD_CATALOG
- Используется в ChartsView по умолчанию

### RawSlotAdapter (pre-decode, для будущего)
- Сырые UDP-слоты `slot_0`..`slot_N`
- Готов к использованию, не интегрирован в UI

## Интерфейс ChartDataSource

```typescript
interface ChartDataSource {
  getRevision(): number;
  getSessionTimeSec(): number;
  chartSnapshots(keys: string[], tMin: number, tMax: number): ChartStripSnapshot[];
}
```

DataHub и PFDTelemetryHub оба реализуют этот интерфейс — можно подключать любой источник.

## Тесты

```
npm run test --prefix packages/realtime-charts
```

- **RingBuffer (8 тестов):** push, переполнение, выборка по окну, reverse traversal
- **ChartDecimator (7 тестов):** universalStride, minMaxBuckets, degenerate cases

## Палитра (8 цветов)

- `#00C8FF` — teal
- `#FFB400` — amber
- `#50DC78` — lime
- `#FF5A5A` — red
- `#B48CFF` — purple
- `#FF78C8` — pink
- `#C8C850` — olive
- `#78B4FF` — blue

# Анализ производительности 3D-рендеринга PFD

## Текущая архитектура
- React 19 + React Three Fiber v9.6.1 + Three.js r184
- Render loop через useFrame (requestAnimationFrame)
- Data flow: Telemetry → SSE → App.tsx (setFrame) → Aircraft3DInstrument → Canvas → WebGL
- Update rates: Sample 30 FPS, Replay 25 FPS, Live — event-driven (SSE)
- Scene: 8 meshes (primitive aircraft), 3 materials, 1 custom shader (HorizonSphere), shadows enabled

## Выявленные узкие места

### Критические
1. **Пересоздание геометрий каждый рендер** — 8 BufferGeometry создаются в JSX при каждом React-рендере. Старые не dispose'атся. Файл: AircraftModel.tsx
2. **Каскадный ре-рендер от монолитного state** — setFrame() в App.tsx обновляет state каждые 33–40мс, вызывая re-render всего дерева. Файл: App.tsx
3. **Отсутствие мемоизации компонентов** — Aircraft3DInstrument и AircraftModel не обёрнуты в React.memo. Файлы: Aircraft3DInstrument.tsx, AircraftModel.tsx
4. **Deep cloning GLTF-сцен** — scene.clone(true) при загрузке GLB-моделей без dispose старых клонов. Файл: AircraftModel.tsx

### Средние
5. **Утечка VRAM** — нигде нет .dispose() для геометрий и материалов. ~6–7 МБ/час при непрерывной работе
6. **Избыточная детализация HorizonSphere** — 64×32 сегментов (2048 вершин) для фонового объекта. Файл: HorizonSphere.tsx
7. **Panel config без кэша** — fetch с cache:'no-store' при каждом монтировании. Файл: PanelDisplay.tsx

### Низкие
8. **useFrame в CameraController вызывается каждый кадр** даже без анимации
9. **Создание new THREE.Euler() каждый кадр** в useFrame AircraftModel
10. **Antialias без проверки устройства** — дорого на 4K DPR=2

## Таблица приоритетов

| # | Проблема | Файл | Критичность | Эффект | Трудозатраты |
|---|----------|------|-------------|--------|--------------|
| 1 | Пересоздание геометрий | AircraftModel.tsx | ВЫСОКАЯ | 50–70% | 2ч |
| 2 | Каскадный ре-рендер | App.tsx | ВЫСОКАЯ | 40–60% | 3ч |
| 3 | Нет мемоизации | Aircraft3DInstrument.tsx | ВЫСОКАЯ | 40–60% | 3ч |
| 4 | GLTF cloning | AircraftModel.tsx | ВЫСОКАЯ | 30–50% (GLB) | 2ч |
| 5 | Утечка VRAM | Все компоненты | СРЕДНЕ-ВЫСОКАЯ | 6–7МБ/ч | 4ч |
| 6 | HorizonSphere | HorizonSphere.tsx | СРЕДНЯЯ | 10–15% | 1ч |
| 7 | Panel config fetch | PanelDisplay.tsx | СРЕДНЯЯ | 5–10% | 2ч |

## План улучшений

### Фаза 1: Быстрые фиксы (1–2 дня)
- useMemo на все геометрии в PrimitiveAircraft
- React.memo на Aircraft3DInstrument и AircraftModel с кастомным компаратором
- Добавить dispose() в useEffect cleanup
- Переиспользовать Euler через useRef

### Фаза 2: Вторичные оптимизации (1 день)
- Уменьшить resolution HorizonSphere до 32×16
- Добавить dispose для GLB-клонов
- Оптимизировать CameraController (условный useFrame)

### Фаза 3: Архитектурные улучшения (2–3 дня)
- Отделить телеметрию от UI state (Zustand / selector pattern)
- Мониторинг производительности (stats.gl)
- Адаптивные WebGL-настройки по устройству

## Валидация
- Chrome DevTools Performance tab (before/after)
- stats.gl метрики (draw calls, FPS, memory)
- Длительные replay-сессии (1+ час)
- Тест на integrated GPU

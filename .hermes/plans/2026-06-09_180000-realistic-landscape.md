# План: Реалистичный ландшафт для Aircraft 3D

**Дата:** 2026-06-09
**Статус:** Черновик
**Связанные идеи:** `KB/README_ideas.md` → «Реалистичный ландшафт: три подхода рендеринга»

---

## Цель

Добавить второй режим отображения ландшафта в приборе Aircraft 3D: **реалистичный** (процедурные биомы, возвышенности, деревья) с сохранением текущего **схематичного** режима. Переключение мгновенное, без перезагрузки сцены.

## Контекст и ограничения

- **Масштаб:** 1 WU ≈ 40 м. Небесная сфера R=200 WU (8 км).
- **Производительность:** Десктоп. Целевой FPS ≥ 50 при реалистичном режиме.
- **Объёмность:** Важна на низких высотах (аэродром, взлёт/посадка). На крейсерской высоте достаточно шейдерной имитации.
- **Генерация:** Процедурная, без привязки к реальной географии.
- **Архитектура:** Все наземные объекты внутри `WorldGroup`. GroundDisc — вне WorldGroup (следует за самолётом).
- **Текущий стек:** Three.js + React Three Fiber + Drei. Шейдеры через `shaderMaterial` или `glsl`.

## Подход: Гибрид (Шейдер + InstancedMesh)

### Фаза 1: Шейдерный ground plane (MVP)

Замена текущего зелёного диска на процедурно-генерируемую поверхность.

#### Шаги:

1. **Создать `ProceduralGround.tsx`** в `src/components/Instruments/aircraft3d/`
   - Плоская геометрия `PlaneGeometry(400, 400, 256, 256)` — достаточно вершин для displacement
   - Кастомный `ShaderMaterial` с uniforms:
     - `u_time` — анимация (опционально, для воды)
     - `u_realisticMode` — float 0.0 / 1.0 (переключение режимов)
     - `u_aircraftPos` — vec2(x, z) для центрирования текстуры
     - `u_seed` — seed для вариативности
   - Vertex shader: noise-based displacement по Y (холмы, долины)
   - Fragment shader:
     - Режим 0 (схематичный): сплошной зелёный цвет (как текущий GroundDisc)
     - Режим 1 (реалистичный): splatting по высоте и slope:
       - Низины → вода (синий)
       - Равнины → поле (жёлто-зелёный)
       - Средние высоты → лес (тёмно-зелёный)
       - Высокие/slope → горы (серый/коричневый)
       - Линия горизонта → fog blend

2. **Интеграция в RealAircraft3DScene.tsx**
   - Заменить `<Ground />` на `<ProceduralGround />` (или обернуть в условный рендер)
   - Передать `aircraftPosition` как uniform каждый кадр через `useFrame`
   - GroundDisc остаётся для схематичного режима (fallback)

3. **UI переключатель**
   - Добавить кнопку/тоггл в HUD прибора («🏔️ Ландшафт»)
   - Состояние: `useState<boolean>(false)` → uniform `u_realisticMode`
   - Сохранение в localStorage

4. **Тестирование Фазы 1**
   - Визуальная проверка: биомы выглядят убедительно на разных высотах
   - FPS замер: Chrome DevTools Performance Monitor
   - Проверка: переключение режима не вызывает re-mount Canvas

### Фаза 2: Объёмные детали (InstancedMesh)

Добавление деревьев и объектов вблизи камеры.

#### Шаги:

5. **Создать `VegetationInstances.tsx`**
   - Low-poly модели деревьев (конус + цилиндр, procedural geometry)
   - `InstancedMesh` с пулом ~2000 инстансов
   - Позиции генерируются процедурно на основе того же seed/noise, что и ground shader (согласованность!)
   - Frustum culling: обновлять только инстансы в радиусе ~50 WU от камеры
   - LOD: полные mesh вблизи (<20 WU), billboard/impostor вдали (20-50 WU)

6. **Высотная зависимость плотности**
   - На земле (Y < 5 WU): полная плотность деревьев
   - 5-20 WU: разрежение
   - >20 WU: скрыть instancing, оставить только шейдер

7. **Здания аэродрома (опционально)**
   - Простые box-геометрии в зоне ВПП
   - Отдельный InstancedMesh (~50 инстансов)
   - Привязка к координатам Runway

### Фаза 3: Полировка

8. **Fog и атмосфера**
   - `scene.fog = new THREE.FogExp2(color, density)`
   - Цвет fog согласован с цветом горизонта в HorizonSphere
   - Density зависит от высоты (гуще у земли)

9. **Тени (опционально, если FPS позволяет)**
   - DirectionalLight с shadow map
   - Только для instanced-объектов вблизи
   - Shadow bias tuning для избежания артефактов

10. **Оптимизация**
    - Web Worker для генерации позиций деревьев (не блокировать render thread)
    - Geometry merging для статичных объектов
    - `frustumCulled={false}` для InstancedMesh (culling вручную)

## Файлы для изменения/создания

| Файл | Действие |
|------|----------|
| `src/components/Instruments/aircraft3d/ProceduralGround.tsx` | Создать |
| `src/components/Instruments/aircraft3d/VegetationInstances.tsx` | Создать (Фаза 2) |
| `src/components/Instruments/aircraft3d/shaders/ground.vert` | Создать |
| `src/components/Instruments/aircraft3d/shaders/ground.frag` | Создать |
| `src/components/Instruments/RealAircraft3DScene.tsx` | Изменить |
| `src/components/Instruments/Aircraft3DInstrument.tsx` | Изменить (UI тоггл) |
| `src/components/Instruments/aircraft3d/Ground.tsx` | Оставить как fallback |

## Риски и открытые вопросы

1. **Noise функция в GLSL:** Нужна реализация simplex/perlin noise в шейдере. Использовать готовую библиотеку (`three-noise`, `glsl-noise`) или встроить inline?
2. **Согласованность ground ↔ vegetation:** Один и тот же noise seed должен использоваться в JS (для позиций деревьев) и в GLSL (для displacement). Как синхронизировать?
3. **Переключение режима:** Uniform switch vs conditional rendering? Uniform быстрее, но сложнее поддерживать два кода в одном шейдере.
4. **GroundDisc совместимость:** В реалистичном режиме GroundDisc нужно скрывать. Но он вне WorldGroup — как избежать двойной земли?
5. **Memory budget:** 2000 instanced trees × low-poly mesh = ? KB VRAM. Проверить на integrated GPU.

## Критерии приёмки

- [ ] Два режима переключаются мгновенно
- [ ] В реалистичном режиме видны холмы, поля, леса, вода
- [ ] На высоте < 200 м видны объёмные деревья
- [ ] FPS ≥ 50 на десктопе (GTX 1060 / Apple M1 baseline)
- [ ] Нет визуальных артефактов при пересечении границы режимов
- [ ] Текущий схематичный режим не изменён

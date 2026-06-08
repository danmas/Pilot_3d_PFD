# Joysticks / Touch Controls — история мучений

## Проблемы и решения

### 1. Джойстики не отображались на десктопе
Джойстики (`TouchControls.tsx`) скрыты при ширине >= 1024px (только мобильные). На десктопе их нет — только мышиный drag камеры.

### 2. Чёрный экран на мобильных
**Причина:** `CapsuleGeometry` не поддерживается на некоторых WebGL мобильных браузерах.
**Решение:** замена на `CylinderGeometry + SphereGeometry`.

### 3. «Обгон» камеры (camera overtaking)
Это была **иллюзия** — на самом деле самолёт и камера двигаются синхронно, но WorldGroup сдвигает мир обратно, а камера привязана к `aircraftPosition`. 
**Истинная причина:** lerp-сглаживание rotation модели (`g.rotation.y += (target.y - g.rotation.y) * 0.12`) — модель поворачивается медленно, а камера читала `headingDeg` (мгновенный целевой угол) и поворачивала offset на полный угол.

**Решение:** камера читает `modelYaw` — фактический `g.rotation.y` группы самолёта **после** lerp. Камера и модель поворачиваются синхронно.

### 4. Дёрганье сцены при касании джойстика рыскания (yaw)
Симптом: при первом касании левого джойстика (газ/рыскание) сцена прыгает/дёргается.

**Корень:** при переходе `override.active: false → true`:
1. `headingAccumRef.current` = `-g.rotation.y / DEG` (синхронизация с моделью) ✅
2. Но **на том же кадре** сразу прибавлялся `override.yaw * dt` ❌
3. `headingDeg` становился не равен фактическому rotation модели
4. Модель делала lerp-шаг к новому target → modelYaw менялся → камера дёргалась

**Решение:** на первом кадре активации (`!_wasActive`) `headingDeg` = из modelYaw, **без** `yaw * dt`. Со второго кадра — нормальная интеграция.

Реализовано в `AircraftModel.tsx` через `override._wasActive`.
Поле `_wasActive` добавлено в `aircraftControlsRef.ts`.

### 5. Камера не вращается за самолётом
**Проблема:** при повороте самолёта (yaw) камера продолжала смотреть вдоль ВПП.
**Решение:** в `CameraController.tsx` offset вращается на `modelYaw` через `applyAxisAngle(Y, modelYaw)`. Камера всегда сзади-сверху относительно модели.

## Архитектура камеры

```
CameraController (useFrame):
  rawYaw = aircraftControlsRef.current.modelYaw  // g.rotation.y (после lerp)
  
  // Сглаживание (тот же коэффициент 0.12, что у модели)
  smoothYaw += (rawYaw - smoothYaw) * 0.12
  
  // Поворот offset на сглаженный yaw
  rotatedOffset = baseOffset.clone().applyAxisAngle(Y, smoothYaw)
  
  // Мгновенная установка (без lerp позиции — иначе drag/zoom тормозят)
  camera.position.copy(rotatedOffset)
  camera.lookAt(0, 0, 0)  // самолёт в центре, WorldGroup сдвигает мир
```

## Используемые файлы

- `src/components/Instruments/aircraft3d/CameraController.tsx` — управление камерой
- `src/components/Instruments/aircraft3d/AircraftModel.tsx` — модель самолёта, публикует modelYaw
- `src/aircraftControlsRef.ts` — общий ref для связи TouchControls → AircraftModel → CameraController
- `src/components/Instruments/Aircraft3DInstrument.tsx` — сцена (без OrbitControls)
- `src/touch/joystick/Joystick.tsx` — правый джойстик (roll+pitch)
- `src/touch/joystick/ThrottleJoystick.tsx` — левый джойстик (gas+yaw)
- `src/touch/TouchControls.tsx` — композитный overlay

## Open questions / TODO

- Сглаживание камеры (smoothYaw с коэфф 0.12) может быть избыточным — модель сама уже lerp-ит rotation с тем же коэфф
- При переключении preset-ов камеры (chase/top/side/cockpit) нужно убедиться что `baseOffset` сбрасывается правильно
- Мышиный drag камеры и zoom работают, но при drag камера может уйти за пределы, откуда не видно самолёт — нужны ли полярные ограничения?
- При резком изменении yaw (например, отпускание джойстика → телефетрия) headingAccumRef пересинхронизируется, но lerp модели всё ещё догоняет — modelYaw плавно возвращается
- `_wasActive` — костыль, нужен ли флаг в интерфейсе?

## 6. РУД не обновлял обороты (v2.8.10)

**Симптом:** после касания синего джойстика, а затем РУД (красный столбик) — показания оборотов на приборке не обновлялись, пока не тронуть синий джойстик снова.

**Причина:** `ThrottleJoystick` менял `ref.throttle` напрямую, не вызывая `writeOverride`. Без `writeOverride` не обновлялся `override.active`, и FDM-цикл «засыпал» — `AircraftModel.useFrame` пропускал ручное обновление.

**Решение:** `ThrottleJoystick` всегда вызывает `writeOverride({ roll, pitch, yaw, throttle })` при любом движении РУД — даже если изменился только газ, а roll/pitch/yaw остались прежними.

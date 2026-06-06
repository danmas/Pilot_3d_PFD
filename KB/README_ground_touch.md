# Ground Touch Detection (v2.6.3)

**Назначение:** Предотвращение проваливания самолёта под землю в 3D-сцене + визуальное оповещение о касании.

## Механика

- **Уровень земли:** Y = **-6** (совпадает с `GroundDisc.tsx`)
- **Источник высоты:** `aircraftPosition.y` — накапливается в `aircraftPosition.ts`

## Компоненты

| Файл | Роль |
|------|------|
| `aircraftPosition.ts` | Хранит `aircraftPosition` (Vector3) и `groundTouch` (touched, since, reset) |
| `AircraftModel.tsx` | В useFrame: clamp Y ≥ -6 + детект касания (был выше → стал на земле) |
| `RealAircraft3DScene.tsx` | rAF-луп отслеживает `groundTouch.touched`, показывает TOUCHDOWN overlay |

## Поведение

1. Самолёт не может опуститься ниже Y = -6
2. При первом касании: `groundTouch.touched = true`, `since = performance.now()`
3. На экране: большая пульсирующая красная надпись **TOUCHDOWN** + "LANDING DETECTED"
4. Сообщение исчезает через **3.5 секунды**
5. После сброса — самолёт снова может касаться земли, событие сработает заново

## Связанная документация

- [README_architecture.md](./README_architecture.md) — архитектура 3D-сцены
- [../src/components/Instruments/aircraft3d/README_aircraft3d.md](../src/components/Instruments/aircraft3d/README_aircraft3d.md) — 3D Aircraft
- `../src/components/Instruments/aircraft3d/Ground.tsx` — GroundDisc (Y = -6)

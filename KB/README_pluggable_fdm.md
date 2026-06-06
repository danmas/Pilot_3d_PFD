# Подключаемые физические модели (Pluggable FDM)

> **Статус:** Спецификация готова. Реализация отложена.
>
> Дата анализа: 2026-05-29. Текущая модель `FlightSimulator` работает стабильно.
> Реализация потребуется при появлении 6-DOF, stall/spin, автопилота или сторонних моделей.

Документ фиксирует архитектурное решение и план реализации сменных физических моделей полёта в симуляторе `Pilot_3d_PFD`.

## Мотивация

Текущая физическая модель (`FlightSimulator` в `simulator.ts`) — это упрощённый visual/instrument FDM для PFD. Для развития (6-DOF, stall, посадка, автопилот) и для подключения сторонних команд нужна архитектура, в которой модель можно заменить, не ломая bridge, telemetry pipeline, blackbox и UI.

## Анализ текущей архитектуры

### Точки связности

`FlightSimulator` (448 строк) связан с системой в 3 местах:

1. **`bridge-plugin.ts`** — создаёт `new FlightSimulator()`, вызывает `.step(0.04)`, `.setControls()`, `.reset()`, `.buildBlackboxFrame()`, читает публичное состояние (`.pitch`, `.roll`, `.heading` и т.д.) для `/api/simulator/status`.
2. **Схема blackbox** — `SimulatorPhysicsSnapshot` содержит 16 захардкоженных полей (`rho`, `tasMs`, `qS`, `cl`, `cd`, `liftN`, `dragN` и т.д.), специфичных для текущей упрощённой аэродинамической модели.
3. **Profile runner** — `runSimulatorProfile()` создаёт offline-экземпляры `FlightSimulator` для тестовых профилей.

### Что уже хорошо

- Модель изолирована в одном файле (`simulator.ts`).
- Контракт вывода `step()` чистый — `Record<string, number | null>` по ключам `FIELD_CATALOG`.
- Bridge не интересуется внутренностями модели.
- Все PFD-приборы, запись и replay получают одинаковый `TelemetryFrame`.

## Предлагаемая архитектура

### Интерфейс `IFlightModel`

```typescript
export interface IFlightModel {
  /** Один шаг физики, dt в секундах. Возвращает telemetry payload. */
  step(dt: number): Record<string, number | null>;

  /** Сброс в начальное состояние. */
  reset(config?: Partial<SimulatorInitialConfig>): void;

  /** Установить управляющие воздействия. */
  setControls(ctrl: Partial<SimulatorControls>): void;

  /** Текущее состояние для status API. */
  getState(): FlightModelState;

  /** Snapshot для blackbox — модель определяет свой набор полей. */
  getPhysicsSnapshot(): Record<string, number>;

  /** Метаданные модели. */
  getModelInfo(): FlightModelInfo;
}

export interface FlightModelState {
  pitch: number;
  roll: number;
  heading: number;
  altitude: number;
  vy: number;
  cas: number;
  throttle: number;
  n1: number;
  normalG: number;
}

export interface FlightModelInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  /** Обязательные поля физики в blackbox. */
  requiredPhysicsFields: string[];
  /** Дополнительные поля, специфичные для модели. */
  optionalPhysicsFields: string[];
}
```

### Реестр моделей

```typescript
type ModelFactory = () => IFlightModel;

class FlightModelRegistry {
  private models = new Map<string, ModelFactory>();
  private active: IFlightModel;

  register(id: string, factory: ModelFactory): void;
  create(id: string): IFlightModel;
  list(): FlightModelInfo[];
  getActive(): IFlightModel;
  switchTo(id: string): IFlightModel;
}
```

### Дерево файлов

```text
Pilot_3d_PFD/
├── fdm/
│   ├── IFlightModel.ts           — интерфейс + типы
│   ├── FlightModelRegistry.ts    — реестр и загрузка
│   ├── FdmOutputContract.ts      — обязательные/опциональные поля телеметрии
│   ├── FdmBlackboxSchema.ts      — минимальный набор полей blackbox
│   ├── FdmValidationSuite.ts     — автоматическая валидация модели
│   └── models/
│       ├── SimplePfdModel.ts     — текущая модель, извлечённая из simulator.ts
│       └── (будущие модели)
├── simulator.ts                  — остаётся как re-export / compatibility layer
└── ...
```

### REST API расширения

| Endpoint | Метод | Назначение |
|---|---|---|
| `GET /api/simulator/models` | GET | Список доступных моделей |
| `POST /api/simulator/model` | POST | Выбрать активную модель `{ "modelId": "simple-pfd" }` |
| `GET /api/simulator/model/info` | GET | Метаданные текущей модели |

## План реализации

### Задача 1: Извлечение интерфейса

- Определить `IFlightModel`, `FlightModelState`, `FlightModelInfo` в `fdm/IFlightModel.ts`.
- Вынести общие типы (`SimulatorControls`, `SimulatorInitialConfig`, `SimulatorPilotSnapshot`) — они остаются общими для всех моделей.

### Задача 2: Извлечение текущей модели

- Перенести тело `FlightSimulator` в `fdm/models/SimplePfdModel.ts`.
- Реализовать `IFlightModel`.
- `simulator.ts` становится re-export или compatibility wrapper.

### Задача 3: Реестр моделей

- Реализовать `FlightModelRegistry` с auto-discovery (регистрация через `register()`).
- Bridge получает модель из реестра, а не создаёт напрямую.

### Задача 4: Рефакторинг bridge-plugin

- Заменить `new FlightSimulator()` на `registry.create(activeModelId)`.
- Типизировать `simulator` как `IFlightModel`.
- Blackbox: `physics` блок = `model.getPhysicsSnapshot()`, схема `sim-blackbox.v2` с `modelId`.

### Задача 5: API выбора модели

- Добавить endpoints `/api/simulator/models`, `/api/simulator/model`.
- Hot-swap: остановить текущий simulator interval, создать новую модель, запустить заново.

### Задача 6: Валидационный harness

- `FdmValidationSuite`: прогоняет модель через `trim_hold_60s` и проверяет:
  - Нет NaN/Infinity.
  - Все обязательные поля телеметрии присутствуют.
  - `NormalG` в диапазоне `0.5..1.5` на trim.
  - `CAS` не уплывает больше чем на `±10 kt` за 60 сек.

### Задача 7: Спецификация для внешних команд

- `README_FDM_SPEC.md` с примером реализации.
- `example-6dof/` как reference implementation.

## Спецификация для сторонних разработчиков

### Обязательный контракт вывода

Все модели **обязаны** заполнять следующие поля `FIELD_CATALOG` (иначе PFD-приборы не будут работать):

| Поле | Единицы | Обязательность |
|---|---|---|
| `RadioAltitude` | ft | Обязательно |
| `BaroAltitude` | ft | Обязательно |
| `PitchAngle` | deg | Обязательно |
| `RollAngle` | deg | Обязательно |
| `MagneticHeading` | deg | Обязательно |
| `CAS` | kt | Обязательно |
| `Vy` | mm/s (× 1000 от m/s) | Обязательно |
| `NormalG` | g | Обязательно |
| `AoA` | deg | Обязательно |
| `Time` | Unix epoch ms | Обязательно |
| `Engine_N1_Left` | % | Обязательно |
| `Engine_N1_Right` | % | Обязательно |
| `Engine_N1_Target_Left` | % | Обязательно |
| `Engine_N1_Target_Right` | % | Обязательно |
| `FCU_Roll_Left` | -1..1 | Обязательно |
| `FCU_Pitch_Left` | -1..1 | Обязательно |
| `FCU_Roll_Right` | -1..1 | Обязательно |
| `FCU_Pitch_Right` | -1..1 | Обязательно |
| `MachNumber` | — | Опционально |

### Blackbox: минимальный набор полей `physics`

Модель **обязана** предоставлять как минимум:

```typescript
{
  rho: number;          // плотность воздуха, kg/m³
  tasMs: number;        // истинная воздушная скорость, m/s
  alphaDeg: number;     // угол атаки, deg
  cl: number;           // коэффициент подъёмной силы
  cd: number;           // коэффициент сопротивления
  liftN: number;        // подъёмная сила, N
  dragN: number;        // сопротивление, N
  thrustN: number;      // тяга, N
  axMs2: number;        // продольное ускорение, m/s²
  nz: number;           // нормальная перегрузка
}
```

Дополнительные поля — на усмотрение модели, объявляются в `getModelInfo().optionalPhysicsFields`.

### Чек-лист валидации модели

1. `trim_hold_60s` на нейтральных controls:
   - `CAS` дрейф < `±10 kt` за 60 сек.
   - `Vy` в пределах `±5 m/s`.
   - `NormalG` в пределах `0.95..1.05`.
   - Нет NaN/Infinity ни в одном поле.
2. `step()` не бросает exceptions.
3. `reset()` корректно инициализирует состояние.
4. `setControls()` принимает clamp-нутые значения.
5. Все обязательные поля телеметрии заполнены (не `null`).

## Риски и митигация

| Риск | Митигация |
|---|---|
| Blackbox-аналитика теряет единообразие `physics.*` между моделями | Обязательный minimum set + `modelId` в каждом blackbox record |
| Модель не заполняет обязательные поля → PFD ломается | `FdmValidationSuite` на этапе регистрации |
| Разным моделям нужны разные initial config ranges | Модель декларирует `configSchema` с ranges, UI адаптируется |
| Hot-swap в runtime может потерять capture continuity | Stop → create → reset → start, новый capture файл |

## Оценка сложности

| Этап | Трудозатраты |
|---|---|
| Интерфейс + типы | 0.5 дня |
| Извлечение SimplePfdModel | 1 день |
| Реестр + bridge refactor | 1 день |
| REST API + hot-swap | 0.5 дня |
| Валидационный harness | 1 день |
| Спецификация + пример | 1-2 дня |
| **Итого** | **~5-6 дней** |

## Итог

Архитектура с подключаемыми моделями реалистична и полезна. Текущая физика уже хорошо изолирована, основная работа — формализация интерфейса и обеспечение совместимости blackbox/telemetry. Ключевой артефакт для внешних команд — спецификация с валидационным harness, без которой сторонние модели будут ломать pipeline.

# Физика полёта симулятора

Документ описывает текущую физику полёта в `Pilot_3d_PFD`: где она находится, какие переменные участвуют, как устроен шаг интеграции, какие controls влияют на модель и где есть физические ограничения/расхождения.

Короткий вердикт: это не полноценный 6-DOF flight dynamics model, а устойчивый визуализационный FDM для PFD. Модель считает тягу, сопротивление, подъёмную силу, вертикальную скорость, CAS, AoA и перегрузку, но ориентация самолёта задаётся в основном кинематически через pitch/roll/yaw rates от ручки, а не через моменты, инерции и поверхности управления.

## Карта реализации

Основной код физики:

- `simulator.ts` — класс `FlightSimulator`, состояние самолёта, controls, константы, интегратор `step(dt)`.
- `bridge-plugin.ts` — запуск симулятора на 25 Гц, REST API управления, публикация кадров через общий pipeline `publishDecodedFrame()`, запись blackbox и offline-прогоны профилей.
- `src/App.tsx` — клавиатурное управление, пружинное сглаживание inputs, UI режима симулятора, отправка raw pilot input для blackbox.
- `simulator-config.json` в корне workspace — persisted initial config, который реально читает bridge.
- `Pilot_3d_PFD/simulator-config.json` — локальный дубликат с теми же значениями, но runtime bridge использует файл из `PROJECT_ROOT`.
- `field-catalog.ts` — канонические поля телеметрии, в которые симулятор пишет результат.
- `decoding.ts` — после `step()` добавляет `dec_*` поля тем же способом, что и для UDP.

Поток данных:

```text
App.tsx keyboard loop, 20 Hz
  -> raw keys + raw pilot commands + smoothed controls
  -> POST /api/simulator/control
  -> FlightSimulator.setControls()

bridge-plugin.ts simulator loop, 25 Hz
  -> FlightSimulator.step(0.04)
  -> publishDecodedFrame()
  -> applyDecFormulas()
  -> SSE /events + /events/pfd
  -> telemetry capture *_live.jsonl
  -> sim blackbox *_sim_blackbox.jsonl
  -> PFD / Raw Monitor / replay consumers
```

Важно: симуляторные кадры и реальные UDP-кадры проходят через один и тот же `publishDecodedFrame()` pipeline. Для UI это хороший архитектурный выбор: приборы, запись и replay получают одинаковый `TelemetryFrame`.

Отдельно для анализа модели пишется `sim-blackbox.v1`: это не замена telemetry capture, а расширенный "чёрный ящик" с действиями пилота, сглаженными controls, внутренним состоянием FDM и промежуточными физическими величинами (`Cl`, `Cd`, `lift`, `drag`, `thrust`, ускорения, rate-команды).

## Начальная конфигурация

Тип:

```ts
export interface SimulatorInitialConfig {
  altitudeFt: number;
  casKt: number;
  throttle: number;
  pitchDeg: number;
}
```

Значения по умолчанию:

```json
{
  "altitudeFt": 10000,
  "casKt": 250,
  "throttle": 0.6,
  "pitchDeg": 3
}
```

Ограничения при сохранении/нормализации:

- `altitudeFt`: `0..60000`
- `casKt`: `60..500`
- `throttle`: `0..1`
- `pitchDeg`: `-10..15`

При `reset()`:

- `pitch = pitchDeg`
- `roll = 0`
- `heading = 0`
- `altitude = altitudeFt * 0.3048`
- `vy = 0`
- `cas = casKt`
- `throttle = initialThrottle`
- `n1 = 20 + initialThrottle * 80`
- `normalG = 1`
- `pitchRate = 0`
- `controls = { roll: 0, pitch: 0, rudder: 0, throttle: initialThrottle }`
- `seq = 0`

## Внутреннее состояние самолёта

Публичные state-переменные `FlightSimulator`:

| Переменная | Единицы | Назначение |
|---|---:|---|
| `pitch` | deg | Угол тангажа, пишется в `PitchAngle` |
| `roll` | deg | Угол крена, пишется в `RollAngle` |
| `heading` | deg | Магнитный курс/heading, диапазон `-180..180`, пишется в `MagneticHeading` |
| `altitude` | m | Внутренняя высота, наружу отдаётся в ft |
| `vy` | m/s | Внутренняя вертикальная скорость, наружу отдаётся как `Vy = vy * 1000` |
| `cas` | kt | Calibrated Airspeed, пишется в `CAS` |
| `tasMs` | m/s | True Airspeed, внутреннее состояние скорости |
| `throttle` | `0..1` | Команда РУД, влияет на target N1 |
| `n1` | % | Текущие обороты двигателя, апериодически следуют за throttle |
| `normalG` | g | Нормальная перегрузка, пишется в `NormalG` |
| `controls` | object | Текущие управляющие inputs |

Приватное состояние:

| Переменная | Единицы | Назначение |
|---|---:|---|
| `seq` | count | Внутренний счётчик шагов `step()` |
| `pitchRate` | deg/s | Сглаженная скорость тангажа |
| `initialConfig` | object | Последняя сохранённая initial config |
| `trimCl` | coeff | Балансировочный `Cl`, пересчитывается на `reset()` из active initial state |
| `trimAlphaRad` | rad | Балансировочный AoA, равен начальному `pitchDeg` при `Vy=0` |
| `lastDt` | s | Последний `dt`, попадает в blackbox |
| `lastPhysics` | object | Последний snapshot промежуточных расчётов FDM для blackbox |

## Controls

Серверный тип:

```ts
export interface SimulatorControls {
  roll: number;      // -1 left, +1 right
  pitch: number;     // -1 nose down, +1 nose up
  rudder: number;    // -1 left, +1 right
  throttle: number;  // 0..1
}
```

`setControls()` clamp-ит inputs:

- `roll`: `-1..1`
- `pitch`: `-1..1`
- `rudder`: `-1..1`
- `throttle`: `0..1`

Клавиатура во frontend:

| Клавиши | Control | Значение | Эффект |
|---|---|---:|---|
| `A` / `ArrowLeft` | `roll` | `-1` | Крен влево |
| `D` / `ArrowRight` | `roll` | `+1` | Крен вправо |
| `W` / `ArrowUp` | `pitch` | `-1` | Nose down |
| `S` / `ArrowDown` | `pitch` | `+1` | Nose up |
| `Q` | `rudder` | `-1` | Рыскание влево |
| `E` | `rudder` | `+1` | Рыскание вправо |
| `Shift` | `throttle` | `+0.015` за tick | Увеличить тягу |
| `Ctrl` | `throttle` | `-0.015` за tick | Уменьшить тягу |
| `Space` / `R` | reset | - | `POST /api/simulator/reset` |

Frontend отправляет controls каждые `50 ms` (`20 Hz`). Перед отправкой `roll`, `pitch`, `rudder` сглаживаются как пружина:

```ts
currentRoll += (targetRoll - currentRoll) * 0.35;
currentPitch += (targetPitch - currentPitch) * 0.35;
currentRudder += (targetRudder - currentRudder) * 0.35;
```

Throttle не центрируется, а интегрируется вверх/вниз по клавишам.

## Константы модели

| Константа | Значение | Смысл |
|---|---:|---|
| `MASS` | `60000 kg` | Масса самолёта |
| `G` | `9.81 m/s^2` | Ускорение свободного падения |
| `S` | `122 m^2` | Площадь крыла |
| `MAX_THRUST` | `58500 N` | Эффективная тяга simplified-модели, подобрана под cruise trim |
| `RHO0` | `1.225 kg/m^3` | Плотность воздуха на уровне моря |
| `TRIM_CL` | `0.465` | Fallback-значение; фактический `trimCl` пересчитывается при `reset()` |
| `CL_ALPHA` | `5.5 1/rad` | Наклон линейной зависимости `Cl(alpha)` |
| `CD0` | `0.022` | Профильное сопротивление |
| `K` | `0.045` | Коэффициент индуцированного сопротивления |
| `MAX_PITCH_RATE` | `6 deg/s` | Предельная скорость тангажа при полной ручке |
| `MAX_ROLL_RATE` | `25 deg/s` | Предельная скорость крена при полной ручке |
| `MAX_YAW_RATE` | `8 deg/s` | Предельная скорость yaw от rudder |
| `PITCH_DAMPING` | `1.8 1/s` | Объявлено, но в текущем `step()` не используется |

Для активного initial state `reset()` пересчитывает `trimCl = Weight / qS` и `trimAlphaRad = pitchDeg`. Поэтому базовый `cruise_10000_250` теперь действительно стартует около `CAS=250 kt`, `NormalG=1`, `Vy=0`.

## Частота и интегратор

Симулятор запускается в `bridge-plugin.ts`:

```ts
setInterval(() => {
  const now = Date.now();
  const decoded = simulator.step(0.04);
  const frame = publishDecodedFrame(decoded, now, captureDir);
  writeSimulatorBlackboxFrame(
    simulator.buildBlackboxFrame(frame.timeMs, now, decoded, simulatorPilotSnapshot, "simulator-live"),
    captureDir,
  );
}, 40);
```

Фактически:

- physical loop: `25 Hz`
- fixed `dt = 0.04 s`
- интегратор: explicit Euler
- substepping нет
- адаптации под фактическое время между ticks нет
- telemetry capture и blackbox пишутся на каждом physics tick, если включён capture

Для текущих ограниченных скоростей и углов это нормально для визуального PFD. Для более агрессивной модели, stall/spin или посадочной динамики explicit Euler на 25 Гц будет слабым местом.

## Алгоритм `step(dt)`

### 1. Engine spool

Throttle переводится в target N1:

```text
targetN1 = 20 + throttle * 80
n1 += (targetN1 - n1) * clamp(dt * 2.5, 0, 1)
n1 = clamp(n1, 20, 100)
```

Это апериодическое звено первого порядка. При `dt = 0.04` gain равен `0.1`, характерное время порядка `0.4 s`.

Тяга позже считается линейно:

```text
thrust = (n1 / 100) * MAX_THRUST
```

Физическое упрощение: нет зависимости тяги от высоты, Mach, режима двигателя или задержек spool-up/spool-down разной формы.

### 2. Атмосфера

Высота берётся не ниже нуля:

```text
h = max(0, altitude)
rho = RHO0 * max(0.1, 1 - 2.25577e-5 * h)^4.2559
```

Это приближение ISA по плотности. Ни температура, ни скорость звука, ни Mach в FDM не участвуют.

### 3. Скорость

Внутри FDM скорость хранится как `tasMs`. При `reset()` она вычисляется из заданного CAS и плотности воздуха:

```text
tasMs = (casKt * 0.51444) / sqrt(rho / RHO0)
tasMs = max(20, tasMs)
```

На каждом шаге интегрируется именно `tasMs`; `CAS` вычисляется обратно только для телеметрии/PFD. Это убирает старую ошибку, где `CAS` каждый tick заново трактовался как `TAS` и скорость мгновенно проседала на высоте.

`20 m/s` — искусственный floor, который не даёт модели уйти в ноль/отрицательную скорость. Это не stall model.

### 4. Угол атаки, подъёмная сила, сопротивление

Динамическое давление с площадью крыла:

```text
qS = 0.5 * rho * tasMs^2 * S
```

Угол траектории:

```text
gamma = atan2(vy, tasMs)
```

Угол атаки:

```text
alphaRad = pitchRad - gamma
alphaDeg = alphaRad * 180/pi
```

Коэффициент подъёмной силы:

```text
Cl = trimCl + CL_ALPHA * (alphaRad - trimAlphaRad)
Cl = clamp(Cl, -0.5, 2.0)
```

`trimCl` и `trimAlphaRad` задаются при `reset()` из выбранных initial conditions. Для `cruise_10000_250` это даёт `lift ~= MASS * G` уже на первом кадре.

Сопротивление:

```text
Cd = CD0 + K * Cl^2
drag = qS * Cd
lift = qS * Cl
```

Физическое упрощение:

- нет нелинейной stall-полярки;
- нет зависимости от flap/gear;
- нет sideslip;
- нет compressibility/Mach effects;
- `Cl` ограничен сверху `2.0`, но stall behavior как падение `Cl` после критического AoA отсутствует.

### 5. Продольная динамика скорости

```text
ax = (thrust - drag) / MASS - G * sin(gamma)
tasMs += ax * dt
tasMs = max(20, tasMs)
```

После этого TAS грубо переводится обратно в CAS:

```text
cas = (tasMs / 0.51444) * sqrt(clamp(rho / RHO0, 0.3, 1.2))
cas = clamp(cas, 60, 500)
```

Энергетическая связь есть: при увеличении pitch скорость падает через `-g*sin(pitch)`, при снижении pitch скорость растёт. Но pitch сам не является результатом моментов от elevator, а задаётся rate-командой.

### 6. Вертикальная динамика и normal G

Крен уменьшает эффективную вертикальную составляющую lift:

```text
rollRad = roll * pi/180
nz = lift * cos(rollRad) / (MASS * G)
```

Вертикальное ускорение:

```text
verticalAccel = (nz - 1) * G - vy * 0.08
vy += verticalAccel * dt
vy = clamp(vy, -80, 80)
normalG = clamp(nz, -1, 4)
```

`vy` ограничена диапазоном `-80..80 m/s`, то есть примерно `+-15750 ft/min`.

Физическое упрощение: это не полная проекция сил в земную систему координат. В design doc была формула вида:

```text
ay = Lift / m - g * cos(pitch) * cos(roll)
```

В реализации используется:

```text
ay = (nz - 1) * g - damping
```

Для PFD это даёт понятное поведение, но G, pitch, roll и Vy связаны частично, не как в полноценной point-mass/6-DOF модели.

### 7. Высота и земля

```text
altitude += vy * dt
```

Если высота ушла ниже нуля:

```text
altitude = 0
vy = max(0, vy)
pitch = max(0, pitch)
roll *= 0.9
normalG = 1
```

Это страховка от провала под землю. Посадочной физики, реакции опор, flare, bounce, ground roll и торможения нет.

### 8. Attitude rates

Pitch:

```text
cmdPitchRate = controls.pitch * MAX_PITCH_RATE
pitchRate += (cmdPitchRate - pitchRate) * clamp(dt * 8, 0, 1)
pitch += pitchRate * dt
pitch = clamp(pitch, -30, 30)
```

Особенность: `controls.pitch` напрямую задаёт желаемую скорость тангажа. Это кинематическое управление, не момент от elevator.

В коде заявлен `PITCH_DAMPING`, но фактического аэродинамического damping к trim AoA нет. Есть только сглаживание `pitchRate` к `cmdPitchRate`.

Roll:

```text
cmdRollRate = controls.roll * MAX_ROLL_RATE
rollDamping = abs(controls.roll) < 0.05 ? -roll * 0.8 : 0
roll += (cmdRollRate + rollDamping) * dt
roll = clamp(roll, -60, 60)
```

Если ручка по крену отпущена, добавляется автоцентрирование к нулевому крену.

Heading:

```text
coordRate = 0
if abs(roll) > 0.5 && tasMs > 20:
  coordRate = (G / tasMs) * tan(rollRad) * 180/pi
  coordRate = clamp(coordRate, -10, 10)

yawRate = controls.rudder * MAX_YAW_RATE + coordRate
heading += yawRate * dt
heading wrapped to -180..180
```

Замечание: `rollRad` вычислен до обновления `roll` в текущем шаге, поэтому coordinated turn использует roll прошлого подшага. На `25 Hz` это практически незаметно, но формально есть one-step lag.

## Выходной TelemetryFrame

`step()` создаёт объект со всеми ключами из `FIELD_CATALOG`, по умолчанию `null`, затем заполняет поля:

| Поле | Источник | Единицы/смысл |
|---|---|---|
| `RadioAltitude` | `altitude * 3.28084` | ft |
| `BaroAltitude` | `altitude * 3.28084` | ft |
| `PitchAngle` | `pitch` | deg |
| `RollAngle` | `roll` | deg |
| `MagneticHeading` | `heading` | deg |
| `CAS` | `cas` | kt |
| `Vy` | `vy * 1000` | mm/s в симуляторе |
| `NormalG` | `normalG` | g |
| `Time` | `Date.now()` | Unix epoch ms, не flight time |
| `FCU_Roll_Left` | `controls.roll` | normalized `-1..1` |
| `FCU_Pitch_Left` | `controls.pitch` | normalized `-1..1` |
| `FCU_Roll_Right` | `controls.roll` | normalized `-1..1` |
| `FCU_Pitch_Right` | `controls.pitch` | normalized `-1..1` |
| `Engine_N1_Left` | `n1` | % |
| `Engine_N1_Right` | `n1` | % |
| `Engine_N1_Target_Left` | `throttle * 100` | % |
| `Engine_N1_Target_Right` | `throttle * 100` | % |
| `AoA` | `alphaDeg` | deg |

После этого `publishDecodedFrame()` добавляет `dec_*` через `applyDecFormulas()`:

- `dec_BaroAltFt = BaroAltitude`
- `dec_RadioAltFt = RadioAltitude`
- `dec_MachKnots = MachNumber * 661.5`, если `MachNumber` есть
- `dec_G = NormalG`

## REST API симулятора

`GET /api/simulator/status`

Возвращает:

- `mode`: `udp | simulator`
- `active`: есть ли simulator interval
- `initialConfig`
- `controls`
- `pilot`: последний raw pilot snapshot, полученный через `/api/simulator/control`
- `blackbox`: состояние blackbox recorder
- `state`: `pitch`, `roll`, `heading`, `altitude`, `vy`, `cas`, `throttle`, `n1`, `normalG`

`POST /api/simulator/mode`

Body:

```json
{ "mode": "simulator" }
```

или:

```json
{ "mode": "udp" }
```

При включении `simulator` вызывается `startSimulator()`, который делает `simulator.reset()` и запускает loop на 25 Гц. При возврате в `udp` interval останавливается.

`GET /api/simulator/config`

Возвращает текущий `initialConfig`.

`POST /api/simulator/config`

Сохраняет новую initial config в `simulator-config.json`. Если симулятор сейчас не запущен, сразу вызывает `simulator.reset()`. Если запущен, активное состояние продолжает лететь до reset/restart.

`POST /api/simulator/control`

Body:

```json
{
  "roll": 0,
  "pitch": 0,
  "rudder": 0,
  "throttle": 0.6,
  "pilot": {
    "keys": ["s", "d"],
    "rollCmdRaw": 1,
    "pitchCmdRaw": 1,
    "rudderCmdRaw": 0,
    "throttleCmdRaw": 0.6
  }
}
```

Все поля optional. Сервер применяет clamp. Блок `pilot` нужен для blackbox-аналитики: это raw input пилота до серверного clamp и после frontend key mapping. Сами controls остаются сглаженными командами, которые реально получает FDM.

`POST /api/simulator/reset`

Сбрасывает самолёт в `initialConfig`.

`GET /api/simulator/blackbox/status`

Возвращает состояние blackbox recorder:

- `active`: открыт ли stream;
- `path`: путь к текущему `*_sim_blackbox.jsonl`;
- `frames`: сколько blackbox-кадров записано;
- `schema`: `sim-blackbox.v1`.

`GET /api/simulator/profiles`

Возвращает список воспроизводимых тестовых профилей:

| Профиль | Длительность | Что проверяет |
|---|---:|---|
| `trim_hold_60s` | 60 s | Дрейф trim, стабильность `CAS/Vy/NormalG/AoA` на нейтральных controls |
| `pitch_step_up` | 35 s | Отклик `pitch -> AoA -> Vy/CAS` на 5 секунд nose-up |
| `pitch_step_down` | 35 s | Отклик на 5 секунд nose-down, разгон и снижение |
| `roll_command_step` | 45 s | 3 секунды full-right roll command, затем neutral. Не гарантирует ровно 30° bank |
| `throttle_step` | 45 s | `throttle -> N1 -> thrust -> CAS` |
| `combined_maneuver` | 70 s | Комбинированный pitch/roll/rudder/throttle сценарий |

`GET /api/simulator/profile-presets`

Возвращает стартовые условия для profile run:

| Preset | Условия | Зачем |
|---|---|---|
| `cruise_10000_250` | `10000 ft`, `250 kt`, `throttle 0.6`, `pitch 3°` | Базовый cruise/trim режим |
| `low_speed_3000_160` | `3000 ft`, `160 kt`, `throttle 0.55`, `pitch 5°` | Низкая скорость, чувствительность `pitch/AoA/Vy` |
| `high_altitude_25000_250` | `25000 ft`, `250 kt`, `throttle 0.72`, `pitch 4°` | Влияние плотности и CAS/TAS-пересчёта |
| `approach_1500_140` | `1500 ft`, `140 kt`, `throttle 0.5`, `pitch 4°` | Заходный низкоскоростной режим без механизации |

`POST /api/simulator/profile/run`

Запускает offline-прогон профиля без вмешательства в текущий live simulator state.

Body:

```json
{
  "profileId": "pitch_step_up",
  "presetId": "cruise_10000_250"
}
```

Результат:

```json
{
  "ok": true,
  "frames": 875,
  "initialConfig": {
    "altitudeFt": 10000,
    "casKt": 250,
    "throttle": 0.6,
    "pitchDeg": 3
  },
  "telemetryPath": "captures/..._profile_pitch_step_up_telemetry.jsonl",
  "blackboxPath": "captures/..._profile_pitch_step_up_blackbox.jsonl"
}
```

PowerShell-пример:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3410/api/simulator/profile/run `
  -ContentType "application/json" `
  -Body '{"profileId":"pitch_step_up","presetId":"cruise_10000_250"}'
```

Профили выполняются offline на отдельном экземпляре `FlightSimulator`, не трогают текущий live simulator state и не требуют переключения UI в режим Simulator. Стартовые условия берутся из выбранного `presetId`; если передать `initialConfig`, он имеет приоритет над preset. Результат сразу сохраняется в `captures/`. При запуске из UI созданный telemetry-файл автоматически открывается как Replay: PFD сначала показывает начальный кадр профиля, затем проигрывает весь сценарий.

## Blackbox-запись для аналитиков

При live-полёте в режиме `Simulator` обычный capture продолжает писать `telemetry-frame.v1`. Параллельно bridge создаёт второй файл `*_sim_blackbox.jsonl` со схемой `sim-blackbox.v1`.

Что отдавать аналитикам:

- Для ручного полёта: пару файлов `*_live.jsonl` + `*_sim_blackbox.jsonl` из одной сессии.
- Для воспроизводимого теста: пару файлов `*_profile_<id>_telemetry.jsonl` + `*_profile_<id>_blackbox.jsonl`.
- Основной файл для анализа причинно-следственной связи — blackbox. Telemetry нужен для сверки с тем, что реально видел PFD/replay.

Один blackbox JSONL record соответствует одному physics tick (`25 Hz`, `dt=0.04`):

```json
{
  "schema": "sim-blackbox.v1",
  "seq": 123,
  "timeMs": 4880,
  "dt": 0.04,
  "receivedAt": "2026-05-29T10:13:00.000Z",
  "source": "simulator-live",
  "initialConfig": {
    "altitudeFt": 10000,
    "casKt": 250,
    "throttle": 0.6,
    "pitchDeg": 3
  },
  "pilot": {
    "source": "keyboard",
    "keys": ["s", "d"],
    "rollCmdRaw": 1,
    "pitchCmdRaw": 1,
    "rudderCmdRaw": 0,
    "throttleCmdRaw": 0.74
  },
  "controls": {
    "roll": 0.91,
    "pitch": 0.88,
    "rudder": 0,
    "throttle": 0.74
  },
  "state": {
    "pitchDeg": 12.4,
    "rollDeg": 28.1,
    "headingDeg": 42.7,
    "altitudeM": 3120.5,
    "altitudeFt": 10237.9,
    "vyMs": 8.3,
    "casKt": 231.2,
    "n1Pct": 77.2,
    "throttle": 0.74,
    "normalG": 1.18,
    "aoaDeg": 7.1
  },
  "physics": {
    "rho": 0.89,
    "tasMs": 134.8,
    "qS": 988000,
    "gammaDeg": 3.5,
    "alphaDeg": 7.1,
    "cl": 0.68,
    "cd": 0.043,
    "liftN": 671000,
    "dragN": 42500,
    "thrustN": 169800,
    "axMs2": -0.42,
    "verticalAccelMs2": 1.1,
    "nz": 1.18,
    "cmdPitchRateDegS": 6,
    "pitchRateDegS": 5.4,
    "cmdRollRateDegS": 25,
    "rollDampingDegS": 0,
    "coordTurnRateDegS": 3.2,
    "yawRateDegS": 3.2
  },
  "telemetry": {
    "PitchAngle": 12.4,
    "RollAngle": 28.1,
    "CAS": 231.2,
    "Vy": 8300,
    "NormalG": 1.18,
    "AoA": 7.1
  }
}
```

Для сопоставления управления и отклика модели аналитикам достаточно строить графики:

- `pilot.pitchCmdRaw -> controls.pitch -> physics.pitchRateDegS -> state.pitchDeg -> state.aoaDeg -> state.vyMs -> state.casKt`
- `pilot.rollCmdRaw -> controls.roll -> state.rollDeg -> physics.coordTurnRateDegS -> state.headingDeg -> state.normalG`
- `pilot.throttleCmdRaw -> controls.throttle -> state.n1Pct -> physics.thrustN -> state.casKt`
- `physics.alphaDeg -> physics.cl -> physics.liftN -> state.normalG`
- `physics.dragN/thrustN/axMs2 -> state.casKt`

Минимальный checklist анализа:

- Проверить задержку и сглаживание: `pilot.*CmdRaw` должен ступенькой меняться раньше, чем `controls.*`.
- Проверить pitch-цепочку: `controls.pitch` должен менять `physics.pitchRateDegS`, затем `state.pitchDeg`, затем `physics.alphaDeg`, затем `state.vyMs/state.casKt`.
- Проверить roll-цепочку: `controls.roll` должен менять `state.rollDeg`, затем `physics.coordTurnRateDegS/state.headingDeg`; при крене `physics.nz` должен снижаться без компенсации ручкой.
- Проверить двигатель: `controls.throttle` меняется сразу, `state.n1Pct` идёт с лагом, `physics.thrustN` следует за N1, `state.casKt` реагирует ещё позже.
- Проверить баланс сил: в trim режиме `physics.liftN` должен быть близок к `MASS * G`, `physics.axMs2` и `physics.verticalAccelMs2` должны быть около нуля. Если нет — текущий trim не физически сбалансирован.

## Проверка физической корректности

### Что в модели сделано нормально для visual sim

- Есть единый серверный источник истины для state, запись и replay не зависят от браузера.
- Есть инерция двигателя: N1 не прыгает мгновенно к throttle.
- Есть плотность воздуха по высоте.
- Есть связь pitch/thrust/drag с CAS.
- Есть связь pitch/Vy/AoA/lift/NormalG.
- Крен уменьшает вертикальную составляющую lift и создаёт coordinated turn.
- Все основные PFD-поля генерируются в том же формате, что и UDP pipeline.
- Модель ограничена clamp-ами, поэтому её сложно "сломать" обычными keyboard inputs.

### Главные физические ограничения

1. Pitch/roll/yaw не являются результатом моментов.

   Ручка задаёт `pitchRate` и `rollRate` напрямую. Нет моментов, инерции, angular acceleration, elevator/aileron effectiveness, damping derivatives.

2. Trim привязан к initial state, а не к полной аэродинамической устойчивости.

   `trimCl` и `trimAlphaRad` пересчитываются при `reset()`, поэтому выбранный preset может стартовать сбалансированным. Но после изменения режима pitch всё ещё задаётся кинематически, без моментной устойчивости самолёта.

3. Начальный trim всё равно требует проверки для каждого preset.

   `cruise_10000_250` после правки держит `CAS/altitude/G` почти без дрейфа на 60 сек. Остальные presets могут быть не идеально сбалансированы по throttle/drag и нужны как тестовые режимы.

4. Нет stall model.

   Есть clamp `Cl <= 2.0` и speed floor `20 m/s`, но нет срыва потока, падения `Cl`, роста drag после критического AoA, buffeting, wing drop.

5. CAS/TAS пересчёт очень грубый.

   На высоте CAS считается через `sqrt(rho/rho0)`, без Mach/compressibility. Для PFD-демо ок, для валидации лётных режимов нет.

6. Vertical dynamics упрощена.

   `verticalAccel = (nz - 1) * g - vy * 0.08` даёт стабильный приборный эффект, но не является полной проекцией сил.

7. `Time = Date.now()`.

   Поле `Time` получает Unix epoch ms. Если потребитель ожидает телеметрическое flight time из ARINC/tnparserrt, значение будет семантически другим.

8. Единицы `Vy` надо подтвердить для UDP.

   Симулятор пишет `Vy` в `mm/s`, а `VerticalSpeed.tsx` делит на `1000`. Sample data тоже использует значения порядка `3000`. Если реальный UDP `Vy` приходит в `m/s`, реальный режим будет отображаться в 1000 раз меньше.

9. Client controls 20 Гц, physics 25 Гц.

   Это допустимо, но есть небольшой input quantization/lag. Для keyboard sim ок; для gamepad лучше синхронизировать или перейти на 50 Гц/60 Гц.

10. Reset не сбрасывает локальные frontend accumulators мгновенно.

    Сервер сбрасывается, но `currentRoll/currentPitch/currentRudder/currentThrottle` внутри effect в `App.tsx` остаются до следующей сходимости/перезапуска effect. Обычно это косметика, но после reset может быть короткий control bump.

## Практические bench-тесты

Минимальный набор проверок без изменения кода:

Эти проверки можно делать вручную через UI, но предпочтительный путь для аналитиков — запускать соответствующий профиль через `POST /api/simulator/profile/run` и строить графики по `*_blackbox.jsonl`.

1. Trim hold 60 секунд.

   Профиль: `trim_hold_60s`.

   Условия: выбранный initial preset, controls neutral. Для базового сравнения используем `cruise_10000_250`.

   Смотреть:

   - `CAS` не должен быстро уплывать.
   - `Vy` должен оставаться около нуля или выходить на малую установившуюся величину.
   - `NormalG` около `1`.
   - `AoA` около ожидаемого для cruise, без резкого дрейфа.
   - В blackbox: `physics.liftN ~= 60000 * 9.81`, `physics.axMs2 ~= 0`, `physics.verticalAccelMs2 ~= 0`.

2. Step throttle `0.6 -> 1.0`.

   Профиль: `throttle_step`.

   Смотреть:

   - `Engine_N1_*` должен плавно идти к `100`.
   - `CAS` должен расти без скачков.
   - `pitch/roll` не должны сами меняться от throttle.
   - В blackbox: `controls.throttle` меняется ступенькой, `state.n1Pct` отстаёт, `physics.thrustN` следует за `state.n1Pct`.

3. Sustained pitch up.

   Профиль: `pitch_step_up` или вручную удерживать `S`.

   Смотреть:

   - `pitch` растёт максимум до `30 deg`.
   - `CAS` падает.
   - `AoA`, `NormalG`, `Vy` реагируют без NaN/рывков.
   - В blackbox: `pilot.pitchCmdRaw -> controls.pitch -> physics.pitchRateDegS -> state.pitchDeg`.

4. Sustained pitch down.

   Профиль: `pitch_step_down` или вручную удерживать `W`.

   Смотреть:

   - `pitch` падает максимум до `-30 deg`.
   - `CAS` растёт, но clamp-ится до `500 kt`.
   - `Vy` уходит в снижение, clamp `-80 m/s`.

5. Bank 30 deg.

   Профиль: `roll_command_step` или вручную удержать крен, потом отпустить.

   Смотреть:

   - при отпущенной ручке roll должен возвращаться к нулю;
   - heading должен меняться в сторону coordinated turn;
   - при большом крене `NormalG`/`Vy` должны показать потерю вертикальной составляющей lift.
   - В blackbox: `physics.coordTurnRateDegS` должен расти вместе с `state.rollDeg`.

6. Ground contact.

   Довести высоту до нуля.

   Смотреть:

   - `altitude` не уходит ниже `0`;
   - `vy` не остаётся отрицательной после контакта;
   - нет NaN;
   - roll постепенно гасится.

## Если доводить физику дальше

Самые полезные следующие шаги:

1. Добавить простой pitch stability.

   Сейчас `PITCH_DAMPING` не используется. Минимальный вариант:

   ```text
   pitchRate += (-pitchRate * damping + elevatorCommand) * dt
   ```

   Более правильный вариант: отдельная динамика `q` и момент от elevator/AoA.

2. Добавить stall-полярку.

   Минимум: после `alphaCrit` ограничивать/снижать `Cl` и резко увеличивать `Cd`.

3. Уточнить единицы `Vy` для реального UDP.

   Если реальный поток в `m/s`, ввести `dec_VyMs` и перевести PFD на него, не смешивая raw `Vy`.

4. Синхронизировать частоты.

   Для gamepad/мыши лучше controls `50..60 Hz`, physics `50 Hz` или fixed-step accumulator по реальному времени.

5. Сделать `source` честным.

   Сейчас `publishDecodedFrame()` всегда ставит `source = tnparser-udp-${bridgeUdpPort}` даже для симулятора. Для диагностики лучше различать `simulator` и `tnparser-udp-*`.

## Итог

Текущая физика пригодна для управляемого PFD/telemetry simulator: она стабильная, понятная, хорошо интегрирована в существующий pipeline и генерирует правдоподобные приборные параметры. Но это именно instrument/visual simulator. Для проверки лётных режимов, trim, stall, посадки или автопилота модель нужно усиливать: хранить TAS как state, исправить trim, добавить моменты/демпфирование, stall-полярку и аккуратную вертикальную/угловую динамику.

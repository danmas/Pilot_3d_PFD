# Формат UDP-данных TNParserRT

Первоисточник: СПО «TNParserRT», версия 1.5.24 (`pilot_docs/TNParserRt.pdf`).

Pilot_qt принимает **выходной** UDP-поток утилиты TNParserRT, сконфигурированный в `out.json`.

## Цепочка данных

```
TN3 / tnreplay  ──UDP :13332──►  TNParserRT  ──UDP :14443──►  Pilot_qt
   (сырой поток)                    (парсинг tcfg)              (визуализация)
```

- TN3 по умолчанию передаёт данные на UDP-порт **13332** (broadcast).
- TNParserRT захватывает этот поток, разбирает по `tcfg`-файлу задания и выдаёт потребителям потоки из `out.json`.
- Pilot_qt слушает порт потока с `"state": "on"` и совпадающим `"port"` (по умолчанию **14443**).

## Фрейм данных

На каждом тике накопителя (1/1024 с) TNParserRT формирует один **фрейм**:

| Часть | Содержимое UDP-payload |
|-------|------------------------|
| **INFO** | Маркерный пакет со служебной информацией |
| **DATA** | Один или несколько пакетов с бинарными данными модулей |

Все поля передаются **little-endian** (младший байт вперёд), без выравнивающих байт.

Если итоговый DATA-пакет превышает **1024 байта**, он разбивается на несколько UDP-datagram'ов (последний — остаток).

### Параметры потока в out.json

| Параметр | По умолчанию | Описание |
|----------|--------------|----------|
| `marker` | `yes` | При `no` — только DATA, без INFO |
| `ticks` | `no` | При `yes` — перед каждой пачкой тика: `uint32 tick` + `uint16 size` |
| `tickcount` | — | Делитель 1024-Гц тика для выдачи (приоритет над `timeout`) |
| `timeout` | — | Период выдачи в миллисекундах |
| `mode` | `raw` | Режим данных для потока или слота |

## Пакет INFO

| Смещение | Поле | Размер | Тип | Описание |
|----------|------|--------|-----|----------|
| 0 | Marker | 2 | uint16 | `0x4E54` (ASCII «TN») |
| 2 | DataCount | 2 | uint16 | Число наборов DATA в фрейме |
| 4 | Counter | 4 | uint32 | Счётчик отправленных фреймов |
| 8 | Data counters | DataCount×2 | uint16[] | Размер каждого набора DATA в байтах |
| 8+DataCount×2 | Checksum | 2 | uint16 | Контрольная сумма (см. PDF §4.2) |
| +2 | Temperature | 2 | int16 | Температура мастер-блока; °C = value / 16 |
| +2 | резерв | 30 | char | Служебные данные |

Минимальный размер INFO при DataCount=1: **44 байта** (8 + 2 + 34).

## Пакеты DATA

- Не содержат маркера INFO.
- Бинарные данные модулей, упакованные TNParserRT согласно `slots` в `out.json`.
- При `ticks=yes` перед каждой пачкой данных тика: 4 байта номера тика (uint32) + 2 байта размера пачки (uint16).

## Формат payload DATA — порядок слотов

Байты в payload идут **строго в порядке массива `slots`** выходного потока в `out.json`.

### Типы данных по режиму слота

| mode | Тип в UDP | Размер | Примечание |
|------|-----------|--------|------------|
| `real` | float (IEEE754) | 4 | TNParserRT уже применил msb/lsb/price/sign/sdi |
| `raw` | int16 / uint16 / uint32 | 2 или 4 | «Сырые» коды модуля |
| `all` | char / int16 / uint32 | переменный | Весь накопленный поток канала |
| `all-real` | float | переменный | Накопленные физические величины |
| `status` | uint16 | 2 | Статусное слово кожуха |
| `ftemp` | float | 4 | Температура кожуха в °C |

### mode: real и ARINC-429

Для ARINC-429 в режиме `real` поля `msb`, `lsb`, `price`, `sign`, `sdi` в `out.json` описывают преобразование **на стороне TNParserRT**. В UDP приходит готовое значение **float32** в физических величинах.

Пример слота:

```json
{
  "block": "9", "slot": "3", "channel": "13", "mode": "real", "param": "005",
  "msb": "28", "lsb": "19", "price": "0.25", "sdi": "no", "sign": "no"
}
```

→ 4 байта float32 LE в payload.

Pilot **не должен** повторно применять msb/lsb/price при `mode: real`.

## Реализация в Pilot_qt

### Что реализовано

| Аспект | Файл |
|--------|------|
| Приём UDP на порту 14443 | `src/net/UdpReceiver.cpp` |
| Загрузка slots из out.json | `src/core/ParamRegistry.cpp` |
| Распознавание INFO (0x4E54) | `src/net/TnParserRtProtocol.cpp` |
| Сборка multi-UDP DATA по Data counters | `src/net/TnParserRtProtocol.cpp` |
| Режим без маркера (data-only) | `tryAssembleDataOnlyFrame()` |
| Декод float32 / int16 LE | `decodeValues()`, `readValueAt()` |
| Размер поля по mode | `src/core/ParamId.cpp` |
| Хранение и отображение значений | `src/core/RealtimeDataHub.cpp`, `DataMonitorWidget` |

### Алгоритм декодирования

```
payload = собранные DATA (все наборы склеены подряд)
offset = 0
for each param in registry.params():   // порядок slots out.json
    if param.dataSizeBytes == 4:  value = float32_LE(payload, offset)
    if param.dataSizeBytes == 2:  value = int16_LE(payload, offset)
    if offset + size > payload.size():  value = 0
    offset += param.dataSizeBytes
```

Ожидаемый размер payload: `ParamRegistry::totalDataSizeBytes()`.

### Что не реализовано

| Аспект | Статус |
|--------|--------|
| Проверка Checksum INFO | Не проверяется |
| Чтение Temperature / резерв INFO | Игнорируется |
| Режим `ticks=yes` | Не поддерживается |
| Режимы `all`, `all-real`, `nmea`, `udp` | Не поддерживаются |
| Применение price/msb/lsb при decode | Не нужно для `mode: real` (данные уже float) |

### Известные риски

1. **Новый INFO сбрасывает незавершённую сборку** — проверка маркера выполняется до обработки DATA-chunk'ов. Если INFO приходит каждый тик, а DATA не успевают — `Decoded frames` остаётся 0.

2. **`parseInfoPacket` требует size >= 42** — checksum/temperature/reserve не парсятся; порог может отличаться от полного INFO по PDF.

3. **`ticks=yes`** — заголовки тиков будут ошибочно интерпретированы как значения параметров.

4. **Порт** — TNParserRT захватывает 13332, выдаёт на порт из `out.json`; Pilot должен слушать именно этот порт (14443).

## Диагностика

View → **Data Monitor** показывает декодированные значения и секцию **Raw / Protocol debug** с hex-дампом последнего datagram, состоянием парсера и разметкой payload по параметрам.

/**
 * Единый каталог метаданных телеметрических параметров (132 поля).
 *
 * РОЛЬ В АРХИТЕКТУРЕ:
 *   Это СПРАВОЧНИК имён, типов данных и описаний полей.
 *   Байтовая раскладка бинарного потока определяется НЕ порядком в этом файле,
 *   а порядком слотов в out.json (читается модулем decoding.ts при старте).
 *
 *   Сопоставление: запись каталога ↔ слот out.json выполняется по ARINC param.
 *   Для полей без param (статусы, температуры блоков) — по позиционному индексу.
 *
 *   Расчётные поля (dec_*) описываются в decoding.ts (функция applyDecFormulas).
 *   Префикс dec_ означает «вычислено нами, в потоке парсера отсутствует».
 *
 * ИЗ ЭТОГО ФАЙЛА ГЕНЕРИРУЕТСЯ:
 *   - ключи decoded output для всех потребителей (единый словарь)
 *   - подсказки типов в IDE
 *   - документация параметров
 */

export type ParameterType =
  | "Float"
  | "Double"
  | "Int16"
  | "Short"
  | "UInt16"
  | "Int32"
  | "UInt32"
  | "Byte"
  | "Int8"
  | "UInt8";

export interface FieldEntry {
  /** Канонический английский ключ (используется в JSON-выдаче) */
  key: string;
  /** ARINC 429 parameter label (например, "0164") */
  param: string;
  /** Русское описание (из комментариев out.json) */
  comment: string;
  /** Тип данных в бинарном потоке */
  dataType: ParameterType;
  /** Группа/система */
  group: string;
}

/** Полный каталог — 132 поля в порядке out.json */
export const FIELD_CATALOG: FieldEntry[] = [
  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — основные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "RadioAltitude",
    param: "0164",
    comment: "Радиовысота",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "DME_Distance",
    param: "0202",
    comment: "Дальность DME",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "MagneticHeading",
    param: "0320",
    comment: "Магнитный курс",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "RollAngle",
    param: "0325",
    comment: "Угол крена",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "PitchAngle",
    param: "0324",
    comment: "Угол тангажа",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "NormalG",
    param: "0333",
    comment: "Ny — нормальная перегрузка",
    dataType: "Float",
    group: "АВИОНИКА",
  },

  // ══════════════════════════════════════════════════════════════════
  //  ДВИГАТЕЛИ
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Engine_N1_Left",
    param: "0346",
    comment: "Обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ",
  },
  {
    key: "Engine_N1_Target_Left",
    param: "0341",
    comment: "Целевые обороты левого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ",
  },
  {
    key: "Engine_N1_Right",
    param: "0346",
    comment: "Обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ",
  },
  {
    key: "Engine_N1_Target_Right",
    param: "0341",
    comment: "Целевые обороты правого МСУ",
    dataType: "Float",
    group: "ДВИГАТЕЛИ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  ТОПЛИВО
  // ══════════════════════════════════════════════════════════════════
  {
    key: "TotalFuel",
    param: "0247",
    comment: "Общее количество топлива",
    dataType: "Float",
    group: "ТОПЛИВО",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Шасси — замки убранного/выпущенного положения
  // ══════════════════════════════════════════════════════════════════
  {
    key: "LG_Uplock",
    param: "0270",
    comment: "ЛООШ на замке убрано (Left Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "LG_Downlock",
    param: "0270",
    comment: "ЛООШ на замке выпуска (Left Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "RG_Uplock",
    param: "0271",
    comment: "ПООШ на замке убрано (Right Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "RG_Downlock",
    param: "0271",
    comment: "ПООШ на замке выпуска (Right Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "NG_Uplock",
    param: "0270",
    comment: "ПОШ на замке убрано (Nose Gear Uplocked)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "NG_Downlock",
    param: "0270",
    comment: "ПОШ на замке выпуска (Nose Gear Downlocked)",
    dataType: "Float",
    group: "ШАССИ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  ВСУ (вспомогательная силовая установка)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "APU_Speed",
    param: "005",
    comment: "Обороты ВСУ",
    dataType: "Float",
    group: "ВСУ",
  },
  {
    key: "APU_OilTemp",
    param: "0157",
    comment: "Температура масла ВСУ",
    dataType: "Float",
    group: "ВСУ",
  },
  {
    key: "APU_EGT",
    param: "024",
    comment: "Температура газа за турбиной ВСУ",
    dataType: "Float",
    group: "ВСУ",
  },
  {
    key: "APU_OilPressure",
    param: "007",
    comment: "Давление масла за фильтром ВСУ",
    dataType: "Float",
    group: "ВСУ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  КСКВ (комплексная система кондиционирования воздуха)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "ECS_TargetTemp_1",
    param: "012",
    comment: "Целевая температура подачи 1 (КСКВ)",
    dataType: "Float",
    group: "КСКВ",
  },
  {
    key: "ECS_TargetTemp_2",
    param: "012",
    comment: "Целевая температура подачи 2 (КСКВ)",
    dataType: "Float",
    group: "КСКВ",
  },
  {
    key: "ECS_TargetTemp_4",
    param: "013",
    comment: "Целевая температура подачи 4 (КСКВ)",
    dataType: "Float",
    group: "КСКВ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  БРУ (блок ручного управления) / Flight Control Unit
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FCU_Roll_Left",
    param: "010",
    comment: "Левая БРУ по крену",
    dataType: "Float",
    group: "БРУ",
  },
  {
    key: "FCU_Pitch_Left",
    param: "006",
    comment: "Левая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ",
  },
  {
    key: "FCU_Roll_Right",
    param: "011",
    comment: "Правая БРУ по крену",
    dataType: "Float",
    group: "БРУ",
  },
  {
    key: "FCU_Pitch_Right",
    param: "007",
    comment: "Правая БРУ по тангажу",
    dataType: "Float",
    group: "БРУ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  АВИОНИКА — расширенные параметры
  // ══════════════════════════════════════════════════════════════════
  {
    key: "StandardAltitude",
    param: "0203",
    comment: "Стандартная высота",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "BaroAltitude",
    param: "0204",
    comment: "Барометрическая высота",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "CAS",
    param: "0206",
    comment: "Вычисленная воздушная скорость (CAS)",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "MachNumber",
    param: "0205",
    comment: "Число Маха",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "AoA",
    param: "0241",
    comment: "AoA #1 — угол атаки",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "Alpha",
    param: "0221",
    comment: "Индикаторный угол атаки",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "Vy",
    param: "0212",
    comment: "Вертикальная скорость барометрическая",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "AutopilotOn",
    param: "0270",
    comment: "Включение автопилота",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "FlightDirectorOn",
    param: "0270",
    comment: "Включение пилотажного директора",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "HeadingHoldOn",
    param: "0274",
    comment: "Включение режима HDG",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "HeadingSelect",
    param: "0100",
    comment: "Заданное значение HDG",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "VerticalSpeedSelect",
    param: "0104",
    comment: "Заданная вертикальная скорость",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "SpeedSelect",
    param: "0103",
    comment: "Заданная скорость",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "FD_RollCmd",
    param: "0141",
    comment: "Положение креновой директорной планки",
    dataType: "Float",
    group: "АВИОНИКА",
  },
  {
    key: "FD_PitchCmd",
    param: "0140",
    comment: "Положение тангажной директорной планки",
    dataType: "Float",
    group: "АВИОНИКА",
  },

  // ══════════════════════════════════════════════════════════════════
  //  КСУ — комплексная система управления (Flight Controls)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "FlapsLever",
    param: "012",
    comment: "Положение ручки FLAPS",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "FlapsPosition",
    param: "063",
    comment: "Текущее положение закрылок",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "SlatsPosition",
    param: "063",
    comment: "Текущее положение предкрылков",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Left_Center",
    param: "056",
    comment: "Положение интерцептора левого центрального",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Right_Center",
    param: "057",
    comment: "Положение интерцептора правого центрального",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Left_Outer",
    param: "056",
    comment: "Положение интерцептора левого внешнего",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Left_Inner",
    param: "056",
    comment: "Положение интерцептора левого внутреннего",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Right_Inner",
    param: "057",
    comment: "Положение интерцептора правого внутреннего",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Spoil_Right_Outer",
    param: "057",
    comment: "Положение интерцептора правого внешнего",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Airbrake_Inner_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внутренний (воздушный тормоз внутр.)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Airbrake_Outer_Cmd",
    param: "0154",
    comment: "Команда на выпуск ТЩ внешний (воздушный тормоз внеш.)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "StabPosition",
    param: "060",
    comment: "Положение стабилизатора",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Rudder_Upper",
    param: "055",
    comment: "Положение руля направления (верх)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Rudder_Lower",
    param: "055",
    comment: "Положение руля направления (низ)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Rudder_Middle",
    param: "055",
    comment: "Положение руля направления (середина)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "RudderTrim",
    param: "042",
    comment: "Триммер по курсу",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Elev_Right_Outer",
    param: "055",
    comment: "Положение правого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Elev_Left_Outer",
    param: "055",
    comment: "Положение левого руля высоты (внешний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Elev_Left_Inner",
    param: "055",
    comment: "Положение левого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Elev_Right_Inner",
    param: "055",
    comment: "Положение правого руля высоты (внутренний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Ail_Right_Inner",
    param: "056",
    comment: "Положение правого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Ail_Left_Inner",
    param: "056",
    comment: "Положение левого элерона (внутренний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Ail_Left_Outer",
    param: "056",
    comment: "Положение левого элерона (внешний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "Ail_Right_Outer",
    param: "056",
    comment: "Положение правого элерона (внешний)",
    dataType: "Float",
    group: "КСУ",
  },
  {
    key: "AileronTrim",
    param: "042",
    comment: "Триммер по крену",
    dataType: "Float",
    group: "КСУ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Шасси — обжатие (Weight-On-Wheels)
  // ══════════════════════════════════════════════════════════════════
  {
    key: "NG_WOW",
    param: "0272",
    comment: "Обжатие ПОШ (Nose Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "LG_WOW",
    param: "0272",
    comment: "Обжатие ЛООШ (Left Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "RG_WOW",
    param: "0272",
    comment: "Обжатие ПООШ (Right Gear Weight-On-Wheels)",
    dataType: "Float",
    group: "ШАССИ",
  },
  {
    key: "WOW",
    param: "0272",
    comment: "Обжатие всех опор (Weight-On-Wheels all)",
    dataType: "Float",
    group: "ШАССИ",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Статусные слова MIL-STD-1553
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_7",
    param: "",
    comment: "STATUS_7 — статусное слово 1553 (блок 3, линия 1, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_5",
    param: "",
    comment: "STATUS_5 — статусное слово 1553 (блок 3, линия 2, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_6",
    param: "",
    comment: "STATUS_6 — статусное слово 1553 (блок 3, линия 3, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_8",
    param: "",
    comment: "STATUS_8 — статусное слово 1553 (блок 3, линия 4, задача 1, минор 1, offset 48 бит)",
    dataType: "Short",
    group: "STATUS",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Статусы блоков ТН (телеметрический накопитель) по слотам
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Status_TN_0",
    param: "",
    comment: "STATUS_TN_0 — статус телеметрического блока 0",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_1",
    param: "",
    comment: "STATUS_TN_1 — статус телеметрического блока 1",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_2",
    param: "",
    comment: "STATUS_TN_2 — статус телеметрического блока 2",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_3",
    param: "",
    comment: "STATUS_TN_3 — статус телеметрического блока 3",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_4",
    param: "",
    comment: "STATUS_TN_4 — статус телеметрического блока 4",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_5",
    param: "",
    comment: "STATUS_TN_5 — статус телеметрического блока 5",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_6",
    param: "",
    comment: "STATUS_TN_6 — статус телеметрического блока 6",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_7",
    param: "",
    comment: "STATUS_TN_7 — статус телеметрического блока 7",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_8",
    param: "",
    comment: "STATUS_TN_8 — статус телеметрического блока 8",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_9",
    param: "",
    comment: "STATUS_TN_9 — статус телеметрического блока 9",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_10",
    param: "",
    comment: "STATUS_TN_10 — статус телеметрического блока 10",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_11",
    param: "",
    comment: "STATUS_TN_11 — статус телеметрического блока 11",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_12",
    param: "",
    comment: "STATUS_TN_12 — статус телеметрического блока 12",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_13",
    param: "",
    comment: "STATUS_TN_13 — статус телеметрического блока 13",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_14",
    param: "",
    comment: "STATUS_TN_14 — статус телеметрического блока 14",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_15",
    param: "",
    comment: "STATUS_TN_15 — статус телеметрического блока 15",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_16",
    param: "",
    comment: "STATUS_TN_16 — статус телеметрического блока 16",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_17",
    param: "",
    comment: "STATUS_TN_17 — статус телеметрического блока 17",
    dataType: "Short",
    group: "STATUS",
  },
  {
    key: "Status_TN_18",
    param: "",
    comment: "STATUS_TN_18 — статус телеметрического блока 18",
    dataType: "Short",
    group: "STATUS",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Температуры блоков ТН
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Temp_TN_0",
    param: "",
    comment: "TEMP_TN_0 — температура телеметрического блока 0",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_1",
    param: "",
    comment: "TEMP_TN_1 — температура телеметрического блока 1",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_2",
    param: "",
    comment: "TEMP_TN_2 — температура телеметрического блока 2",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_3",
    param: "",
    comment: "TEMP_TN_3 — температура телеметрического блока 3",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_4",
    param: "",
    comment: "TEMP_TN_4 — температура телеметрического блока 4",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_5",
    param: "",
    comment: "TEMP_TN_5 — температура телеметрического блока 5",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_6",
    param: "",
    comment: "TEMP_TN_6 — температура телеметрического блока 6",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_7",
    param: "",
    comment: "TEMP_TN_7 — температура телеметрического блока 7",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_8",
    param: "",
    comment: "TEMP_TN_8 — температура телеметрического блока 8",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_9",
    param: "",
    comment: "TEMP_TN_9 — температура телеметрического блока 9",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_10",
    param: "",
    comment: "TEMP_TN_10 — температура телеметрического блока 10",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_11",
    param: "",
    comment: "TEMP_TN_11 — температура телеметрического блока 11",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_12",
    param: "",
    comment: "TEMP_TN_12 — температура телеметрического блока 12",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_13",
    param: "",
    comment: "TEMP_TN_13 — температура телеметрического блока 13",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_14",
    param: "",
    comment: "TEMP_TN_14 — температура телеметрического блока 14",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_15",
    param: "",
    comment: "TEMP_TN_15 — температура телеметрического блока 15",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_16",
    param: "",
    comment: "TEMP_TN_16 — температура телеметрического блока 16",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_17",
    param: "",
    comment: "TEMP_TN_17 — температура телеметрического блока 17",
    dataType: "Float",
    group: "TEMP",
  },
  {
    key: "Temp_TN_18",
    param: "",
    comment: "TEMP_TN_18 — температура телеметрического блока 18",
    dataType: "Float",
    group: "TEMP",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Time
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Time",
    param: "0150",
    comment: "Time — время (мс)",
    dataType: "Float",
    group: "АВИОНИКА",
  },

  // ══════════════════════════════════════════════════════════════════
  //  IG — система измерения газов
  // ══════════════════════════════════════════════════════════════════
  {
    key: "IG_RY1_Open",
    param: "0271",
    comment: "IG_RY1_open — реле 1 открыто",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_RY2_Open",
    param: "0272",
    comment: "IG_RY2_open — реле 2 открыто",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_RY3_Open",
    param: "0272",
    comment: "IG_RY3_open — реле 3 открыто",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_RY3_Close",
    param: "0272",
    comment: "IG_RY3_close — реле 3 закрыто",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_K1_Open",
    param: "0271",
    comment: "IG_K1_open — контактор 1 открыт",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_K2_Open",
    param: "0271",
    comment: "IG_K2_open — контактор 2 открыт",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_Block_Fault",
    param: "0271",
    comment: "IG_block_fault — неисправность блока",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_System_Fault",
    param: "0271",
    comment: "IG_system_fault — системная неисправность",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_O2_1",
    param: "046",
    comment: "IG_O2_1 — концентрация кислорода, датчик 1",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_O2_2",
    param: "046",
    comment: "IG_O2_2 — концентрация кислорода, датчик 2",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_T3",
    param: "",
    comment: "IG_T3 — температура, датчик 3",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_T4",
    param: "",
    comment: "IG_T4 — температура, датчик 4",
    dataType: "Float",
    group: "IG",
  },
  {
    key: "IG_T5",
    param: "",
    comment: "IG_T5 — температура, датчик 5",
    dataType: "Float",
    group: "IG",
  },

  // ══════════════════════════════════════════════════════════════════
  //  Статика — параметры статической прочности
  // ══════════════════════════════════════════════════════════════════
  {
    key: "Stat_L",
    param: "",
    comment: "Stat_L — статика левая (блок 3, слот 9, линия 1, задача 1, минор 7, offset 320 бит)",
    dataType: "Short",
    group: "СТАТИКА",
  },
  {
    key: "Stat_R",
    param: "",
    comment: "Stat_R — статика правая (блок 3, слот 9, линия 4, задача 1, минор 5, offset 560 бит)",
    dataType: "Short",
    group: "СТАТИКА",
  },
  {
    key: "Stat_Kil",
    param: "",
    comment: "Stat_Kil — статика киля (raw, блок 1, слот 1, канал 10)",
    dataType: "Int16",
    group: "СТАТИКА",
  },
  {
    key: "Stat_Stab",
    param: "",
    comment: "Stat_Stab — статика стабилизатора (raw, блок 1, слот 1, канал 9)",
    dataType: "Int16",
    group: "СТАТИКА",
  },
];

// ═══════════════════════════════════════════════════════════════════
//  Утилиты, производные от каталога
// ═══════════════════════════════════════════════════════════════════

/** Набор ключей PFD (Primary Flight Display) в порядке важности */
export const PFD_KEYS = [
  "RadioAltitude",
  "DME_Distance",
  "MagneticHeading",
  "RollAngle",
  "PitchAngle",
  "NormalG",
  "CAS",
  "Vy",
  "Time",
] as const;

export type PfdKey = (typeof PFD_KEYS)[number];

/** Построить ParameterSchema (формат UdpServerConfig) */
export function buildParameterSchema(): Record<string, { Type: ParameterType }> {
  const schema: Record<string, { Type: ParameterType }> = {};
  for (const entry of FIELD_CATALOG) {
    schema[entry.key] = { Type: entry.dataType };
  }
  return schema;
}

/** Карта: ключ → русский комментарий */
export function buildCommentMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of FIELD_CATALOG) {
    map[entry.key] = entry.comment;
  }
  return map;
}

/** Карта: ключ → ARINC param */
export function buildParamMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const entry of FIELD_CATALOG) {
    map[entry.key] = entry.param;
  }
  return map;
}

/** Карта: старый ключ → новый ключ (для обратной совместимости) */
export const OLD_TO_NEW_KEY: Record<string, string> = {
  // АВИОНИКА — основные
  RAltitude: "RadioAltitude",
  DME_DIST: "DME_Distance",
  Heading1: "MagneticHeading",
  Ny: "NormalG",
  // ДВИГАТЕЛИ
  N1SELDISP_L: "Engine_N1_Left",
  N1_BLUE_L: "Engine_N1_Target_Left",
  N1SELDISP_R: "Engine_N1_Right",
  N1_BLUE_R: "Engine_N1_Target_Right",
  // ШАССИ
  LG_UPLOCK: "LG_Uplock",
  LG_DOWNLOCK: "LG_Downlock",
  RG_UPLOCK: "RG_Uplock",
  RG_DOWNLOCK: "RG_Downlock",
  NG_UPLOCK: "NG_Uplock",
  NG_DOWNLOCK: "NG_Downlock",
  // ВСУ
  APU: "APU_Speed",
  APU_TEMP: "APU_OilTemp",
  P_oil_filter_APU: "APU_OilPressure",
  // КСКВ
  DT_REF_1: "ECS_TargetTemp_1",
  DT_REF_2: "ECS_TargetTemp_2",
  DT_REF_4: "ECS_TargetTemp_4",
  // БРУ
  BRUxL: "FCU_Roll_Left",
  BRUyL: "FCU_Pitch_Left",
  BRUxR: "FCU_Roll_Right",
  BRUyR: "FCU_Pitch_Right",
  // АВИОНИКА — расширенные
  Standard_Altitude: "StandardAltitude",
  Hbar1: "BaroAltitude",
  AP_ON: "AutopilotOn",
  FD_ON: "FlightDirectorOn",
  HDG_ON: "HeadingHoldOn",
  HDG_TRK_Selected: "HeadingSelect",
  Vy_Select: "VerticalSpeedSelect",
  Alt_Select: "SpeedSelect",
  Roll_FD: "FD_RollCmd",
  Pitch_FD: "FD_PitchCmd",
  // КСУ
  FlapsSlat: "FlapsLever",
  Slat: "SlatsPosition",
  Flap: "FlapsPosition",
  InterceptorCenterLeft: "Spoil_Left_Center",
  InterceptorCenterRight: "Spoil_Right_Center",
  InterceptorOuterLeft: "Spoil_Left_Outer",
  InterceptorInnerLeft: "Spoil_Left_Inner",
  InterceptorInnerRight: "Spoil_Right_Inner",
  InterceptorOuterRight: "Spoil_Right_Outer",
  BrakeFlapsInner: "Airbrake_Inner_Cmd",
  BrakeFlapsOuter: "Airbrake_Outer_Cmd",
  STAB: "StabPosition",
  Rudder_up: "Rudder_Upper",
  Rudder_down: "Rudder_Lower",
  Rudder_med: "Rudder_Middle",
  Trimmer_rudder: "RudderTrim",
  ElevatorRight_O: "Elev_Right_Outer",
  ElevatorLeft_O: "Elev_Left_Outer",
  ElevatorLeft_I: "Elev_Left_Inner",
  ElevatorRight_I: "Elev_Right_Inner",
  AileronRight_I: "Ail_Right_Inner",
  AileronLeft_I: "Ail_Left_Inner",
  AileronLeft_O: "Ail_Left_Outer",
  AileronRight_O: "Ail_Right_Outer",
  Trimmer_aileron: "AileronTrim",
  // STATUS_* → Status_*
  STATUS_7: "Status_7",
  STATUS_5: "Status_5",
  STATUS_6: "Status_6",
  STATUS_8: "Status_8",
  STATUS_TN_0: "Status_TN_0",
  STATUS_TN_1: "Status_TN_1",
  STATUS_TN_2: "Status_TN_2",
  STATUS_TN_3: "Status_TN_3",
  STATUS_TN_4: "Status_TN_4",
  STATUS_TN_5: "Status_TN_5",
  STATUS_TN_6: "Status_TN_6",
  STATUS_TN_7: "Status_TN_7",
  STATUS_TN_8: "Status_TN_8",
  STATUS_TN_9: "Status_TN_9",
  STATUS_TN_10: "Status_TN_10",
  STATUS_TN_11: "Status_TN_11",
  STATUS_TN_12: "Status_TN_12",
  STATUS_TN_13: "Status_TN_13",
  STATUS_TN_14: "Status_TN_14",
  STATUS_TN_15: "Status_TN_15",
  STATUS_TN_16: "Status_TN_16",
  STATUS_TN_17: "Status_TN_17",
  STATUS_TN_18: "Status_TN_18",
  TEMP_TN_0: "Temp_TN_0",
  TEMP_TN_1: "Temp_TN_1",
  TEMP_TN_2: "Temp_TN_2",
  TEMP_TN_3: "Temp_TN_3",
  TEMP_TN_4: "Temp_TN_4",
  TEMP_TN_5: "Temp_TN_5",
  TEMP_TN_6: "Temp_TN_6",
  TEMP_TN_7: "Temp_TN_7",
  TEMP_TN_8: "Temp_TN_8",
  TEMP_TN_9: "Temp_TN_9",
  TEMP_TN_10: "Temp_TN_10",
  TEMP_TN_11: "Temp_TN_11",
  TEMP_TN_12: "Temp_TN_12",
  TEMP_TN_13: "Temp_TN_13",
  TEMP_TN_14: "Temp_TN_14",
  TEMP_TN_15: "Temp_TN_15",
  TEMP_TN_16: "Temp_TN_16",
  TEMP_TN_17: "Temp_TN_17",
  TEMP_TN_18: "Temp_TN_18",
  IG_RY1_open: "IG_RY1_Open",
  IG_RY2_open: "IG_RY2_Open",
  IG_RY3_open: "IG_RY3_Open",
  IG_RY3_close: "IG_RY3_Close",
  IG_K1_open: "IG_K1_Open",
  IG_K2_open: "IG_K2_Open",
  IG_block_fault: "IG_Block_Fault",
  IG_system_fault: "IG_System_Fault",
};
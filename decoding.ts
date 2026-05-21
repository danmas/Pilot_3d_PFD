/**
 * Декодирование телеметрического бинарного потока.
 *
 * АРХИТЕКТУРА (два независимых источника):
 *   1. out.json — ЕДИНСТВЕННЫЙ источник байтовой раскладки.
 *      Содержит массив слотов для каждого UDP-порта в том порядке,
 *      в котором tnparserrt упаковывает бинарные значения.
 *
 *   2. field-catalog.ts — источник имён, типов и метаданных.
 *      Сопоставляется со слотами out.json по ARINC param (метка 429),
 *      а для без-параметровых полей (статусы, температуры блоков) —
 *      по позиционному индексу.
 *
 * ВАЛИДАЦИЯ ПРИ СТАРТЕ:
 *   - Каждый слот out.json должен найти соответствие в каталоге.
 *   - Каждая запись каталога должна найти слот.
 *   - Несовпадения → WARNING в консоль, но работа продолжается.
 *
 * dec_ ПРЕФИКС:
 *   Параметры с префиксом dec_ — расчётные, отсутствуют в потоке парсера.
 *   Вычисляются после декодирования функцией applyDecFormulas().
 *   Без префикса — прямые значения из бинарного потока.
 */

import fs from "node:fs";
import path from "node:path";
import type { FieldEntry, ParameterType } from "./field-catalog";

// ── types ──────────────────────────────────────────────────────────

/** Один слот в out.json (описывает что tnparserrt извлекает из телеметрии) */
export interface SlotDef {
  name?: string;
  block: string;
  slot: string;
  channel?: string;
  mode?: string;
  param?: string;
  msb?: string;
  lsb?: string;
  price?: string;
  sdi?: string;
  sign?: string;
  line?: string;
  task?: string;
  minor?: string;
  offset_bits?: string;
}

/** Конфигурация одного UDP-потока в out.json */
export interface StreamConfig {
  state: string;
  host: string;
  port: string;
  tickcount: string;
  slots: SlotDef[];
}

/** Элемент схемы декодирования: имя поля, тип, размер в байтах */
export interface FieldSlotMapping {
  key: string;
  type: ParameterType;
  byteSize: number;
  /** true если слот НЕ найден в каталоге (присвоено автоимя) */
  autoNamed: boolean;
  /** Строка предупреждения или undefined */
  warning?: string;
}

/** Результат загрузки схемы */
export interface DecodeSchema {
  mappings: FieldSlotMapping[];
  warnings: string[];
  /** Полный размер фрейма в байтах (сумма byteSize всех полей) */
  frameBytes: number;
}

// ── загрузка out.json ──────────────────────────────────────────────

/**
 * Читает out.json (JSONC с комментариями), возвращает массив StreamConfig.
 * __dirname передаётся вызывающей стороной (bridge-plugin.ts).
 * Путь по умолчанию: ../out.json относительно __dirname (Pilot_3d_PFD/).
 */
export function loadOutJson(__dirname: string, filePath?: string): StreamConfig[] {
  const resolved = filePath ?? path.resolve(__dirname, "..", "out.json");
  const raw = fs.readFileSync(resolved, "utf8").replace(/^\uFEFF/, "");
  const cleaned = stripJsonComments(raw);
  const noTrailing = cleaned.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(noTrailing) as StreamConfig[];
}

/** Найти конфигурацию потока для заданного порта */
export function findStreamForPort(
  configs: StreamConfig[],
  port: number,
): StreamConfig | undefined {
  return configs.find(
    (c) => c.state === "on" && Number(c.port) === port,
  );
}

// ── построение схемы декодирования ─────────────────────────────────

/**
 * Строит схему декодирования: сопоставляет слоты out.json с каталогом field-catalog.ts.
 *
 * Стратегия сопоставления (двухпроходная):
 *   1. Слоты с ARINC param → поиск в каталоге по param.
 *   2. Оставшиеся слоты → позиционное сопоставление с оставшимися записями каталога.
 *   3. Слоты без соответствия → автоимя slot_NNN_XXXX с типом Float.
 *   4. Записи каталога без слота → warning.
 */
export function buildDecodeSchema(
  slots: SlotDef[],
  catalog: FieldEntry[],
): DecodeSchema {
  const warnings: string[] = [];
  const mappings: FieldSlotMapping[] = [];

  // Индексируем каталог: param → entry для param-полей; индекс → entry для без-параметровых
  const catalogByParam = new Map<string, { entry: FieldEntry; idx: number }>();
  const catalogNoParam: { entry: FieldEntry; idx: number }[] = [];

  for (let i = 0; i < catalog.length; i++) {
    const entry = catalog[i];
    if (entry.param && entry.param.length > 0) {
      catalogByParam.set(entry.param, { entry, idx: i });
    } else {
      catalogNoParam.push({ entry, idx: i });
    }
  }

  const usedCatalogIndices = new Set<number>();
  let noParamCursor = 0;

  for (let slotIdx = 0; slotIdx < slots.length; slotIdx++) {
    const slot = slots[slotIdx];
    const param = slot.param?.trim() ?? "";

    let matched: { entry: FieldEntry; idx: number } | undefined;

    if (param.length > 0) {
      // Проход 1: ищем по ARINC param
      matched = catalogByParam.get(param);
    }

    if (!matched) {
      // Проход 2: позиционное сопоставление для без-параметровых полей
      while (noParamCursor < catalogNoParam.length) {
        const candidate = catalogNoParam[noParamCursor];
        noParamCursor++;
        if (!usedCatalogIndices.has(candidate.idx)) {
          matched = candidate;
          break;
        }
      }
    }

    if (matched && usedCatalogIndices.has(matched.idx)) {
      // Уже использовано (дубликат) — пытаемся найти другой
      matched = undefined;
    }

    if (matched) {
      usedCatalogIndices.add(matched.idx);
      const e = matched.entry;
      mappings.push({
        key: e.key,
        type: e.dataType,
        byteSize: byteSizeOf(e.dataType),
        autoNamed: false,
      });
    } else {
      // Слот без соответствия в каталоге — автоимя
      const autoKey = param
        ? `slot_${param}_auto`
        : `slot_${slotIdx}_auto`;
      warnings.push(
        `Slot #${slotIdx} ${param ? "param=" + param : "no-param"} not found in field-catalog.ts → auto-named "${autoKey}"`,
      );
      mappings.push({
        key: autoKey,
        type: "Float",
        byteSize: 4,
        autoNamed: true,
      });
    }
  }

  // Проверяем неиспользованные записи каталога
  for (let i = 0; i < catalog.length; i++) {
    if (!usedCatalogIndices.has(i)) {
      const entry = catalog[i];
      warnings.push(
        `Catalog entry "${entry.key}" (param=${entry.param || "none"}) has no matching slot in out.json → will be null`,
      );
    }
  }

  const frameBytes = mappings.reduce((sum, m) => sum + m.byteSize, 0);

  return { mappings, warnings, frameBytes };
}

// ── декодирование бинарного буфера ─────────────────────────────────

/**
 * Декодирует бинарный буфер в плоский словарь { key: number | null }.
 * Порядок чтения — строго по mappings (соответствует порядку слотов в out.json).
 */
export function decodePayload(
  buffer: Buffer,
  schema: DecodeSchema,
): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  let offset = 0;

  for (const mapping of schema.mappings) {
    if (offset + mapping.byteSize > buffer.length) {
      // Буфер кончился раньше схемы — remaining fields = null
      result[mapping.key] = null;
      continue;
    }
    result[mapping.key] = readNumber(buffer, offset, mapping.type);
    offset += mapping.byteSize;
  }

  return result;
}

// ── расчётные поля (dec_ префикс) ──────────────────────────────────

/**
 * Формулы для расчётных параметров.
 * Ключ — dec_имя, значение — функция от декодированного словаря → число или null.
 */
const DEC_FORMULAS: Record<
  string,
  (decoded: Record<string, number | null>) => number | null
> = {
  /** Барометрическая высота в футах: BaroAltitude (метры) × 3.28084 */
  dec_BaroAltFt: (d) => {
    const m = d.BaroAltitude;
    return Number.isFinite(m) ? (m as number) * 3.28084 : null;
  },

  /** Радиовысота в футах: RadioAltitude (метры?) × 3.28084 */
  dec_RadioAltFt: (d) => {
    const m = d.RadioAltitude;
    return Number.isFinite(m) ? (m as number) * 3.28084 : null;
  },

  /** Скорость в узлах из Mach (приблизительно, для справки) */
  dec_MachKnots: (d) => {
    const mach = d.MachNumber;
    return Number.isFinite(mach) ? (mach as number) * 661.5 : null;
  },

  /** G (перегрузка) — семантический алиас NormalG */
  dec_G: (d) => {
    const ny = d.NormalG;
    return Number.isFinite(ny) ? (ny as number) : null;
  },
};

/**
 * Применяет расчётные формулы к декодированному словарю.
 * Добавляет ключи с префиксом dec_ (не заменяет существующие).
 */
export function applyDecFormulas(
  decoded: Record<string, number | null>,
): Record<string, number | null> {
  const enriched = { ...decoded };
  for (const [key, formula] of Object.entries(DEC_FORMULAS)) {
    enriched[key] = formula(decoded);
  }
  return enriched;
}

// ── проверка целостности ───────────────────────────────────────────

/**
 * Сравнивает схему из out.json с каталогом и возвращает отчёт.
 * Полезно для отладки при ручном редактировании out.json / field-catalog.ts.
 */
export function validateSchema(
  schema: DecodeSchema,
): { valid: boolean; report: string } {
  const lines: string[] = [
    `Decode schema: ${schema.mappings.length} fields, ${schema.frameBytes} bytes/frame`,
    `Warnings: ${schema.warnings.length}`,
    "",
  ];

  if (schema.warnings.length > 0) {
    lines.push("⚠ WARNINGS:");
    for (const w of schema.warnings) {
      lines.push(`  • ${w}`);
    }
    lines.push("");
  }

  const autoNamed = schema.mappings.filter((m) => m.autoNamed).length;
  const cataloged = schema.mappings.filter((m) => !m.autoNamed).length;

  lines.push(`Fields from catalog: ${cataloged}`);
  lines.push(`Auto-named fields:  ${autoNamed}`);
  lines.push(`Total frame size:   ${schema.frameBytes} bytes`);

  if (autoNamed > 0) {
    lines.push("");
    lines.push("Auto-named fields (verify these!):");
    for (const m of schema.mappings) {
      if (m.autoNamed) lines.push(`  ${m.key} (${m.type}, ${m.byteSize}B)`);
    }
  }

  return {
    valid: schema.warnings.length === 0 && autoNamed === 0,
    report: lines.join("\n"),
  };
}

// ── helpers ────────────────────────────────────────────────────────

function byteSizeOf(t: ParameterType): number {
  switch (t) {
    case "Double":
      return 8;
    case "Float":
    case "Int32":
    case "UInt32":
      return 4;
    case "Int16":
    case "Short":
    case "UInt16":
      return 2;
    case "Byte":
    case "UInt8":
    case "Int8":
      return 1;
    default:
      throw new Error(`Unsupported type: ${t}`);
  }
}

function readNumber(
  buffer: Buffer,
  offset: number,
  t: ParameterType,
): number {
  switch (t) {
    case "Double":
      return buffer.readDoubleLE(offset);
    case "Float":
      return buffer.readFloatLE(offset);
    case "Int32":
      return buffer.readInt32LE(offset);
    case "UInt32":
      return buffer.readUInt32LE(offset);
    case "Int16":
    case "Short":
      return buffer.readInt16LE(offset);
    case "UInt16":
      return buffer.readUInt16LE(offset);
    case "Byte":
    case "UInt8":
      return buffer.readUInt8(offset);
    case "Int8":
      return buffer.readInt8(offset);
    default:
      throw new Error(`Unsupported type: ${t}`);
  }
}

// Удаляет // и / * * / комментарии из JSON-подобной строки
function stripJsonComments(input: string): string {
  let out = "";
  let inStr = false;
  let esc = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const n = input[i + 1];

    if (inStr) {
      out += c;
      esc = c === "\\" && !esc;
      if (c === '"' && !esc) inStr = false;
      if (c !== "\\") esc = false;
      continue;
    }

    if (c === '"') {
      inStr = true;
      out += c;
      continue;
    }

    if (c === "/" && n === "/") {
      while (i < input.length && input[i] !== "\n") i++;
      out += "\n";
      continue;
    }

    if (c === "/" && n === "*") {
      i += 2;
      while (i < input.length - 1 && !(input[i] === "*" && input[i + 1] === "/"))
        i++;
      i++; // skip '/'
      continue;
    }

    out += c;
  }

  return out;
}

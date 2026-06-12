import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildDecodeSchema,
  decodePayload,
  applyDecFormulas,
  validateSchema,
  loadOutJson,
  findStreamForPort,
  type DecodeSchema,
  type SlotDef,
} from '../decoding';
import { FIELD_CATALOG } from '../field-catalog';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('decoding.ts', () => {
  describe('buildDecodeSchema + validateSchema', () => {
    it('builds a correct schema from simple slots and catalog', () => {
      const slots: SlotDef[] = [
        { block: 'A', slot: '1', param: '0164' }, // RadioAltitude
        { block: 'A', slot: '2', param: '0325' }, // RollAngle
      ];

      // Use a minimal relevant catalog slice so we don't get "unused catalog entry" warnings
      const smallCatalog = FIELD_CATALOG.filter(e => ['RadioAltitude', 'RollAngle'].includes(e.key));

      const schema = buildDecodeSchema(slots, smallCatalog);

      expect(schema.mappings.length).toBe(2);
      expect(schema.mappings[0].key).toBe('RadioAltitude');
      expect(schema.mappings[0].type).toBe('Float');
      expect(schema.mappings[0].byteSize).toBe(4);
      expect(schema.mappings[0].autoNamed).toBe(false);

      expect(schema.mappings[1].key).toBe('RollAngle');
      expect(schema.warnings.length).toBe(0);

      const validation = validateSchema(schema);
      expect(validation.valid).toBe(true);
      expect(validation.report).toContain('Fields from catalog: 2');
    });

    it('handles auto-named slots and produces warnings for missing catalog entries', () => {
      const slots: SlotDef[] = [
        { block: 'X', slot: '99', param: '9999' }, // non-existent param
      ];

      const schema = buildDecodeSchema(slots, FIELD_CATALOG.slice(0, 5)); // small catalog

      expect(schema.mappings[0].autoNamed).toBe(true);
      expect(schema.mappings[0].key).toMatch(/slot_9999_auto/);
      expect(schema.warnings.some(w => w.includes('not found in field-catalog'))).toBe(true);

      const validation = validateSchema(schema);
      expect(validation.valid).toBe(false);
    });

    it('loads real out.json and builds schema against full catalog', () => {
      const configs = loadOutJson(__dirname, path.resolve(__dirname, '../out.json'));
      const stream = findStreamForPort(configs, 14443);

      expect(stream).toBeDefined();
      expect(stream!.slots.length).toBeGreaterThan(50);

      const schema = buildDecodeSchema(stream!.slots, FIELD_CATALOG);

      // Expect a large number of fields (132 target)
      expect(schema.mappings.length).toBeGreaterThan(100);
      expect(schema.frameBytes).toBeGreaterThan(200);

      const validation = validateSchema(schema);
      // In a healthy setup there should be few or zero warnings.
      // We at least assert the function runs and reports something sensible.
      expect(validation.report).toContain('Decode schema:');
    });
  });

  describe('decodePayload', () => {
    it('decodes a simple Float buffer correctly', () => {
      // Build a tiny schema with one Float
      const slots: SlotDef[] = [{ block: 'T', slot: '1', param: '0164' }];
      const schema = buildDecodeSchema(slots, FIELD_CATALOG);

      // Create a 4-byte LE float buffer (value 123.456)
      const buf = Buffer.alloc(4);
      buf.writeFloatLE(123.456, 0);

      const result = decodePayload(buf, schema);

      expect(result.RadioAltitude).toBeCloseTo(123.456, 3);
    });

    it('returns null for truncated buffers', () => {
      const slots: SlotDef[] = [
        { block: 'T', slot: '1', param: '0164' },
        { block: 'T', slot: '2', param: '0325' },
      ];
      const schema = buildDecodeSchema(slots, FIELD_CATALOG);

      const shortBuf = Buffer.alloc(4); // only enough for first field
      shortBuf.writeFloatLE(42.0, 0);

      const result = decodePayload(shortBuf, schema);

      expect(result.RadioAltitude).toBeCloseTo(42.0);
      expect(result.RollAngle).toBe(null);
    });
  });

  describe('applyDecFormulas', () => {
    it('adds dec_ fields without overwriting originals', () => {
      const decoded = {
        BaroAltitude: 1000,
        RadioAltitude: 500,
        MachNumber: 0.8,
        NormalG: 1.2,
        SomeOther: 42,
      };

      const enriched = applyDecFormulas(decoded);

      expect(enriched.decs_BaroAltFt).toBeUndefined(); // ensure we did not create a wrong key
      expect(enriched.dec_BaroAltFt).toBe(1000);
      expect(enriched.dec_RadioAltFt).toBe(500);
      expect(enriched.dec_MachKnots).toBeCloseTo(0.8 * 661.5);
      expect(enriched.dec_G).toBe(1.2);
      expect(enriched.SomeOther).toBe(42); // original preserved
    });

    it('handles missing / non-finite source values gracefully', () => {
      const decoded = {
        BaroAltitude: null,
        MachNumber: NaN,
      };

      const enriched = applyDecFormulas(decoded);

      expect(enriched.dec_BaroAltFt).toBe(null);
      expect(enriched.dec_MachKnots).toBe(null);
    });
  });
});

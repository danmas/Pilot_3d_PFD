import { describe, it, expect } from 'vitest';
import { toDisplayPoints } from './chart-decimator.js';
import type { SamplePoint } from './types.js';

function makeSamples(values: number[], timeOffset = 0): SamplePoint[] {
  return values.map((v, i) => ({
    timeSec: timeOffset + i * 0.04, // 25 Hz
    value: v,
    valid: true,
  }));
}

describe('ChartDecimator', () => {
  it('returns empty for empty input', () => {
    const result = toDisplayPoints([], 0, 10, 100);
    expect(result).toEqual([]);
  });

  it('returns all points when count <= maxPoints (uniformStride)', () => {
    const samples = makeSamples([1, 2, 3, 4, 5]);
    const result = toDisplayPoints(samples, 0, 10, 10);
    expect(result).toHaveLength(5);
    expect(result[0].y).toBe(1);
    expect(result[4].y).toBe(5);
  });

  it('filters by time window', () => {
    const samples = makeSamples([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 0);
    const result = toDisplayPoints(samples, 0.1, 0.3, 10);
    // Only points with timeSec between 0.1 and 0.3
    expect(result.length).toBeGreaterThanOrEqual(2);
    for (const p of result) {
      expect(p.x).toBeGreaterThanOrEqual(0.1);
      expect(p.x).toBeLessThanOrEqual(0.3);
    }
  });

  it('preserves min/max peaks with minMaxBuckets', () => {
    // Create a signal with sharp peaks
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      values.push(Math.sin(i * 0.1) + 0.5 * Math.sin(i * 0.03));
    }
    const samples = makeSamples(values, 0);

    // Decimate to ~20 points
    const result = toDisplayPoints(samples, 0, 40, 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.length).toBeGreaterThanOrEqual(2);

    // The maximum should be close to the original max (~1.5)
    const originalMax = Math.max(...values);
    const decimatedMax = Math.max(...result.map(p => p.y));
    expect(decimatedMax).toBeCloseTo(originalMax, 0);
  });

  it('preserves min/max valleys with minMaxBuckets', () => {
    const values: number[] = [];
    for (let i = 0; i < 1000; i++) {
      values.push(Math.cos(i * 0.05));
    }
    const samples = makeSamples(values, 0);

    const result = toDisplayPoints(samples, 0, 40, 40);

    const originalMin = Math.min(...values);
    const decimatedMin = Math.min(...result.map(p => p.y));
    expect(decimatedMin).toBeCloseTo(originalMin, 1);
  });

  it('uses uniformStride when points <= maxPoints', () => {
    const samples = makeSamples([10, 20, 30]);
    const result = toDisplayPoints(samples, 0, 10, 10);
    expect(result).toHaveLength(3);
    expect(result[0].y).toBe(10);
    expect(result[1].y).toBe(20);
    expect(result[2].y).toBe(30);
  });

  it('returns sorted by time', () => {
    const samples = makeSamples([5, 3, 8, 1, 9, 2, 7, 4, 6], 0);
    const result = toDisplayPoints(samples, 0, 10, 100);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].x).toBeGreaterThanOrEqual(result[i - 1].x);
    }
  });
});

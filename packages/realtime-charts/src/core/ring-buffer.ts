// ─── Ring Buffer ───
// Capacity 3000 points per tracked key, overwrites oldest when full.
// samplesInWindow traverses from newest to oldest.

import type { SamplePoint } from './types.js';

export const RING_CAPACITY = 3000;

/** Small epsilon for float time comparisons */
const EPS = 1e-9;

export class RingBuffer {
  private readonly buf: SamplePoint[];
  private head: number = 0;
  count: number = 0;

  constructor() {
    this.buf = new Array(RING_CAPACITY);
  }

  /** Push a point. Overwrites oldest if full. */
  push(timeSec: number, value: number, valid: boolean): void {
    this.buf[this.head] = { timeSec, value, valid };
    this.head = (this.head + 1) % RING_CAPACITY;
    if (this.count < RING_CAPACITY) {
      this.count++;
    }
  }

  /** Return points in [tMin, tMax] in chronological order (old → new). */
  samplesInWindow(tMin: number, tMax: number): SamplePoint[] {
    if (this.count === 0) return [];

    const result: SamplePoint[] = [];
    const len = this.count;
    const startIdx = this.head; // one past the newest

    // Walk from newest to oldest
    for (let i = 0; i < len; i++) {
      const idx = (startIdx - 1 - i + RING_CAPACITY) % RING_CAPACITY;
      const pt = this.buf[idx];
      if (!pt) continue;
      if (!pt.valid) continue;
      if (pt.timeSec > tMax + EPS) continue;
      if (pt.timeSec < tMin - EPS) break; // stopped — earlier points are even older
      result.push(pt);
    }

    // Reverse to chronological order
    result.reverse();
    return result;
  }

  /** Number of valid points stored */
  size(): number {
    return this.count;
  }
}

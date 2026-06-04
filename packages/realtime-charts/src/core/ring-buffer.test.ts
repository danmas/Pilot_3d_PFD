import { describe, it, expect } from 'vitest';
import { RingBuffer, RING_CAPACITY } from './ring-buffer.js';

describe('RingBuffer', () => {
  it('starts empty', () => {
    const rb = new RingBuffer();
    expect(rb.size()).toBe(0);
    expect(rb.samplesInWindow(0, 100)).toEqual([]);
  });

  it('stores and retrieves points', () => {
    const rb = new RingBuffer();
    rb.push(1.0, 100, true);
    rb.push(2.0, 200, true);
    rb.push(3.0, 300, true);

    const result = rb.samplesInWindow(0, 10);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(100);
    expect(result[1].value).toBe(200);
    expect(result[2].value).toBe(300);
  });

  it('filters by time window', () => {
    const rb = new RingBuffer();
    rb.push(1.0, 100, true);
    rb.push(2.0, 200, true);
    rb.push(3.0, 300, true);
    rb.push(4.0, 400, true);
    rb.push(5.0, 500, true);

    const result = rb.samplesInWindow(2.0, 4.0);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(200);
    expect(result[1].value).toBe(300);
    expect(result[2].value).toBe(400);
  });

  it('skips invalid points', () => {
    const rb = new RingBuffer();
    rb.push(1.0, 100, true);
    rb.push(2.0, 200, false);
    rb.push(3.0, 300, true);

    const result = rb.samplesInWindow(0, 10);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(100);
    expect(result[1].value).toBe(300);
  });

  it('stops when timeSec < tMin (traversal from newest)', () => {
    const rb = new RingBuffer();
    // Push points out of order but expect to find correct window
    rb.push(10.0, 1000, true);
    rb.push(20.0, 2000, true);
    rb.push(30.0, 3000, true);
    rb.push(40.0, 4000, true);
    rb.push(50.0, 5000, true);

    // Should only return points within [15, 45]
    const result = rb.samplesInWindow(15, 45);
    expect(result).toHaveLength(3);
    expect(result[0].value).toBe(2000);
    expect(result[1].value).toBe(3000);
    expect(result[2].value).toBe(4000);
  });

  it('overwrites oldest when full', () => {
    const rb = new RingBuffer();
    // Fill to capacity
    for (let i = 0; i < RING_CAPACITY + 50; i++) {
      rb.push(i * 1.0, i, true);
    }

    expect(rb.size()).toBe(RING_CAPACITY);
    // Oldest point should be overwritten; first valid should be ~50
    const result = rb.samplesInWindow(0, RING_CAPACITY + 100);
    expect(result[0].value).toBe(50); // RING_CAPACITY+50 - RING_CAPACITY = 50
    expect(result).toHaveLength(RING_CAPACITY);
  });

  it('returns empty for window before all points', () => {
    const rb = new RingBuffer();
    rb.push(10.0, 100, true);
    rb.push(20.0, 200, true);

    expect(rb.samplesInWindow(0, 5)).toEqual([]);
  });

  it('returns empty for window after all points', () => {
    const rb = new RingBuffer();
    rb.push(10.0, 100, true);
    rb.push(20.0, 200, true);

    expect(rb.samplesInWindow(25, 30)).toEqual([]);
  });
});

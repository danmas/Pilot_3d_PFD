// ─── Chart Decimator ───
// Pure functions: filters samples and decimates for display.
// Preserves peaks and valleys using minMaxBuckets strategy.

import type { SamplePoint, DisplayPoint } from './types.js';

/** Filter valid samples within [tMin, tMax] */
function filterSamples(samples: SamplePoint[], tMin: number, tMax: number): SamplePoint[] {
  return samples.filter(s => s.valid && s.timeSec >= tMin && s.timeSec <= tMax);
}

/** Uniform stride — pick evenly-spaced points when we have few samples */
function uniformStride(filtered: SamplePoint[], maxPoints: number): DisplayPoint[] {
  const cap = Math.max(2, maxPoints);
  const len = filtered.length;
  if (len <= cap) {
    return filtered.map(s => ({ x: s.timeSec, y: s.value }));
  }
  const step = len / cap;
  const result: DisplayPoint[] = [];
  for (let i = 0; i < cap; i++) {
    const idx = Math.min(len - 1, Math.floor(i * step));
    result.push({ x: filtered[idx].timeSec, y: filtered[idx].value });
  }
  return result;
}

/** MinMax buckets — preserves peaks/valleys when many points */
function minMaxBuckets(filtered: SamplePoint[], maxPoints: number): DisplayPoint[] {
  const len = filtered.length;
  const bucketCount = Math.max(1, Math.floor(maxPoints / 2));
  const bucketSize = Math.ceil(len / bucketCount);
  const result: DisplayPoint[] = [];

  for (let b = 0; b < bucketCount; b++) {
    const start = b * bucketSize;
    const end = Math.min(start + bucketSize, len);
    if (start >= end) break;

    let minIdx = start;
    let maxIdx = start;

    for (let i = start + 1; i < end; i++) {
      if (filtered[i].value < filtered[minIdx].value) minIdx = i;
      if (filtered[i].value > filtered[maxIdx].value) maxIdx = i;
    }

    // Emit in time order: min first, then max (if different)
    const first = Math.min(minIdx, maxIdx);
    const second = Math.max(minIdx, maxIdx);

    result.push({ x: filtered[first].timeSec, y: filtered[first].value });
    if (first !== second) {
      result.push({ x: filtered[second].timeSec, y: filtered[second].value });
    }
  }

  return result;
}

/**
 * Convert samples to display points with decimation.
 *
 * @param samples - raw samples from ring buffer
 * @param tMin - view window start (seconds)
 * @param tMax - view window end (seconds)
 * @param maxPoints - max points to output (e.g. strip width or plot width)
 * @returns decimated display points, sorted by time
 */
export function toDisplayPoints(
  samples: SamplePoint[],
  tMin: number,
  tMax: number,
  maxPoints: number,
): DisplayPoint[] {
  const filtered = filterSamples(samples, tMin, tMax);
  const cap = Math.max(2, maxPoints);

  if (filtered.length <= cap) {
    return uniformStride(filtered, cap);
  }
  return minMaxBuckets(filtered, cap);
}

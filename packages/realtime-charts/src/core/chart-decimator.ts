// ─── Chart Decimator ───
// Pure functions: decimates samples for display.
// Preserves peaks and valleys using minMaxBuckets strategy.
//
// NOTE: Caller (DataHub.samplesInWindow) already filters by valid + [tMin, tMax].
// We accept samples as-is — no redundant re-filtering.

import type { SamplePoint, DisplayPoint } from './types.js';

/** Uniform stride — pick evenly-spaced points when we have few samples */
function uniformStride(samples: SamplePoint[], maxPoints: number): DisplayPoint[] {
  const cap = Math.max(2, maxPoints);
  const len = samples.length;
  if (len <= cap) {
    return samples.map(s => ({ x: s.timeSec, y: s.value }));
  }
  const step = len / cap;
  const result: DisplayPoint[] = [];
  for (let i = 0; i < cap; i++) {
    const idx = Math.min(len - 1, Math.floor(i * step));
    result.push({ x: samples[idx].timeSec, y: samples[idx].value });
  }
  return result;
}

/** MinMax buckets — preserves peaks/valleys when many points */
function minMaxBuckets(samples: SamplePoint[], maxPoints: number): DisplayPoint[] {
  const len = samples.length;
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
      if (samples[i].value < samples[minIdx].value) minIdx = i;
      if (samples[i].value > samples[maxIdx].value) maxIdx = i;
    }

    // Emit in time order: min first, then max (if different)
    const first = Math.min(minIdx, maxIdx);
    const second = Math.max(minIdx, maxIdx);

    result.push({ x: samples[first].timeSec, y: samples[first].value });
    if (first !== second) {
      result.push({ x: samples[second].timeSec, y: samples[second].value });
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
  _tMin: number,
  _tMax: number,
  maxPoints: number,
): DisplayPoint[] {
  const cap = Math.max(2, maxPoints);

  if (samples.length <= cap) {
    return uniformStride(samples, cap);
  }
  return minMaxBuckets(samples, cap);
}

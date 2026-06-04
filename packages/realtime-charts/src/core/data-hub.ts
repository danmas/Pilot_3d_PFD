// ─── DataHub ───
// Ingests frames, manages ring buffers per key, provides snapshots.

import type { ParamInfo, ChartStripSnapshot, SamplePoint } from './types.js';
import { RingBuffer, RING_CAPACITY } from './ring-buffer.js';

export class DataHub {
  private buffers: Map<string, RingBuffer> = new Map();
  private paramIndex: Map<string, number> = new Map(); // key → index in frame[]
  private paramDisplayName: Map<string, string> = new Map();
  private activeKeys: string[] = [];
  revision: number = 0;
  sessionStartMs: number = 0;
  sessionTimeSec: number = 0;
  private initialized: boolean = false;

  /** Maximum number of tracked keys */
  private maxTrackedKeys: number;

  constructor(maxTrackedKeys: number = 50) {
    this.maxTrackedKeys = maxTrackedKeys;
  }

  /** Configure active parameters from an ordered list of ParamInfo */
  configure(params: ParamInfo[]): void {
    const keys = params.map(p => p.key);
    this.activeKeys = keys.slice(0, this.maxTrackedKeys);

    for (const p of params) {
      if (!this.activeKeys.includes(p.key)) continue;
      this.paramIndex.set(p.key, p.index);
      this.paramDisplayName.set(p.key, p.displayName);
      if (!this.buffers.has(p.key)) {
        this.buffers.set(p.key, new RingBuffer());
      }
    }
  }

  /** Get currently active keys */
  getActiveKeys(): string[] {
    return [...this.activeKeys];
  }

  /** Get display name for a key */
  getDisplayName(key: string): string {
    return this.paramDisplayName.get(key) ?? key;
  }

  /** Ingest a decoded frame */
  ingestFrame(values: number[], epochMs: number): void {
    if (!this.initialized) {
      this.sessionStartMs = epochMs;
      this.initialized = true;
    }

    this.sessionTimeSec = (epochMs - this.sessionStartMs) / 1000;

    for (const key of this.activeKeys) {
      const idx = this.paramIndex.get(key);
      if (idx === undefined) continue;
      const value = idx < values.length ? values[idx] : 0;
      const valid = idx < values.length && Number.isFinite(value);
      const buf = this.buffers.get(key);
      if (buf) {
        buf.push(this.sessionTimeSec, value, valid);
      }
    }

    this.revision++;
  }

  /** Get samples for keys in time window */
  chartSnapshots(keys: string[], tMin: number, tMax: number): ChartStripSnapshot[] {
    return keys.map(key => {
      const buf = this.buffers.get(key);
      const samples = buf ? buf.samplesInWindow(tMin, tMax) : [];
      return { key, samples };
    });
  }

  /** Current revision number */
  getRevision(): number {
    return this.revision;
  }

  /** Current session time in seconds */
  getSessionTimeSec(): number {
    return this.sessionTimeSec;
  }

  /** Session start epoch ms */
  getSessionStartMs(): number {
    return this.sessionStartMs;
  }
}

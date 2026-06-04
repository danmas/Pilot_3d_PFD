// ─── PFD Data Adapter ───
// Bridges Pilot_3d_PFD's FIELD_CATALOG + TelemetryFrame into the realtime-charts DataHub.
// Accepts a param list + framer converter from the host app.

import type { ParamInfo, ChartStripSnapshot, ChartDataSource } from './types.js';
import { DataHub } from './data-hub.js';

export type FrameToValues = (frame: Record<string, unknown>) => number[];

/**
 * PFDTelemetryHub — wraps DataHub with a configurable converter.
 *
 * The host app passes:
 *   - params: ParamInfo[] built from FIELD_CATALOG
 *   - frameToValues: function that extracts numeric values from a TelemetryFrame
 *
 * Usage:
 *   const hub = createPFDHub(params, frameToValues);
 *   hub.ingest(frame, epochMs);
 */
export class PFDTelemetryHub {
  private hub: DataHub;
  private frameToValues: FrameToValues;

  constructor(params: ParamInfo[], frameToValues: FrameToValues) {
    this.hub = new DataHub(50);
    this.hub.configure(params);
    this.frameToValues = frameToValues;
  }

  /** Ingest a telemetry frame */
  ingest(frame: Record<string, unknown>, epochMs: number): void {
    const values = this.frameToValues(frame);
    this.hub.ingestFrame(values, epochMs);
  }

  getActiveKeys(): string[] { return this.hub.getActiveKeys(); }
  getDisplayName(key: string): string { return this.hub.getDisplayName(key); }
  getRevision(): number { return this.hub.getRevision(); }
  getSessionTimeSec(): number { return this.hub.getSessionTimeSec(); }
  chartSnapshots(keys: string[], tMin: number, tMax: number): ChartStripSnapshot[] {
    return this.hub.chartSnapshots(keys, tMin, tMax);
  }
  destroy(): void { this.hub.destroy(); }
}

/**
 * Helper: build ParamInfo[] from FIELD_CATALOG array.
 * Import FIELD_CATALOG in the host app and pass it here.
 */
export function paramsFromCatalog(catalog: Array<{ key: string; comment: string }>): ParamInfo[] {
  return catalog.map((entry, idx) => ({
    key: entry.key,
    displayName: entry.comment,
    index: idx,
  }));
}

/**
 * Helper: convert TelemetryFrame to flat numeric array in catalog order.
 */
export function frameToValuesFromCatalog(
  catalog: Array<{ key: string }>,
  frame: Record<string, unknown>,
): number[] {
  return catalog.map(entry => {
    const val = frame[entry.key];
    return typeof val === 'number' && Number.isFinite(val) ? val : 0;
  });
}

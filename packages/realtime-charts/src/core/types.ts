// ─── Core data types for realtime-charts ───

/** Single sample point in a ring buffer */
export interface SamplePoint {
  timeSec: number;
  value: number;
  valid: boolean;
}

/** Snapshot of one parameter's samples in a time window */
export interface ChartStripSnapshot {
  key: string;
  samples: SamplePoint[];
}

/** Parameter metadata */
export interface ParamInfo {
  key: string;
  displayName: string;
  index: number; // index in frame[]
  unit?: string;
}

/** Display point after decimation (pixel-space coords) */
export interface DisplayPoint {
  x: number; // time in seconds
  y: number; // value
}

/** Push notification from DataHub */
export interface ChartDataChanged {
  type: 'chartDataChanged';
  revision: number;
  sessionTimeSec: number;
}

/** Chart view state */
export interface ChartViewState {
  timeWindowSec: number;   // [5, 600], default 60
  cursorTimeSec: number;   // -1 = hidden
  viewStartSec: number;    // computed
  viewEndSec: number;      // computed
}

/** Stacked layout constants */
export interface StackedLayout {
  leftMargin: number;     // 50
  rightMargin: number;    // 10
  minStripHeight: number; // 8
  maxSeries: number;      // 20
}

/** Overlay layout constants */
export interface OverlayLayout {
  plotLeft: number;     // 56
  plotRight: number;    // 12
  plotTop: number;      // 12
  plotBottom: number;   // 36
  legendLineHeight: number; // 16
  maxSeries: number;    // 24
}

/** A single strip region for Stacked */
export interface StripRegion {
  key: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** An instrument slot index used by RawSlotAdapter */
export interface SlotInfo {
  key: string;
  displayName: string;
  index: number; // slot number in frame[]
}

/** Palette color (RGBA components 0-255) */
export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

/** Complete theme colors */
export interface ChartTheme {
  widgetBg: string;     // #0B0F14
  plotBg: string;      // #151A22
  border: string;      // #283241
  cursor: string;      // #00DCFF
  textDim: string;     // #788CA0
  text: string;        // #B4C8DC
  palette: RgbColor[];
}

/** Data adapter interface — implement for post-decode or raw-slot sources */
export interface DataAdapter {
  /** Get the list of parameters to track */
  getParamKeys(): ParamInfo[];
  /** Ingest a frame and update ring buffers */
  ingestFrame(values: number[], epochMs: number): void;
  /** Take snapshot of active parameter keys in [tMin, tMax] */
  chartSnapshots(keys: string[], tMin: number, tMax: number): ChartStripSnapshot[];
  /** Current revision counter (monotonically increasing) */
  getRevision(): number;
  /** Current session time in seconds */
  getSessionTimeSec(): number;
  /** Session start epoch ms */
  getSessionStartMs(): number;
}

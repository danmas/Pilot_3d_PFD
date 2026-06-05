// ─── Time Window ───
// Computes view range and handles zoom.

import type { ChartViewState } from './types.js';

const MIN_WINDOW = 5;
const MAX_WINDOW = 600;
const DEFAULT_WINDOW = 60;

export function createViewState(): ChartViewState {
  return {
    timeWindowSec: DEFAULT_WINDOW,
    cursorTimeSec: -1,
    viewStartSec: 0,
    viewEndSec: DEFAULT_WINDOW,
  };
}

/**
 * Compute visible time range given current session time and window size.
 *
 * If sessionTimeSec > timeWindowSec → sliding window [session - window, session]
 * Otherwise → fixed window [0, max(window, sessionTimeSec)]
 */
export function computeViewRange(
  sessionTimeSec: number,
  timeWindowSec: number,
): { viewStartSec: number; viewEndSec: number } {
  if (sessionTimeSec > timeWindowSec) {
    return {
      viewStartSec: sessionTimeSec - timeWindowSec,
      viewEndSec: sessionTimeSec,
    };
  }
  return {
    viewStartSec: 0,
    viewEndSec: Math.max(timeWindowSec, sessionTimeSec),
  };
}

/** Update viewState with new session time */
export function updateViewRange(state: ChartViewState, sessionTimeSec: number): void {
  const range = computeViewRange(sessionTimeSec, state.timeWindowSec);
  state.viewStartSec = range.viewStartSec;
  state.viewEndSec = range.viewEndSec;
}

/** Zoom by factor (0.9 = zoom in, 1.1 = zoom out). Clamped to [5, 600]. */
export function applyZoom(
  state: ChartViewState,
  sessionTimeSec: number,
  factor: number,
): void {
  state.timeWindowSec = Math.max(
    MIN_WINDOW,
    Math.min(MAX_WINDOW, state.timeWindowSec * factor),
  );
  updateViewRange(state, sessionTimeSec);
}

/** Convert pixel X to time */
export function timeFromX(
  pixelX: number,
  plotLeft: number,
  plotWidth: number,
  viewStartSec: number,
  viewEndSec: number,
): number {
  const ratio = (pixelX - plotLeft) / plotWidth;
  return viewStartSec + ratio * (viewEndSec - viewStartSec);
}

/** Convert time to pixel X */
export function xFromTime(
  timeSec: number,
  plotLeft: number,
  plotWidth: number,
  viewStartSec: number,
  viewEndSec: number,
): number {
  const dt = Math.max(0.001, viewEndSec - viewStartSec);
  return plotLeft + ((timeSec - viewStartSec) / dt) * plotWidth;
}

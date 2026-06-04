// ─── Stacked Renderer ───
// Renders N horizontal strips, each with per-strip auto-scale Y.
// Uses two-layer rendering: static back-buffer + cursor overlay.

import type { ChartStripSnapshot, ChartViewState, StripRegion } from '../core/types.js';
import { STACKED_LAYOUT, paletteColor, THEME } from '../core/theme.js';
import { toDisplayPoints } from '../core/chart-decimator.js';
import { xFromTime } from '../core/time-window.js';
import type { DisplayPoint } from '../core/types.js';

export interface StackedState {
  strips: StripRegion[];
  snapshots: ChartStripSnapshot[];
  revision: number;
}

export interface StackedCursorInfo {
  active: boolean;
  timeSec: number;
  pixelX: number;
}

/**
 * Compute strip layout
 */
export function computeStripLayout(
  paramKeys: string[],
  viewWidth: number,
  viewHeight: number,
): StripRegion[] {
  const count = Math.min(paramKeys.length, STACKED_LAYOUT.maxSeries);
  if (count === 0) return [];

  const plotWidth = Math.max(10, viewWidth - STACKED_LAYOUT.leftMargin - STACKED_LAYOUT.rightMargin);
  const rawStripHeight = viewHeight / count;
  const stripHeight = Math.max(STACKED_LAYOUT.minStripHeight, rawStripHeight);

  const strips: StripRegion[] = [];
  for (let i = 0; i < count; i++) {
    strips.push({
      key: paramKeys[i],
      x: STACKED_LAYOUT.leftMargin,
      y: i * stripHeight,
      w: plotWidth,
      h: stripHeight - 1,
    });
  }
  return strips;
}

/**
 * Draw one strip (background + line + label)
 */
function drawStrip(
  ctx: CanvasRenderingContext2D,
  strip: StripRegion,
  points: DisplayPoint[],
  label: string,
  colorIndex: number,
  viewStartSec: number,
  viewEndSec: number,
): void {
  const { x, y, w, h } = strip;
  const dt = Math.max(0.001, viewEndSec - viewStartSec);

  // Background + border
  ctx.fillStyle = THEME.plotBg;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);

  if (points.length < 2) {
    // No data — show label centered
    ctx.fillStyle = THEME.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h / 2 + 4);
    return;
  }

  // Auto-scale Y (per-strip)
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  if (Math.abs(yMax - yMin) < 1e-12) {
    yMin -= 1;
    yMax += 1;
  }
  const yRange = Math.max(0.001, yMax - yMin);

  // Draw polyline
  const innerH = Math.max(1, h - 10);
  const color = paletteColor(colorIndex);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  for (let i = 0; i < points.length; i++) {
    const px = x + ((points[i].x - viewStartSec) / dt) * w;
    const py = (y + h - 5) - ((points[i].y - yMin) / yRange) * innerH;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();

  // Label (top-left corner of strip)
  ctx.fillStyle = THEME.text;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(label, x + 6, y + 2);

  // Y-scale values (right side, only if strip is tall enough)
  if (h >= 30) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const maxLabel = yMax.toFixed(yRange < 10 ? 1 : 0);
    const minLabel = yMin.toFixed(yRange < 10 ? 1 : 0);
    ctx.fillText(maxLabel, x + w - 4, y + 8);
    ctx.fillText(minLabel, x + w - 4, y + h - 8);
  }
}

/**
 * Render all strips to a back-buffer canvas.
 */
export function renderStackedStatic(
  ctx: CanvasRenderingContext2D,
  strips: StripRegion[],
  snapshots: ChartStripSnapshot[],
  viewStartSec: number,
  viewEndSec: number,
): void {
  const snapshotMap = new Map(snapshots.map(s => [s.key, s.samples]));

  for (let i = 0; i < strips.length; i++) {
    const strip = strips[i];
    const samples = snapshotMap.get(strip.key) ?? [];
    const maxPoints = Math.max(32, strip.w);
    const points = toDisplayPoints(samples, viewStartSec, viewEndSec, maxPoints);
    drawStrip(ctx, strip, points, strip.key, i, viewStartSec, viewEndSec);
  }
}

/**
 * Render cursor line for stacked mode (full height, dashed).
 */
export function renderStackedCursor(
  ctx: CanvasRenderingContext2D,
  cursorX: number,
  viewWidth: number,
  viewHeight: number,
): void {
  if (cursorX < STACKED_LAYOUT.leftMargin || cursorX > viewWidth - STACKED_LAYOUT.rightMargin) return;

  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, 0);
  ctx.lineTo(cursorX, viewHeight);
  ctx.stroke();
  ctx.restore();
}

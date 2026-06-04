// ─── Overlay Renderer ───
// Single plot area with all series overlaid. Two-pass pipeline:
// Pass 1: decimate + compute global Y range
// Pass 2: convert to pixel coordinates with shared Y scale

import type { ChartStripSnapshot, ChartViewState, DisplayPoint, ChartViewState } from '../core/types.js';
import { OVERLAY_LAYOUT, paletteColor, THEME } from '../core/theme.js';
import { toDisplayPoints } from '../core/chart-decimator.js';
import { xFromTime } from '../core/time-window.js';

export interface OverlaySeries {
  key: string;
  color: string;
  path: DisplayPoint[]; // pixel coords (x, y)
}

export interface OverlayState {
  seriesList: OverlaySeries[];
  yMin: number;
  yMax: number;
  revision: number;
}

export interface OverlayLayoutInfo {
  plotLeft: number;
  plotTop: number;
  plotWidth: number;
  plotHeight: number;
  legendHeight: number;
}

/**
 * Compute plot area and legend heights for overlay mode
 */
export function computeOverlayLayout(
  paramCount: number,
  viewWidth: number,
  viewHeight: number,
): OverlayLayoutInfo {
  const legendHeight = Math.min(
    viewHeight / 3,
    Math.min(paramCount, OVERLAY_LAYOUT.maxSeries) * OVERLAY_LAYOUT.legendLineHeight + 8,
  );
  const plotLeft = OVERLAY_LAYOUT.plotLeft;
  const plotTop = OVERLAY_LAYOUT.plotTop;
  const plotWidth = Math.max(10, viewWidth - OVERLAY_LAYOUT.plotLeft - OVERLAY_LAYOUT.plotRight);
  const plotHeight = Math.max(10, viewHeight - OVERLAY_LAYOUT.plotTop - OVERLAY_LAYOUT.plotBottom - legendHeight);

  return { plotLeft, plotTop, plotWidth, plotHeight, legendHeight };
}

/**
 * Two-pass pipeline: decimate + compute global Y range
 */
export function computeOverlaySeries(
  snapshots: ChartStripSnapshot[],
  paramKeys: string[],
  viewStartSec: number,
  viewEndSec: number,
  plotWidth: number,
): { seriesList: OverlaySeries[]; yMin: number; yMax: number } {
  // Pass 1: decimate each key and compute global Y range
  let yMin = Infinity;
  let yMax = -Infinity;
  const seriesList: OverlaySeries[] = [];
  let colorIndex = 0;

  // Create a map for quick lookup
  const snapshotMap = new Map(snapshots.map(s => [s.key, s.samples]));
  const maxPoints = Math.max(64, plotWidth);

  for (const key of paramKeys.slice(0, OVERLAY_LAYOUT.maxSeries)) {
    const samples = snapshotMap.get(key);
    if (!samples || samples.length < 2) continue;

    const points = toDisplayPoints(samples, viewStartSec, viewEndSec, maxPoints);
    if (points.length < 2) continue;

    const color = paletteColor(colorIndex++);
    for (const p of points) {
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    }

    seriesList.push({ key, color, path: points });
  }

  // Degenerate range guard
  if (yMin > yMax) { yMin = -1; yMax = 1; }
  if (Math.abs(yMax - yMin) < 1e-12) { yMin -= 1; yMax += 1; }

  return { seriesList, yMin, yMax };
}

/**
 * Convert decimated points to pixel coordinates with shared Y scale
 */
function seriesToPixelPath(
  points: DisplayPoint[],
  viewStartSec: number,
  viewEndSec: number,
  plotLeft: number,
  plotWidth: number,
  plotBottom: number,
  plotHeight: number,
  yMin: number,
  yMax: number,
): { x: number; y: number }[] {
  const dt = Math.max(0.001, viewEndSec - viewStartSec);
  const yRange = Math.max(0.001, yMax - yMin);
  const innerH = plotHeight - 4;

  return points.map(p => ({
    x: plotLeft + ((p.x - viewStartSec) / dt) * plotWidth,
    y: plotBottom - ((p.y - yMin) / yRange) * innerH - 2,
  }));
}

/**
 * Render overlay (background, plot area, series, legend)
 */
export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  paramKeys: string[],
  snapshots: ChartStripSnapshot[],
  viewStartSec: number,
  viewEndSec: number,
  viewWidth: number,
  viewHeight: number,
): void {
  const layout = computeOverlayLayout(paramKeys.length, viewWidth, viewHeight);
  const { plotLeft, plotTop, plotWidth, plotHeight, legendHeight } = layout;
  const plotBottom = plotTop + plotHeight;

  // Background
  ctx.fillStyle = THEME.widgetBg;
  ctx.fillRect(0, 0, viewWidth, viewHeight);

  // Plot area background
  ctx.fillStyle = THEME.plotBg;
  ctx.beginPath();
  const r = 4;
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(plotLeft, plotTop, plotWidth, plotHeight, r);
  ctx.stroke();

  // Pass 1: compute series + global Y
  const { seriesList, yMin, yMax } = computeOverlaySeries(
    snapshots, paramKeys, viewStartSec, viewEndSec, plotWidth,
  );

  if (seriesList.length === 0) {
    // No data message
    ctx.fillStyle = THEME.textDim;
    ctx.font = '13px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Ожидание данных…', plotLeft + plotWidth / 2, plotTop + plotHeight / 2);
    return;
  }

  // Pass 2: convert to pixel coords and draw
  for (const entry of seriesList) {
    const pixelPath = seriesToPixelPath(
      entry.path, viewStartSec, viewEndSec,
      plotLeft, plotWidth, plotBottom, plotHeight,
      yMin, yMax,
    );

    ctx.beginPath();
    ctx.strokeStyle = entry.color;
    ctx.lineWidth = 2;
    for (let i = 0; i < pixelPath.length; i++) {
      if (i === 0) {
        ctx.moveTo(pixelPath[i].x, pixelPath[i].y);
      } else {
        ctx.lineTo(pixelPath[i].x, pixelPath[i].y);
      }
    }
    ctx.stroke();
  }

  // Time labels under plot area
  const labelY = plotBottom + 14;
  ctx.fillStyle = THEME.textDim;
  ctx.font = '11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(viewStartSec.toFixed(1) + 's', plotLeft, labelY);
  ctx.textAlign = 'right';
  ctx.fillText(viewEndSec.toFixed(1) + 's', plotLeft + plotWidth, labelY);

  // Legend
  const legendY = plotBottom + OVERLAY_LAYOUT.plotBottom;
  for (let i = 0; i < seriesList.length; i++) {
    const entry = seriesList[i];
    const ly = legendY + i * OVERLAY_LAYOUT.legendLineHeight;

    // Color line
    ctx.fillStyle = entry.color;
    ctx.fillRect(plotLeft + 4, ly + 6, 14, 3);

    // Label
    const label = entry.key.length > 28 ? entry.key.substring(0, 25) + '…' : entry.key;
    ctx.fillStyle = THEME.text;
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(label, plotLeft + 22, ly + 2);
  }
}

/**
 * Render cursor for overlay (only inside plot area)
 */
export function renderOverlayCursor(
  ctx: CanvasRenderingContext2D,
  cursorX: number,
  plotLeft: number,
  plotWidth: number,
  plotTop: number,
  plotHeight: number,
): void {
  if (cursorX < plotLeft || cursorX > plotLeft + plotWidth) return;

  ctx.save();
  ctx.strokeStyle = THEME.cursor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cursorX, plotTop);
  ctx.lineTo(cursorX, plotTop + plotHeight);
  ctx.stroke();
  ctx.restore();
}

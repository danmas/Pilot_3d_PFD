// ─── Charts Panel ───
// React component that renders Stacked or Overlay charts on a Canvas 2D.
// Manages DataHub subscription, debounce, cursor, and zoom.
// Self-sizing via ResizeObserver — no width/height props needed.

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { ChartViewState, ChartStripSnapshot, ChartDataSource } from '../core/types.js';
import { createViewState, updateViewRange, applyZoom, timeFromX } from '../core/time-window.js';
import { computeStripLayout, renderStackedStatic, renderStackedCursor } from '../renderers/stacked-renderer.js';
import { computeOverlaySeries, computeOverlayLayout, renderOverlay, renderOverlayCursor } from '../renderers/overlay-renderer.js';
import { getPlotMargins } from '../core/theme.js';
import { addChartSample } from '../core/chart-latency.js';

export type ChartMode = 'stacked' | 'overlay';

export interface ChartsPanelProps {
  dataSource: ChartDataSource;
  paramKeys: string[];
  mode?: ChartMode;
  /** Global cursor time in seconds (-1 = hidden). */
  cursorTimeSecRef?: React.MutableRefObject<number>;
  /** Called when cursor time changes (for sync). */
  onCursorChange?: (timeSec: number) => void;
  /** Mutable ref with _t0_ms of the latest ingested frame (for latency measurement). */
  lastT0MsRef?: React.MutableRefObject<number>;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  dataSource,
  paramKeys,
  mode = 'stacked',
  cursorTimeSecRef,
  onCursorChange,
  lastT0MsRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backBufferRef = useRef<HTMLCanvasElement | null>(null);
  const viewStateRef = useRef<ChartViewState>(createViewState());
  const lastRevisionRef = useRef<number>(-1);
  const cursorXRef = useRef<number | null>(null);
  const cursorDirtyRef = useRef<boolean>(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // ─── Auto-size via ResizeObserver ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width * devicePixelRatio);
        const h = Math.floor(height * devicePixelRatio);
        setSize({ width: w, height: h });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Sync canvas resolution with size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.width = (size.width / devicePixelRatio) + 'px';
    canvas.style.height = (size.height / devicePixelRatio) + 'px';
    // Reset back-buffer too
    if (backBufferRef.current) {
      backBufferRef.current.width = size.width;
      backBufferRef.current.height = size.height;
    }
    lastRevisionRef.current = -1; // force re-render on resize
  }, [size]);

  // ─── Main rAF render loop (replaces setInterval + separate view-range timer) ───
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = size.width;
    const h = size.height;
    const state = viewStateRef.current;

    // Update sliding window every frame
    updateViewRange(state, dataSource.getSessionTimeSec());

    const curRevision = dataSource.getRevision();
    const dataChanged = curRevision !== lastRevisionRef.current;
    const cursorDirty = cursorDirtyRef.current;
    const cx = cursorXRef.current;

    // ── Draw data (revision-gated) ──
    if (dataChanged) {
      lastRevisionRef.current = curRevision;

      if (mode === 'stacked') {
        const strips = computeStripLayout(paramKeys, w, h);
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 20),
          state.viewStartSec,
          state.viewEndSec,
        );

        if (!backBufferRef.current) {
          backBufferRef.current = document.createElement('canvas');
        }
        const bb = backBufferRef.current;
        bb.width = w;
        bb.height = h;
        const bbCtx = bb.getContext('2d');
        if (bbCtx) {
          renderStackedStatic(bbCtx, strips, snapshots, state.viewStartSec, state.viewEndSec);
        }
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bb, 0, 0);
      } else {
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 24),
          state.viewStartSec,
          state.viewEndSec,
        );
        renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, w, h);
      }
      // ── Record chart display latency ──
      if (lastT0MsRef && lastT0MsRef.current > 0) {
        const tPaint = performance.timeOrigin + performance.now();
        addChartSample(tPaint - lastT0MsRef.current);
      }
    }

    // ── Draw cursor (every frame when active or dirty) ──
    if (cx !== null && (dataChanged || cursorDirty)) {
      if (mode === 'stacked') {
        // Blit back-buffer to erase old cursor, then draw new one
        if (!dataChanged && backBufferRef.current) {
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(backBufferRef.current, 0, 0);
        }
        renderStackedCursor(ctx, cx, w, h);
      } else {
        // Overlay: redraw (covers old cursor line)
        if (!dataChanged) {
          const snapshots = dataSource.chartSnapshots(
            paramKeys.slice(0, 24),
            state.viewStartSec,
            state.viewEndSec,
          );
          renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, w, h);
        }
        const layout = computeOverlayLayout(Math.min(paramKeys.length, 24), w, h);
        renderOverlayCursor(ctx, cx, layout.plotLeft, layout.plotWidth, layout.plotTop, layout.plotHeight);
      }
      cursorDirtyRef.current = false;
    }
  }, [dataSource, paramKeys, mode, size]);

  // ─── rAF loop + visibility guard ───
  useEffect(() => {
    let rafId: number;
    let wasHidden = false;

    const loop = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true;
        rafId = requestAnimationFrame(loop);
        return;
      }
      // Force one full frame after returning from hidden tab
      if (wasHidden) {
        lastRevisionRef.current = -1;
        wasHidden = false;
      }
      render();
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [render]);

  // ─── Mouse handlers ───
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'overlay') {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      cursorXRef.current = px;
      cursorDirtyRef.current = true;
      if (onCursorChange) {
        const dt = Math.max(0.001, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins('overlay');
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      }
    }
  }, [mode, onCursorChange, size]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'stacked') {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      // Toggle: clicking same spot hides cursor
      if (cursorXRef.current !== null && Math.abs(cursorXRef.current - px) < 5) {
        cursorXRef.current = null;
      } else {
        cursorXRef.current = px;
      }
      cursorDirtyRef.current = true;
      if (cursorTimeSecRef && cursorXRef.current !== null && onCursorChange) {
        const dt = Math.max(0.001, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const m = getPlotMargins('stacked');
        const ratio = (px - m.left) / (viewW - m.left - m.right);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      } else if (cursorTimeSecRef && cursorXRef.current === null && onCursorChange) {
        onCursorChange(-1);
      }
    }
  }, [mode, onCursorChange, size, cursorTimeSecRef]);

  const handleMouseUp = useCallback(() => {
    // Keep cursor visible after drag end
  }, [mode]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    applyZoom(viewStateRef.current, dataSource.getSessionTimeSec(), factor);
    lastRevisionRef.current = -1; // force re-render
    render();
  }, [dataSource, render]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: mode === 'overlay' ? 'none' : 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />
    </div>
  );
};

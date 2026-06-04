// ─── Charts Panel ───
// React component that renders Stacked or Overlay charts on a Canvas 2D.
// Manages DataHub subscription, debounce, cursor, and zoom.
// Self-sizing via ResizeObserver — no width/height props needed.

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { ChartViewState, ChartStripSnapshot, ChartDataSource } from '../core/types.js';
import { createViewState, updateViewRange, applyZoom, timeFromX } from '../core/time-window.js';
import { computeStripLayout, renderStackedStatic, renderStackedCursor } from '../renderers/stacked-renderer.js';
import { computeOverlaySeries, computeOverlayLayout, renderOverlay, renderOverlayCursor } from '../renderers/overlay-renderer.js';

export type ChartMode = 'stacked' | 'overlay';

export interface ChartsPanelProps {
  dataSource: ChartDataSource;
  paramKeys: string[];
  mode?: ChartMode;
  /** Global cursor time in seconds (-1 = hidden). */
  cursorTimeSecRef?: React.MutableRefObject<number>;
  /** Called when cursor time changes (for sync). */
  onCursorChange?: (timeSec: number) => void;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  dataSource,
  paramKeys,
  mode = 'stacked',
  cursorTimeSecRef,
  onCursorChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backBufferRef = useRef<HTMLCanvasElement | null>(null);
  const viewStateRef = useRef<ChartViewState>(createViewState());
  const lastRevisionRef = useRef<number>(-1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [cursorX, setCursorX] = useState<number | null>(null);

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

  // ─── Update view range when session time changes ───
  useEffect(() => {
    const interval = setInterval(() => {
      updateViewRange(viewStateRef.current, dataSource.getSessionTimeSec());
    }, 100);
    return () => clearInterval(interval);
  }, [dataSource]);

  // ─── Main render loop ───
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for HiDPI
    const w = size.width;
    const h = size.height;

    const state = viewStateRef.current;
    const curRevision = dataSource.getRevision();

    if (curRevision !== lastRevisionRef.current) {
      lastRevisionRef.current = curRevision;

      if (mode === 'stacked') {
        // Debounce for stacked (50ms)
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          const strips = computeStripLayout(paramKeys, w, h);
          const snapshots = dataSource.chartSnapshots(
            paramKeys.slice(0, 20),
            state.viewStartSec,
            state.viewEndSec,
          );

          // Use back-buffer for static content
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

          // Blit back-buffer to main canvas
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(bb, 0, 0);

          // Draw cursor on top
          if (cursorX !== null) {
            renderStackedCursor(ctx, cursorX, w, h);
          }
        }, 50);
      } else {
        // Overlay — immediate
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 24),
          state.viewStartSec,
          state.viewEndSec,
        );
        renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, w, h);

        if (cursorX !== null) {
          const layout = computeOverlayLayout(Math.min(paramKeys.length, 24), w, h);
          renderOverlayCursor(ctx, cursorX, layout.plotLeft, layout.plotWidth, layout.plotTop, layout.plotHeight);
        }
      }
    }
  }, [dataSource, paramKeys, mode, cursorX, size]);

  // ─── Render on revision change ───
  useEffect(() => {
    const interval = setInterval(render, 50);
    return () => clearInterval(interval);
  }, [render]);

  // ─── Mouse handlers ───
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'overlay') {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      setCursorX(px);
      if (onCursorChange) {
        const dt = Math.max(0.001, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const ratio = (px - 56) / (viewW - 56 - 12);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      }
    }
  }, [mode, onCursorChange, size]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'stacked') {
      const px = e.nativeEvent.offsetX * devicePixelRatio;
      setCursorX(px);
      if (onCursorChange) {
        const dt = Math.max(0.001, viewStateRef.current.viewEndSec - viewStateRef.current.viewStartSec);
        const viewW = size.width;
        const ratio = (px - 50) / (viewW - 50 - 10);
        const timeSec = viewStateRef.current.viewStartSec + ratio * dt;
        onCursorChange(timeSec);
      }
    }
  }, [mode, onCursorChange, size]);

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

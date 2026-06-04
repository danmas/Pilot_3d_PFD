// ─── Charts Panel ───
// React component that renders Stacked or Overlay charts on a Canvas 2D.
// Manages DataHub subscription, debounce, cursor, and zoom.

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { ChartViewState, ChartStripSnapshot } from '../core/types.js';
import type { ChartDataSource } from '../core/types.js';
import { createViewState, updateViewRange, applyZoom, timeFromX } from '../core/time-window.js';
import { computeStripLayout, renderStackedStatic, renderStackedCursor } from '../renderers/stacked-renderer.js';
import { computeOverlaySeries, computeOverlayLayout, renderOverlay, renderOverlayCursor } from '../renderers/overlay-renderer.js';

export type ChartMode = 'stacked' | 'overlay';

export interface ChartsPanelProps {
  dataSource: ChartDataSource;
  paramKeys: string[];
  width: number;
  height: number;
  mode?: ChartMode;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  dataSource,
  paramKeys,
  width,
  height,
  mode = 'stacked',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backBufferRef = useRef<HTMLCanvasElement | null>(null);
  const viewStateRef = useRef<ChartViewState>(createViewState());
  const lastRevisionRef = useRef<number>(-1);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cursorX, setCursorX] = useState<number | null>(null);

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = viewStateRef.current;
    const curRevision = dataSource.getRevision();

    if (curRevision !== lastRevisionRef.current) {
      lastRevisionRef.current = curRevision;

      if (mode === 'stacked') {
        // Debounce for stacked (50ms)
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          const strips = computeStripLayout(paramKeys, width, height);
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
          bb.width = width;
          bb.height = height;
          const bbCtx = bb.getContext('2d');
          if (bbCtx) {
            renderStackedStatic(bbCtx, strips, snapshots, state.viewStartSec, state.viewEndSec);
          }

          // Blit back-buffer to main canvas
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(bb, 0, 0);

          // Draw cursor on top
          if (cursorX !== null) {
            renderStackedCursor(ctx, cursorX, width, height);
          }
        }, 50);
      } else {
        // Overlay — immediate
        const snapshots = dataSource.chartSnapshots(
          paramKeys.slice(0, 24),
          state.viewStartSec,
          state.viewEndSec,
        );
        renderOverlay(ctx, paramKeys, snapshots, state.viewStartSec, state.viewEndSec, width, height);

        if (cursorX !== null) {
          const layout = computeOverlayLayout(Math.min(paramKeys.length, 24), width, height);
          renderOverlayCursor(ctx, cursorX, layout.plotLeft, layout.plotWidth, layout.plotTop, layout.plotHeight);
        }
      }
    }
  }, [dataSource, paramKeys, width, height, mode, cursorX]);

  // ─── Render on revision change ───
  useEffect(() => {
    const interval = setInterval(render, 50);
    return () => clearInterval(interval);
  }, [render]);

  // ─── Mouse handlers ───
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'overlay') {
      setCursorX(e.nativeEvent.offsetX);
    }
  }, [mode]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (mode === 'stacked') {
      setCursorX(e.nativeEvent.offsetX);
    }
  }, [mode]);

  const handleMouseUp = useCallback(() => {
    if (mode === 'stacked') {
      // Keep cursor visible after drag end
    }
  }, [mode]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    applyZoom(viewStateRef.current, dataSource.getSessionTimeSec(), factor);
    lastRevisionRef.current = -1; // force re-render
    render();
  }, [dataSource, render]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: 'block', cursor: mode === 'overlay' ? 'none' : 'crosshair' }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    />
  );
};

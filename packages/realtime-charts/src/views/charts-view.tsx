// ─── Charts View ───
// Full-page charts view for integration into Pilot_3d_PFD App.
// Creates PFDTelemetryHub, subscribes to telemetry context, renders ChartsPanel.

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChartsPanel, type ChartMode } from '../components/charts-panel.jsx';
import { PFDTelemetryHub, paramsFromCatalog, frameToValuesFromCatalog } from '../core/pfd-adapter.js';

// These are injected by the host app at mount time
let catalog: Array<{ key: string; comment: string }> | null = null;

/**
 * Initialize the charts view with FIELD_CATALOG.
 * Call this once from the host app (e.g., App.tsx module level).
 */
export function initCharts(fieldCatalog: Array<{ key: string; comment: string }>): void {
  catalog = fieldCatalog;
}

export interface ChartsViewProps {
  frame: Record<string, unknown>;
  epochMs: number;
  initialMode?: ChartMode;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ frame, epochMs, initialMode = 'stacked' }) => {
  const hubRef = useRef<PFDTelemetryHub | null>(null);
  const [keys, setKeys] = useState<string[]>([]);
  const [mode, setMode] = useState<ChartMode>(initialMode);

  // Shared cursor time ref — synchronized between stacked and overlay
  const cursorTimeSecRef = useRef<number>(-1);
  const [cursorTimeLabel, setCursorTimeLabel] = useState<string | null>(null);

  // Initialize hub once
  useEffect(() => {
    if (!catalog) {
      console.warn('[ChartsView] FIELD_CATALOG not initialized. Call initCharts() first.');
      return;
    }
    const params = paramsFromCatalog(catalog);
    const converter = (f: Record<string, unknown>) => frameToValuesFromCatalog(catalog!, f);
    const hub = new PFDTelemetryHub(params, converter);
    hubRef.current = hub;
    setKeys(hub.getActiveKeys());
  }, []);

  // Ingest each new frame
  useEffect(() => {
    if (!hubRef.current) return;
    hubRef.current.ingest(frame, epochMs);
  }, [frame, epochMs]);

  // Cursor sync handler — called from ChartsPanel on mouse move/down
  const handleCursorChange = useCallback((timeSec: number) => {
    cursorTimeSecRef.current = timeSec;
    if (timeSec >= 0) {
      setCursorTimeLabel(timeSec.toFixed(1) + 's');
    } else {
      setCursorTimeLabel(null);
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#0B0F14]">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-black/60 border-b border-white/10">
        <button
          onClick={() => setMode('stacked')}
          className={`px-3 py-1 rounded text-xs font-medium transition ${
            mode === 'stacked' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Stacked
        </button>
        <button
          onClick={() => setMode('overlay')}
          className={`px-3 py-1 rounded text-xs font-medium transition ${
            mode === 'overlay' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Overlay
        </button>

        {/* Cursor time label */}
        {cursorTimeLabel && (
          <span className="ml-auto text-[#00DCFF] text-xs font-mono">
            cursor: {cursorTimeLabel}
          </span>
        )}
      </div>

      {/* Chart canvas — fills remaining space, auto-sized by ChartsPanel */}
      <div className="flex-1 min-h-0">
        {hubRef.current ? (
          <ChartsPanel
            dataSource={hubRef.current}
            paramKeys={keys}
            mode={mode}
            cursorTimeSecRef={cursorTimeSecRef}
            onCursorChange={handleCursorChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            Initializing charts…
          </div>
        )}
      </div>
    </div>
  );
};

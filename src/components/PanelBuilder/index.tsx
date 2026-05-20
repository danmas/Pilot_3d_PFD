/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { InstrumentPanel } from './InstrumentPanel';
import { Sidebar } from './Sidebar';
import type { PanelNode } from './types';
import { useTelemetry } from '../../context/TelemetryContext';
// Importing the Instruments barrel triggers self-registration of all
// instrument components into the registry.
import '../Instruments';

const STORAGE_KEY = 'pilot-panel-config';

const createEmptyRoot = (): PanelNode => ({ id: 'root', type: 'empty' });

const isValidPanelNode = (value: unknown): value is PanelNode => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.type === 'string';
};

interface PanelBuilderProps {
  onBack: () => void;
}

export const PanelBuilder: React.FC<PanelBuilderProps> = ({ onBack }) => {
  // ---- Telemetry from context (live or sample, provided by parent) ----
  const { frame } = useTelemetry();

  // ---- State: panel layout tree ----
  const [rootNode, setRootNode] = useState<PanelNode>(createEmptyRoot);
  const hasHydrated = useRef(false);

  // ---- Auto-load from localStorage on mount ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isValidPanelNode(parsed)) {
          setRootNode(parsed);
        }
      }
    } catch {
      // ignore corrupt storage
    } finally {
      hasHydrated.current = true;
    }
  }, []);

  // ---- Auto-save to localStorage on change (after initial hydration) ----
  useEffect(() => {
    if (!hasHydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rootNode));
    } catch {
      // ignore quota / serialization errors
    }
  }, [rootNode]);

  // ---- File save / load ----
  const handleSaveFile = () => {
    const json = JSON.stringify(rootNode, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'panel-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const parsed = JSON.parse(json);
        if (isValidPanelNode(parsed)) {
          setRootNode(parsed);
        } else {
          alert('Invalid configuration file structure.');
        }
      } catch {
        alert('Failed to parse the configuration file.');
      }
    };
    reader.readAsText(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLoadFile(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0a0f] text-[#d1d5db] font-sans overflow-hidden">
      {/* ─── Header ───────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#2d2e30] bg-[#161719] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-[#252628] rounded-md text-gray-400 hover:text-white transition-colors"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="h-4 w-[1px] bg-[#2d2e30]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="text-sm font-bold tracking-wide text-white">
              Panel Builder
            </span>
          </div>
          <div className="h-4 w-[1px] bg-[#2d2e30]" />
          <div className="text-[10px] font-mono text-gray-500 uppercase">
            Project: Default Instrument Panel
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => document.getElementById('panel-builder-load')?.click()}
            className="px-3 py-1.5 bg-[#252628] hover:bg-[#2d2e30] border border-[#2d2e30] text-[10px] font-bold uppercase transition-colors flex items-center gap-2 text-white rounded-md"
            title="Load layout from JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            Load
          </button>
          <input
            type="file"
            id="panel-builder-load"
            className="hidden"
            accept=".json,application/json"
            onChange={onFileChange}
          />
          <button
            onClick={handleSaveFile}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase transition-colors flex items-center gap-2 rounded-md"
            title="Save layout to JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </header>

      {/* ─── Main: canvas + sidebar ──────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 bg-[#0a0a0f] p-4 flex gap-2 relative">
          <div className="w-full h-full border-2 border-dashed border-[#2d2e30] flex relative">
            <InstrumentPanel
              node={rootNode}
              onChange={setRootNode}
              onRemoveNode={() => setRootNode(createEmptyRoot())}
              isRoot
              frame={frame}
            />
          </div>
        </main>

        <Sidebar />
      </div>

      {/* ─── Status bar ───────────────────────────────────────────── */}
      <footer className="h-6 bg-[#161719] border-t border-[#2d2e30] flex items-center px-4 justify-between text-[10px] shrink-0">
        <div className="flex gap-4">
          <span className="text-emerald-500">READY</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">NODE_RENDERER: ACTIVE</span>
        </div>
        <div className="text-gray-500 font-mono">pilot-panel-config @ localStorage</div>
      </footer>
    </div>
  );
};

export default PanelBuilder;

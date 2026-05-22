/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileJson, Play, Pause, Activity, Database, Radio, LayoutDashboard, Monitor, ArrowLeft, Zap, Gauge, Terminal, Settings } from 'lucide-react';
import { TelemetryFrame } from './types';
import { sampleFrames } from './sample-data';
import { PFD } from './components/PFD/PFD';
import RawMonitor from './components/RawMonitor/RawMonitor';
import { PanelBuilder } from './components/PanelBuilder';
import { TelemetryProvider } from './context/TelemetryContext';
import { UI_SETTINGS } from './ui-settings';

type DataMode = 'sample' | 'live';
type ConnStatus = 'disconnected' | 'connecting' | 'receiving' | 'waiting';
type ViewPage = 'hub' | 'pfd' | 'rawMonitor' | 'panelBuilder' | 'settings';

type SourceStatus = {
  udpHost: string;
  udpPort: number;
  active: boolean;
  schema: string;
  source: string;
};

const LIVE_PFD_URL = '/events/pfd';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewPage>('hub');
  const [frame, setFrame] = useState<TelemetryFrame>(sampleFrames[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pfd' | 'data'>('pfd');
  const [dataMode, setDataMode] = useState<DataMode>('sample');
  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected');
  const [liveSeq, setLiveSeq] = useState<number | null>(null);
  const [sourceStatus, setSourceStatus] = useState<SourceStatus | null>(null);
  const [settingsHost, setSettingsHost] = useState('0.0.0.0');
  const [settingsPort, setSettingsPort] = useState('14443');
  const [settingsBusy, setSettingsBusy] = useState(false);

  const frameRef = useRef(frameIndex);
  const eventSourceRef = useRef<EventSource | null>(null);

  // ---- Sample animation ----
  useEffect(() => {
    if (dataMode !== 'sample') return;
    let animationId: number;
    let lastTime = 0;
    const tick = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = time - lastTime;
      if (dt > 33) {
        frameRef.current = (frameRef.current + 1) % sampleFrames.length;
        setFrameIndex(frameRef.current);
        setFrame(sampleFrames[frameRef.current]);
        lastTime = time;
      }
      if (isPlaying) animationId = requestAnimationFrame(tick);
    };
    if (isPlaying) animationId = requestAnimationFrame(tick);
    return () => { if (animationId) cancelAnimationFrame(animationId); };
  }, [isPlaying, dataMode]);

  // ---- Live SSE connection ----
  const connectLive = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus('connecting');
    const es = new EventSource(LIVE_PFD_URL);
    eventSourceRef.current = es;
    es.addEventListener('open', () => { setConnStatus('waiting'); setError(null); });
    es.addEventListener('pfd-frame', (event) => {
      try {
        const data: TelemetryFrame = JSON.parse(event.data);
        setFrame(data); setLiveSeq(data.seq ?? null);
        setConnStatus('receiving'); setError(null);
      } catch { setError('Failed to parse pfd-frame'); }
    });
    es.addEventListener('status', (event) => {
      try {
        const status = JSON.parse(event.data);
        const fresh = status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3000;
        setConnStatus(fresh ? 'receiving' : 'waiting');
      } catch { /* ignore */ }
    });
    es.addEventListener('error', () => { setConnStatus('disconnected'); setError('SSE connection lost. Retrying...'); });
  }, []);

  const disconnectLive = useCallback(() => {
    if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
    setConnStatus('disconnected'); setLiveSeq(null);
  }, []);

  const loadSourceStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/source/status');
      if (!res.ok) return;
      const data: SourceStatus = await res.json();
      setSourceStatus(data);
    } catch {
      // ignore temporary fetch errors
    }
  }, []);

  useEffect(() => {
    if (dataMode === 'live') { setIsPlaying(false); connectLive(); }
    else disconnectLive();
    return () => { disconnectLive(); };
  }, [dataMode, connectLive, disconnectLive]);

  useEffect(() => {
    loadSourceStatus();
    const id = window.setInterval(loadSourceStatus, 1500);
    return () => window.clearInterval(id);
  }, [loadSourceStatus]);

  useEffect(() => {
    if (!sourceStatus) return;
    if (currentView !== 'settings') {
      setSettingsHost(sourceStatus.udpHost);
      setSettingsPort(String(sourceStatus.udpPort));
    }
  }, [sourceStatus, currentView]);

  // ---- Handlers ----
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        setFrame(json as TelemetryFrame); setIsPlaying(false); setError(null);
      } catch { setError('Failed to parse JSON file.'); }
    };
    reader.readAsText(file);
  };

  const openViewer = () => { window.location.href = '/viewer/'; };

  const saveSourceSettings = async () => {
    const port = Number(settingsPort);
    if (!Number.isFinite(port) || port < 1 || port > 65535) {
      setError('Invalid UDP port (1-65535)');
      return;
    }
    setSettingsBusy(true);
    try {
      const res = await fetch('/api/source/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: settingsHost.trim() || '0.0.0.0', port }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error || 'Failed to update source');
      } else {
        setError(null);
        await loadSourceStatus();
      }
    } catch {
      setError('Failed to update source');
    } finally {
      setSettingsBusy(false);
    }
  };

  const connStatusColor = { disconnected: 'bg-red-500', connecting: 'bg-yellow-500', waiting: 'bg-yellow-500', receiving: 'bg-green-500' }[connStatus];
  const connStatusLabel = { disconnected: 'disconnected', connecting: 'connecting...', waiting: 'waiting UDP', receiving: 'receiving UDP' }[connStatus];

  // ═══════════════════════════════════════════════ HUB VIEW
  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
              <span className="text-blue-400">Pilot</span>{' '}
              <span className="text-purple-400">3D</span>{' '}
              <span className="text-green-400">PFD</span>
            </h1>
            <p className="text-white/40 text-lg">Primary Flight Display &middot; Live Telemetry &middot; Diagnostic Viewer</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-5 gap-4">
            {/* PFD Card */}
            <button
              onClick={() => setCurrentView('pfd')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-8 text-left hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 group-hover:animate-pulse" />
              <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-5">
                <LayoutDashboard className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Primary Flight Display</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Attitude indicator, airspeed tape, altitude tape,<br />
                AoA, vertical speed. Sample &amp; Live UDP modes.
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium">
                <Play className="w-4 h-4" /> Open PFD &rarr;
              </div>
            </button>

            {/* Raw Data Monitor Card */}
            <button
              onClick={() => setCurrentView('rawMonitor')}
              className="group relative bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-8 text-left hover:border-emerald-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-emerald-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse" />
              <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-5">
                <Terminal className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Raw Data Monitor</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Live parser output inspector,<br />
                decoded parameters, raw hex view.
              </p>
              <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-medium">
                <Zap className="w-4 h-4" /> Open Monitor &rarr;
              </div>
            </button>

            {/* Panel Builder Card */}
            <button
              onClick={() => setCurrentView('panelBuilder')}
              className="group relative bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/20 rounded-2xl p-8 text-left hover:border-amber-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-amber-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400 group-hover:animate-pulse" />
              <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-5">
                <LayoutDashboard className="w-8 h-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Panel Builder</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Design custom instrument layouts,<br />
                drag-and-drop cockpit composition.
              </p>
              <div className="flex items-center gap-2 mt-4 text-amber-400 text-sm font-medium">
                <Zap className="w-4 h-4" /> Open Builder &rarr;
              </div>
            </button>

            {/* Viewer Card */}
            <button
              onClick={openViewer}
              className="group relative bg-gradient-to-br from-cyan-900/40 to-teal-900/40 border border-cyan-500/20 rounded-2xl p-8 text-left hover:border-cyan-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-pulse" />
              <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-5">
                <Monitor className="w-8 h-8 text-cyan-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Diagnostic Viewer</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Live telemetry stream, capture control,<br />
                recording replay, raw frame inspector.
              </p>
              <div className="flex items-center gap-2 mt-4 text-cyan-400 text-sm font-medium">
                <Zap className="w-4 h-4" /> Open Viewer &rarr;
              </div>
            </button>

            {/* Settings Card */}
            <button
              onClick={() => setCurrentView('settings')}
              className="group relative bg-gradient-to-br from-violet-900/40 to-fuchsia-900/40 border border-violet-500/20 rounded-2xl p-8 text-left hover:border-violet-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-violet-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-400 group-hover:animate-pulse" />
              <div className="p-3 bg-violet-500/20 rounded-xl w-fit mb-5">
                <Settings className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Global Source Settings</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Runtime decoder source config,<br />
                one UDP host/port for all pages.
              </p>
              <div className="flex items-center gap-2 mt-4 text-violet-400 text-sm font-medium">
                <Zap className="w-4 h-4" /> Open Settings &rarr;
              </div>
            </button>
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-center gap-6 text-white/30 text-xs">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" /> source: udp://{sourceStatus?.udpHost ?? '...'}:{sourceStatus?.udpPort ?? '...'}
            </span>
            <span>{sourceStatus?.schema ?? 'telemetry-frame.v1'}</span>
            <span>{sourceStatus?.active ? 'active' : 'inactive'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════ RAW MONITOR VIEW
  if (currentView === 'rawMonitor') {
    return <RawMonitor onBack={() => setCurrentView('hub')} />;
  }

  // ═══════════════════════════════════════════════ PANEL BUILDER VIEW
  if (currentView === 'panelBuilder') {
    return (
      <TelemetryProvider frame={frame}>
        <PanelBuilder onBack={() => setCurrentView('hub')} />
      </TelemetryProvider>
    );
  }

  // ═══════════════════════════════════════════════ SETTINGS VIEW
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('hub')}
                className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
                title="Back to Hub"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-white text-xl font-semibold">Global Source Settings</h1>
            </div>
            <span className="text-xs text-white/40 font-mono">
              {sourceStatus?.source ?? 'tnparser-udp-...'}
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-white/60 mb-2">UDP host</label>
              <input
                value={settingsHost}
                onChange={(e) => setSettingsHost(e.target.value)}
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">UDP port</label>
              <input
                value={settingsPort}
                onChange={(e) => setSettingsPort(e.target.value)}
                className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
              />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-sm font-medium text-white mb-3">UI settings</div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-white/70">Instrument tooltip font size</div>
                  <div className="text-xs text-white/35">
                    Common value from UI_SETTINGS.tooltip.fontSizePx
                  </div>
                </div>
                <div className="font-mono text-lg text-emerald-300">
                  {UI_SETTINGS.tooltip.fontSizePx}px
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-white/40 text-sm">
                active: {sourceStatus?.active ? 'yes' : 'no'} | schema: {sourceStatus?.schema ?? 'telemetry-frame.v1'}
              </span>
              <button
                onClick={saveSourceSettings}
                disabled={settingsBusy}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                {settingsBusy ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════ PFD VIEW
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('hub')}
              className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              title="Back to Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-medium text-lg tracking-tight">Primary Flight Display</h1>
              <p className="text-white/50 text-sm">telemetry-frame.v1 viewer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Data source toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setDataMode('sample')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === 'sample' ? 'bg-purple-500/20 text-purple-400' : 'text-white/60 hover:text-white'}`}
              >
                <Play className="w-4 h-4" /> Sample
              </button>
              <button
                onClick={() => setDataMode('live')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === 'live' ? 'bg-green-500/20 text-green-400' : 'text-white/60 hover:text-white'}`}
              >
                <Radio className="w-4 h-4" /> Live
              </button>
            </div>

            {dataMode === 'live' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className={`w-2 h-2 rounded-full ${connStatusColor}`} />
                <span className="text-white/60 text-sm">{connStatusLabel}</span>
                {liveSeq !== null && <span className="text-white/30 text-xs">#{liveSeq}</span>}
              </div>
            )}

            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('pfd')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'pfd' ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white'}`}
              >
                <Activity className="w-4 h-4" /> Display
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${activeTab === 'data' ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white'}`}
              >
                <Database className="w-4 h-4" /> Data
              </button>
            </div>

            {dataMode === 'sample' && (
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            {error && <span className="text-red-400 text-sm font-medium max-w-[200px] truncate">{error}</span>}
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 transition text-white text-sm font-medium rounded-lg border border-white/10">
              <Upload className="w-4 h-4" /> Upload JSON
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </header>

        <main className="w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 select-none flex">
          {activeTab === 'pfd' ? (
            <PFD frame={frame} />
          ) : (
            <div className="w-full h-full p-6 overflow-auto text-sm font-mono text-green-400 bg-black/90">
              <pre>{JSON.stringify(frame, null, 2)}</pre>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

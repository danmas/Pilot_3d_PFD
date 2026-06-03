/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { Upload, FileJson, Play, Pause, Activity, Database, Radio, LayoutDashboard, Monitor, ArrowLeft, Zap, Gauge, Terminal, Settings, Plane } from 'lucide-react';
import { TelemetryFrame } from './types';
import { sampleFrames } from './sample-data';
import RawMonitor from './components/RawMonitor/RawMonitor';
import { PanelBuilder } from './components/PanelBuilder';
import { PanelDisplay } from './components/PanelBuilder/PanelDisplay';
import { TelemetryProvider } from './context/TelemetryContext';
import { UI_SETTINGS } from './ui-settings';
import { telemetryRef } from './telemetryRef';
import { aircraftControlsRef } from './aircraftControlsRef';
import {
  getProfiles as getPanelProfiles,
  saveProfile as savePanelProfile,
  loadProfile as loadPanelProfile,
  saveCurrentProfile as saveCurrentPanelProfile,
  CURRENT_PROFILE_ID,
} from './stores/panelStore';
import {
  getProfiles as getServerProfiles,
  loadProfile as loadServerProfile,
  saveProfile as saveServerProfile,
} from './stores/profileStore';
import type { PanelProfile } from './stores/profileStore';

const Aircraft3DInstrument = React.lazy(() => import('./components/Instruments/LazyAircraft3DInstrument'));

type DataMode = 'sample' | 'live' | 'replay';
type ConnStatus = 'disconnected' | 'connecting' | 'receiving' | 'waiting';
type ViewPage = 'hub' | 'pfd' | 'rawMonitor' | 'panelBuilder' | 'settings' | 'aircraft3d';

type SourceStatus = {
  udpHost: string;
  udpPort: number;
  active: boolean;
  schema: string;
  source: string;
};

type SimulatorInitialConfig = {
  altitudeFt: number;
  casKt: number;
  throttle: number;
  pitchDeg: number;
};

type SimulatorProfile = {
  id: string;
  name: string;
  description: string;
  durationMs: number;
};

type SimulatorInitialPreset = {
  id: string;
  name: string;
  description: string;
  config: SimulatorInitialConfig;
};

type SimulatorProfileRunResult = {
  ok: boolean;
  frames?: number;
  telemetryRecordingId?: string;
  blackboxRecordingId?: string;
  telemetryPath?: string;
  blackboxPath?: string;
  initialConfig?: SimulatorInitialConfig;
  preset?: SimulatorInitialPreset | null;
  error?: string;
};

type ActiveProfileReplay = {
  profileId: string;
  presetId: string;
  recordingId: string;
  frames: number;
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
  const [settingsSimAltitudeFt, setSettingsSimAltitudeFt] = useState('10000');
  const [settingsSimCasKt, setSettingsSimCasKt] = useState('250');
  const [settingsSimThrottlePct, setSettingsSimThrottlePct] = useState('60');
  const [settingsSimPitchDeg, setSettingsSimPitchDeg] = useState('3');
  const [settingsBusy, setSettingsBusy] = useState(false);

  const [backendMode, setBackendMode] = useState<'udp' | 'simulator'>('udp');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFrames, setRecordingFrames] = useState(0);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [replayFrames, setReplayFrames] = useState<TelemetryFrame[]>([]);
  const [replayIndex, setReplayIndex] = useState(0);
  const [simulatorProfiles, setSimulatorProfiles] = useState<SimulatorProfile[]>([]);
  const [selectedSimulatorProfileId, setSelectedSimulatorProfileId] = useState('trim_hold_60s');
  const [simulatorInitialPresets, setSimulatorInitialPresets] = useState<SimulatorInitialPreset[]>([]);
  const [selectedSimulatorPresetId, setSelectedSimulatorPresetId] = useState('cruise_10000_250');
  const [profileRunBusy, setProfileRunBusy] = useState(false);
  const [profileRunResult, setProfileRunResult] = useState<SimulatorProfileRunResult | null>(null);
  const [activeProfileReplay, setActiveProfileReplay] = useState<ActiveProfileReplay | null>(null);

  // ── Profile state ──
  const [profiles, setProfiles] = useState<PanelProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('default');
  const [profilesLoading, setProfilesLoading] = useState(true);

  const frameRef = useRef(frameIndex);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());

  // ── Telemetry callback from AircraftModel (must be before any conditional return) ──
  const telemetryCallbackRef = useRef(setFrame);
  telemetryCallbackRef.current = setFrame;
  useEffect(() => {
    console.log('[App] wiring onTelemetryUpdate');
    (window as any).__appControlsRef = aircraftControlsRef;
    aircraftControlsRef.current.onTelemetryUpdate = (f: Record<string, unknown>) => {
      telemetryCallbackRef.current(f as TelemetryFrame);
    };
    return () => {
      console.log('[App] cleanup onTelemetryUpdate');
      aircraftControlsRef.current.onTelemetryUpdate = null;
    };
  }, []);

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
        const f = sampleFrames[frameRef.current];
        // Don't overwrite telemetry when joystick has locked it
        if (!aircraftControlsRef.current.telemetryLocked) {
          telemetryRef.current = f;
        }
        setFrame(f);
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
        telemetryRef.current = data;
        setFrame(data); setLiveSeq(data.seq ?? null);
        setConnStatus('receiving'); setError(null);
      } catch { setError('Failed to parse pfd-frame'); }
    });
    es.addEventListener('status', (event) => {
      try {
        const status = JSON.parse(event.data);
        const fresh = (status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3000) || status.simulatorActive;
        setConnStatus(fresh ? 'receiving' : 'waiting');
        if (status.simulatorMode) {
          setBackendMode(status.simulatorMode);
        }
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

  const loadSimulatorConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator/config');
      if (!res.ok) return;
      const data: SimulatorInitialConfig = await res.json();
      setSettingsSimAltitudeFt(String(Math.round(data.altitudeFt)));
      setSettingsSimCasKt(String(Math.round(data.casKt)));
      setSettingsSimThrottlePct(String(Math.round(data.throttle * 100)));
      setSettingsSimPitchDeg(String(data.pitchDeg));
    } catch {
      // ignore temporary fetch errors
    }
  }, []);

  const loadSimulatorProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator/profiles');
      if (!res.ok) return;
      const data: SimulatorProfile[] = await res.json();
      setSimulatorProfiles(data);
      if (data.length > 0 && !data.some((profile) => profile.id === selectedSimulatorProfileId)) {
        setSelectedSimulatorProfileId(data[0].id);
      }
    } catch {
      // ignore temporary fetch errors
    }
  }, [selectedSimulatorProfileId]);

  const loadSimulatorInitialPresets = useCallback(async () => {
    try {
      const res = await fetch('/api/simulator/profile-presets');
      if (!res.ok) return;
      const data: SimulatorInitialPreset[] = await res.json();
      setSimulatorInitialPresets(data);
      if (data.length > 0 && !data.some((preset) => preset.id === selectedSimulatorPresetId)) {
        setSelectedSimulatorPresetId(data[0].id);
      }
    } catch {
      // ignore temporary fetch errors
    }
  }, [selectedSimulatorPresetId]);

  useEffect(() => {
    if (dataMode === 'live') { setIsPlaying(false); connectLive(); }
    else disconnectLive();
    return () => { disconnectLive(); };
  }, [dataMode, connectLive, disconnectLive]);

  useEffect(() => {
    loadSourceStatus();
    loadSimulatorConfig();
    loadSimulatorProfiles();
    loadSimulatorInitialPresets();
    const id = window.setInterval(loadSourceStatus, 1500);
    return () => window.clearInterval(id);
  }, [loadSourceStatus, loadSimulatorConfig, loadSimulatorProfiles, loadSimulatorInitialPresets]);

  useEffect(() => {
    if (!sourceStatus) return;
    if (currentView !== 'settings') {
      setSettingsHost(sourceStatus.udpHost);
      setSettingsPort(String(sourceStatus.udpPort));
    }
  }, [sourceStatus, currentView]);

  useEffect(() => {
    if (currentView === 'settings') {
      void loadSimulatorConfig();
    }
  }, [currentView, loadSimulatorConfig]);

  // ── Load profiles on mount ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getServerProfiles();
        if (cancelled) return;
        setProfiles(list);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setProfilesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Switch profile ──
  const handleProfileChange = useCallback(async (profileId: string) => {
    if (profileId === selectedProfileId) return;
    // 1. Save current panel config to current
    try {
      const rootNode = (window as any).__panelBuilderRootNode;
      if (rootNode) {
        const json = JSON.stringify(rootNode, null, 2);
        await saveCurrentPanelProfile(json);
      }
    } catch { /* ignore */ }

    // 2. Load new profile
    const profile = await loadServerProfile(profileId);
    if (!profile) return;

    // 3. If profile has a panel config linked, load it
    if (profile.panelConfigName) {
      const panelJson = await loadPanelProfile(profile.panelConfigName);
      if (panelJson) {
        // Trigger panel reload in PanelBuilder on next open
        (window as any).__pendingPanelLoad = JSON.parse(panelJson);
      }
    }

    setSelectedProfileId(profileId);
  }, [selectedProfileId]);

  // ---- Flight Simulator & Recordings Poll ----
  const loadRecordings = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setRecordings(data);
      }
    } catch {}
  }, []);

  const checkCaptureStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/capture/status');
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (dataMode !== 'live') return;
    loadRecordings();
    checkCaptureStatus();
    const id = setInterval(() => {
      loadRecordings();
      checkCaptureStatus();
    }, 2000);
    return () => clearInterval(id);
  }, [dataMode, loadRecordings, checkCaptureStatus]);

  // ---- Simulator controls keyboard input listeners ----
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      pressedKeys.current.add(e.key.toLowerCase());
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'spacebar'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Send controls to backend at 20Hz (every 50ms)
  useEffect(() => {
    if (dataMode !== 'live' || backendMode !== 'simulator') return;

    let currentRoll = 0;
    let currentPitch = 0;
    let currentRudder = 0;
    let currentThrottle = 0.6;

    // Fetch initial controls
    fetch('/api/simulator/status')
      .then(res => res.json())
      .then(data => {
        if (data?.controls) {
          currentRoll = data.controls.roll;
          currentPitch = data.controls.pitch;
          currentRudder = data.controls.rudder;
          currentThrottle = data.controls.throttle;
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      const keys = pressedKeys.current;
      
      let targetRoll = 0;
      let targetPitch = 0;
      let targetRudder = 0;

      if (keys.has('a') || keys.has('arrowleft')) targetRoll = -1.0;
      else if (keys.has('d') || keys.has('arrowright')) targetRoll = 1.0;

      if (keys.has('w') || keys.has('arrowup')) targetPitch = -1.0; // nose down
      else if (keys.has('s') || keys.has('arrowdown')) targetPitch = 1.0; // nose up

      if (keys.has('q')) targetRudder = -1.0;
      else if (keys.has('e')) targetRudder = 1.0;

      // Centering spring simulation
      currentRoll += (targetRoll - currentRoll) * 0.35;
      currentPitch += (targetPitch - currentPitch) * 0.35;
      currentRudder += (targetRudder - currentRudder) * 0.35;

      if (keys.has('shift')) {
        currentThrottle = Math.min(1.0, currentThrottle + 0.015);
      }
      if (keys.has('control')) {
        currentThrottle = Math.max(0.0, currentThrottle - 0.015);
      }

      // Reset shortcut
      if (keys.has(' ') || keys.has('r')) {
        resetSimulation();
      }

      fetch('/api/simulator/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roll: currentRoll,
          pitch: currentPitch,
          rudder: currentRudder,
          throttle: currentThrottle,
          pilot: {
            keys: Array.from(keys),
            rollCmdRaw: targetRoll,
            pitchCmdRaw: targetPitch,
            rudderCmdRaw: targetRudder,
            throttleCmdRaw: currentThrottle
          }
        })
      }).catch(() => {});
    }, 50);

    return () => clearInterval(interval);
  }, [dataMode, backendMode]);

  // ---- Replay playback timer ----
  useEffect(() => {
    if (dataMode !== 'replay' || replayFrames.length === 0 || !isPlaying) return;

    const interval = setInterval(() => {
      setReplayIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= replayFrames.length) {
          setIsPlaying(false);
          return prevIndex;
        }
        const f = replayFrames[nextIndex];
        telemetryRef.current = f;
        setFrame(f);
        return nextIndex;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [dataMode, replayFrames, isPlaying]);

  // ---- Simulator REST API requests ----
  const setBackendSimulatorMode = async (mode: 'udp' | 'simulator') => {
    try {
      const res = await fetch('/api/simulator/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      if (res.ok) {
        setBackendMode(mode);
        setError(null);
      }
    } catch {
      setError('Failed to switch backend mode');
    }
  };

  const resetSimulation = async () => {
    try {
      await fetch('/api/simulator/reset', { method: 'POST' });
    } catch {}
  };

  const runSimulatorProfile = async () => {
    try {
      setProfileRunBusy(true);
      setProfileRunResult(null);
      const res = await fetch('/api/simulator/profile/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId
        })
      });
      const data: SimulatorProfileRunResult = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run simulator profile');
      }
      setProfileRunResult(data);
      setError(null);
      await loadRecordings();
      if (data.telemetryRecordingId) {
        setActiveTab('pfd');
        setActiveProfileReplay({
          profileId: selectedSimulatorProfileId,
          presetId: selectedSimulatorPresetId,
          recordingId: data.telemetryRecordingId,
          frames: data.frames ?? 0
        });
        await startReplay(data.telemetryRecordingId);
      }
    } catch (e: any) {
      const message = e?.message || 'Failed to run simulator profile';
      setProfileRunResult({ ok: false, error: message });
      setError(message);
    } finally {
      setProfileRunBusy(false);
    }
  };

  const handleStartCapture = async () => {
    try {
      const res = await fetch('/api/capture/start', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        setRecordingFrames(data.frames);
      }
    } catch {}
  };

  const handleStopCapture = async () => {
    try {
      const res = await fetch('/api/capture/stop', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setIsRecording(data.active);
        await loadRecordings();
      }
    } catch {}
  };

  const startReplay = async (recordingId: string) => {
    try {
      setError('Loading recording...');
      const res = await fetch(`/api/recordings/${recordingId}/range?limit=50000`);
      if (!res.ok) throw new Error('Failed to load recording frames');
      const frames = await res.json();
      if (!Array.isArray(frames) || frames.length === 0) {
        throw new Error('Recording is empty');
      }
      setReplayFrames(frames);
      setReplayIndex(0);
      telemetryRef.current = frames[0];
      setFrame(frames[0]);
      setDataMode('replay');
      setIsPlaying(true);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to start replay');
    }
  };

  // ---- Handlers ----
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        telemetryRef.current = json as TelemetryFrame;
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

    const altitudeFt = Number(settingsSimAltitudeFt);
    const casKt = Number(settingsSimCasKt);
    const throttlePct = Number(settingsSimThrottlePct);
    const pitchDeg = Number(settingsSimPitchDeg);

    if (!Number.isFinite(altitudeFt) || altitudeFt < 0 || altitudeFt > 60000) {
      setError('Invalid simulator altitude (0-60000 ft)');
      return;
    }
    if (!Number.isFinite(casKt) || casKt < 60 || casKt > 500) {
      setError('Invalid simulator CAS (60-500 kt)');
      return;
    }
    if (!Number.isFinite(throttlePct) || throttlePct < 0 || throttlePct > 100) {
      setError('Invalid simulator throttle (0-100%)');
      return;
    }
    if (!Number.isFinite(pitchDeg) || pitchDeg < -10 || pitchDeg > 15) {
      setError('Invalid simulator pitch (-10..15 deg)');
      return;
    }

    setSettingsBusy(true);
    try {
      const [sourceRes, simulatorRes] = await Promise.all([
        fetch('/api/source/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ host: settingsHost.trim() || '0.0.0.0', port }),
        }),
        fetch('/api/simulator/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            altitudeFt,
            casKt,
            throttle: throttlePct / 100,
            pitchDeg,
          }),
        }),
      ]);

      if (!sourceRes.ok) {
        const e = await sourceRes.json().catch(() => ({}));
        setError(e.error || 'Failed to update source');
      } else if (!simulatorRes.ok) {
        const e = await simulatorRes.json().catch(() => ({}));
        setError(e.error || 'Failed to update simulator');
      } else {
        const simulatorData = await simulatorRes.json().catch(() => null);
        const config = simulatorData?.initialConfig as SimulatorInitialConfig | undefined;
        if (config) {
          setSettingsSimAltitudeFt(String(Math.round(config.altitudeFt)));
          setSettingsSimCasKt(String(Math.round(config.casKt)));
          setSettingsSimThrottlePct(String(Math.round(config.throttle * 100)));
          setSettingsSimPitchDeg(String(config.pitchDeg));
        }
        setError(null);
        await loadSourceStatus();
      }
    } catch {
      setError('Failed to update settings');
    } finally {
      setSettingsBusy(false);
    }
  };

  const connStatusColor = { disconnected: 'bg-red-500', connecting: 'bg-yellow-500', waiting: 'bg-yellow-500', receiving: 'bg-green-500' }[connStatus];
  const connStatusLabel = { disconnected: 'disconnected', connecting: 'connecting...', waiting: 'waiting UDP', receiving: 'receiving UDP' }[connStatus];

  // ═══════════════════════════════════════════════ HUB VIEW
  if (currentView === 'hub') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center p-8 pt-16">
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
              <span className="text-blue-400">Pilot</span>{' '}
              <span className="text-purple-400">3D</span>{' '}
              <span className="text-green-400">PFD</span>
            </h1>
            <p className="text-white/40 text-lg">Flight Display &middot; Live Telemetry &middot; Diagnostic Viewer</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-4">
            {/* PFD Card */}
            <button
              onClick={() => setCurrentView('pfd')}
              className="group relative bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-2xl p-8 text-left hover:border-blue-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-blue-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-400 group-hover:animate-pulse" />
              <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-5">
                <LayoutDashboard className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Flight Display</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Attitude indicator, airspeed tape, altitude tape,<br />
                AoA, vertical speed. Sample &amp; Live UDP modes.
              </p>
              <div className="flex items-center gap-2 mt-4 text-blue-400 text-sm font-medium">
                <Play className="w-4 h-4" /> Open PFD &rarr;
              </div>
            </button>

            {/* 3D Aircraft Card */}
            <button
              onClick={() => setCurrentView('aircraft3d')}
              className="group relative bg-gradient-to-br from-sky-900/40 to-indigo-900/40 border border-sky-500/20 rounded-2xl p-8 text-left hover:border-sky-400/50 hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-sky-500/10"
            >
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-sky-400 group-hover:animate-pulse" />
              <div className="p-3 bg-sky-500/20 rounded-xl w-fit mb-5">
                <Plane className="w-8 h-8 text-sky-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">3D Aircraft</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Full-screen 3D aircraft instrument:<br />
                GLB models, projection modes, orbit camera.
              </p>
              <div className="flex items-center gap-2 mt-4 text-sky-400 text-sm font-medium">
                <Zap className="w-4 h-4" /> Open 3D &rarr;
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

  // ═══════════════════════════════════════════════ 3D AIRCRAFT VIEW
  if (currentView === 'aircraft3d') {
    return (
      <div className="h-screen w-screen bg-[#121212] flex flex-col overflow-hidden">
        {/* Minimal header with back button */}
        <div className="shrink-0 flex items-center gap-3 bg-black/60 px-4 py-2 border-b border-white/10">
          <button
            onClick={() => setCurrentView('hub')}
            className="p-1.5 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
            title="Back to Hub"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
            <Plane className="w-5 h-5" />
          </div>
          <h1 className="text-white font-medium text-base tracking-tight">3D Aircraft</h1>
          <span className="text-white/30 text-xs ml-auto">Pitch / Roll / Heading &middot; telemetry-frame.v1</span>
        </div>
        {/* Full-page instrument */}
        <div className="flex-1 min-h-0">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-white/30">Loading 3D...</div>}>
            <Aircraft3DInstrument frame={frame} />
          </Suspense>
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-start justify-center p-6 pt-16">
        <div className="w-full max-w-3xl bg-black/40 border border-white/10 rounded-2xl p-6">
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
              <div className="text-sm font-medium text-white mb-3">Simulator initial state</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Start altitude, ft</label>
                  <input
                    type="number"
                    min={0}
                    max={60000}
                    value={settingsSimAltitudeFt}
                    onChange={(e) => setSettingsSimAltitudeFt(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Start CAS, kt</label>
                  <input
                    type="number"
                    min={60}
                    max={500}
                    value={settingsSimCasKt}
                    onChange={(e) => setSettingsSimCasKt(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Start throttle, %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={settingsSimThrottlePct}
                    onChange={(e) => setSettingsSimThrottlePct(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Start pitch, deg</label>
                  <input
                    type="number"
                    min={-10}
                    max={15}
                    step={0.1}
                    value={settingsSimPitchDeg}
                    onChange={(e) => setSettingsSimPitchDeg(e.target.value)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded-lg text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-xs text-white/35 mt-3">
                Applies on simulator start/reset. Active simulation keeps current state until reset.
              </div>
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
    <div className="h-screen w-screen bg-[#121212] flex flex-col overflow-hidden p-3">
      <div className="w-full h-full flex flex-col gap-3 min-h-0">
        <header className="shrink-0 flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg">
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
              <h1 className="text-white font-medium text-lg tracking-tight">Flight Display</h1>
              <p className="text-white/50 text-sm">saved PanelBuilder layout &middot; telemetry-frame.v1</p>
            </div>

            {/* ── Profile selector ── */}
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex items-center gap-1">
              <select
                className="bg-white/10 border border-white/10 text-xs text-white rounded px-2 py-1.5 max-w-[160px] cursor-pointer outline-none focus:border-blue-500"
                value={selectedProfileId}
                onChange={(e) => void handleProfileChange(e.target.value)}
                disabled={profilesLoading}
              >
                {profilesLoading ? (
                  <option value="">Loading...</option>
                ) : profiles.length === 0 ? (
                  <option value="">No profiles</option>
                ) : (
                  profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.panelConfigName ? ` (${p.panelConfigName})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Data source toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => { setDataMode('sample'); setActiveProfileReplay(null); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === 'sample' ? 'bg-purple-500/20 text-purple-400' : 'text-white/60 hover:text-white'}`}
              >
                <Play className="w-4 h-4" /> Sample
              </button>
              <button
                onClick={() => { setDataMode('live'); setActiveProfileReplay(null); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center gap-2 ${dataMode === 'live' ? 'bg-green-500/20 text-green-400' : 'text-white/60 hover:text-white'}`}
              >
                <Radio className="w-4 h-4" /> Live
              </button>
              {dataMode === 'replay' && (
                <span className="px-3 py-1.5 rounded-md text-sm font-medium bg-blue-500/20 text-blue-400 flex items-center gap-2">
                  <FileJson className="w-4 h-4" /> Replay Mode
                </span>
              )}
            </div>

            {dataMode === 'live' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className={`w-2 h-2 rounded-full ${connStatusColor}`} />
                <span className="text-white/60 text-sm">
                  {backendMode === 'simulator' ? 'Simulating' : connStatusLabel}
                </span>
                {liveSeq !== null && <span className="text-white/30 text-xs">#{liveSeq}</span>}
              </div>
            )}

            {dataMode === 'replay' && activeProfileReplay && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-white/35'}`} />
                <span className="text-purple-200 text-sm">
                  Profile {isPlaying ? 'running' : 'paused'}
                </span>
                <span className="text-purple-200/50 text-xs font-mono">
                  {replayIndex + 1}/{replayFrames.length || activeProfileReplay.frames}
                </span>
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

            {(dataMode === 'sample' || dataMode === 'replay') && (
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

        <div className="flex flex-1 min-h-0 gap-4 w-full">
          <div className="flex flex-1 min-w-0 min-h-0 flex-col">
            <main className="w-full flex-1 min-h-0 bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 select-none flex">
              {activeTab === 'pfd' ? (
                <PanelDisplay frame={frame} />
              ) : (
                <div className="w-full h-full p-6 overflow-auto text-sm font-mono text-green-400 bg-black/90">
                  <pre>{JSON.stringify(frame, null, 2)}</pre>
                </div>
              )}
            </main>

            {/* Replay Timeline Scrubber */}
            {dataMode === 'replay' && replayFrames.length > 0 && (
              <div className="mt-4 bg-black/45 border border-white/10 rounded-xl p-4 flex flex-col gap-2 shadow-lg backdrop-blur-md">
                <div className="flex justify-between items-center text-xs text-white/50">
                  <span className="font-mono">Time: {(frame.timeMs / 1000).toFixed(1)}s</span>
                  <span className="font-mono">Total: {((replayFrames[replayFrames.length - 1]?.timeMs ?? 0) / 1000).toFixed(1)}s</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={replayFrames.length - 1}
                  value={replayIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setReplayIndex(idx);
                    setFrame(replayFrames[idx]);
                  }}
                  className="w-full accent-blue-500 bg-zinc-750 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Simulator Panel / Playback List */}
          {(dataMode === 'live' || dataMode === 'replay') && (
            <div className="w-80 shrink-0 overflow-y-auto bg-black/40 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 text-white shadow-lg backdrop-blur-md">
              <div className="flex flex-col gap-1">
                <h3 className="text-md font-bold tracking-tight">Backend Source Mode</h3>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 w-full mt-1">
                  <button
                    onClick={() => setBackendSimulatorMode('udp')}
                    className={`flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === 'udp' ? 'bg-blue-600/90 text-white shadow-sm shadow-black/40 cursor-pointer' : 'text-white/60 hover:text-white cursor-pointer'}`}
                  >
                    UDP Stream
                  </button>
                  <button
                    onClick={() => setBackendSimulatorMode('simulator')}
                    className={`flex-1 py-1 rounded-md text-xs font-semibold transition text-center ${backendMode === 'simulator' ? 'bg-purple-600/90 text-white shadow-sm shadow-black/40 cursor-pointer' : 'text-white/60 hover:text-white cursor-pointer'}`}
                  >
                    Simulator
                  </button>
                </div>
              </div>

              {backendMode === 'simulator' && (
                <div className="flex flex-col gap-4 border-t border-white/5 pt-3 animate-fadeIn">
                  {/* Visual controls deflection box */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Stick Control</span>
                    <div className="w-32 h-32 bg-zinc-950/80 border border-zinc-800 rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
                      <div className="absolute w-full h-[1px] bg-zinc-900" />
                      <div className="absolute h-full w-[1px] bg-zinc-900" />
                      <div
                        className="w-3.5 h-3.5 bg-red-500 rounded-full absolute transition-all duration-75 shadow-lg shadow-red-500/50"
                        style={{
                          left: `calc(50% + ${(frame.FCU_Roll_Left ?? 0) * 42}% - 7px)`,
                          top: `calc(50% + ${(frame.FCU_Pitch_Left ?? 0) * -42}% - 7px)`
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-white/30 text-center font-mono">
                      Roll: {((frame.FCU_Roll_Left ?? 0) * 100).toFixed(0)}% | Pitch: {((frame.FCU_Pitch_Left ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Throttle progress bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50 font-mono font-semibold">
                      <span>Throttle (Shift/Ctrl)</span>
                      <span>{Math.round(frame.Engine_N1_Target_Left ?? 60)}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-75"
                        style={{ width: `${Math.max(0, Math.min(100, frame.Engine_N1_Target_Left ?? 60))}%` }}
                      />
                    </div>
                  </div>

                  {/* Keyboard guide and Reset button */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-[11px] text-white/50 flex flex-col gap-1.5">
                    <div className="font-semibold text-white/70 mb-0.5">Control Bindings:</div>
                    <div className="flex justify-between"><span>Pitch (Elevator):</span> <kbd className="bg-zinc-800 text-white/80 px-1 rounded font-semibold">W / S</kbd></div>
                    <div className="flex justify-between"><span>Roll (Aileron):</span> <kbd className="bg-zinc-800 text-white/80 px-1 rounded font-semibold">A / D</kbd></div>
                    <div className="flex justify-between"><span>Yaw (Rudder):</span> <kbd className="bg-zinc-800 text-white/80 px-1 rounded font-semibold">Q / E</kbd></div>
                    <div className="flex justify-between"><span>Thrust:</span> <kbd className="bg-zinc-800 text-white/80 px-1 rounded font-semibold">Shift / Ctrl</kbd></div>
                    <div className="flex justify-between"><span>Reset Simulation:</span> <kbd className="bg-zinc-800 text-white/80 px-1 rounded font-semibold">Space / R</kbd></div>
                    
                    <button
                      onClick={resetSimulation}
                      className="mt-2 w-full py-1.5 bg-zinc-850 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold transition border border-white/5 cursor-pointer"
                    >
                      Reset Plane
                    </button>
                  </div>
                </div>
              )}

              {/* Scripted simulator profiles */}
              <div className="border-t border-white/10 pt-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60">Scripted Profiles</span>
                  <span className="text-[10px] text-white/35 font-mono">{simulatorProfiles.length} tests</span>
                </div>

                {activeProfileReplay && dataMode === 'replay' && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-purple-200 font-semibold">Profile Replay</span>
                      <span className="text-purple-200/60 font-mono">
                        {isPlaying ? 'RUNNING' : replayIndex >= replayFrames.length - 1 ? 'FINISHED' : 'PAUSED'}
                      </span>
                    </div>
                    <div className="text-[10px] text-purple-100/60 font-mono truncate" title={activeProfileReplay.recordingId}>
                      {activeProfileReplay.profileId} / {activeProfileReplay.presetId}
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden bg-black/40 border border-white/5">
                      <div
                        className="h-full bg-purple-400 transition-all duration-75"
                        style={{
                          width: `${Math.min(100, Math.max(0, ((replayIndex + 1) / Math.max(1, replayFrames.length || activeProfileReplay.frames)) * 100))}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-purple-100/50 font-mono">
                      <span>Frame {replayIndex + 1}</span>
                      <span>{replayFrames.length || activeProfileReplay.frames}</span>
                    </div>
                    <div className="text-[10px] text-purple-100/45 leading-snug">
                      `trim_hold_60s` специально почти неподвижен: это проверка удержания CAS/ALT/G.
                    </div>
                  </div>
                )}

                <select
                  value={selectedSimulatorProfileId}
                  onChange={(e) => {
                    setSelectedSimulatorProfileId(e.target.value);
                    setProfileRunResult(null);
                  }}
                  className="w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60"
                >
                  {simulatorProfiles.length === 0 ? (
                    <option value="trim_hold_60s">trim_hold_60s</option>
                  ) : (
                    simulatorProfiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.id} ({Math.round(profile.durationMs / 1000)}s)
                      </option>
                    ))
                  )}
                </select>

                {simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)?.description && (
                  <div className="text-[11px] text-white/45 leading-snug">
                    {simulatorProfiles.find((profile) => profile.id === selectedSimulatorProfileId)?.description}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-1">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Initial Conditions</div>
                  <select
                    value={selectedSimulatorPresetId}
                    onChange={(e) => {
                      setSelectedSimulatorPresetId(e.target.value);
                      setProfileRunResult(null);
                    }}
                    className="w-full px-2.5 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white text-xs font-mono outline-none focus:border-purple-500/60"
                  >
                    {simulatorInitialPresets.length === 0 ? (
                      <option value="cruise_10000_250">Cruise 250 kt / 10000 ft</option>
                    ) : (
                      simulatorInitialPresets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))
                    )}
                  </select>

                  {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId) && (
                    <div className="rounded-lg bg-white/[0.025] border border-white/5 p-2 text-[10px] font-mono text-white/50 grid grid-cols-2 gap-x-3 gap-y-1">
                      <span>ALT {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.config.altitudeFt} ft</span>
                      <span>CAS {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.config.casKt} kt</span>
                      <span>THR {Math.round((simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.config.throttle ?? 0) * 100)}%</span>
                      <span>PITCH {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.config.pitchDeg} deg</span>
                    </div>
                  )}

                  {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.description && (
                    <div className="text-[11px] text-white/35 leading-snug">
                      {simulatorInitialPresets.find((preset) => preset.id === selectedSimulatorPresetId)?.description}
                    </div>
                  )}
                </div>

                <button
                  onClick={runSimulatorProfile}
                  disabled={profileRunBusy}
                  className="w-full py-2 bg-purple-600/15 border border-purple-500/25 hover:bg-purple-600/25 disabled:opacity-50 disabled:hover:bg-purple-600/15 text-purple-300 rounded-lg text-xs font-semibold transition cursor-pointer disabled:cursor-not-allowed"
                >
                  {profileRunBusy ? 'Running profile...' : 'Run Profile'}
                </button>

                {profileRunResult && (
                  <div className={`rounded-lg border p-2 text-[10px] leading-snug font-mono ${profileRunResult.ok ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' : 'border-red-500/20 bg-red-500/5 text-red-300'}`}>
                    {profileRunResult.ok ? (
                      <div className="flex flex-col gap-1">
                        <div>OK: {profileRunResult.frames} frames</div>
                        {profileRunResult.telemetryRecordingId && <div>REPLAY: {profileRunResult.telemetryRecordingId}</div>}
                        {profileRunResult.initialConfig && (
                          <div>
                            INIT: {profileRunResult.initialConfig.altitudeFt}ft / {profileRunResult.initialConfig.casKt}kt / THR {Math.round(profileRunResult.initialConfig.throttle * 100)}% / P {profileRunResult.initialConfig.pitchDeg}deg
                          </div>
                        )}
                        <div className="truncate" title={profileRunResult.telemetryPath}>TEL: {profileRunResult.telemetryPath}</div>
                        <div className="truncate" title={profileRunResult.blackboxPath}>BB: {profileRunResult.blackboxPath}</div>
                      </div>
                    ) : (
                      <div>{profileRunResult.error}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Recording Controller */}
              <div className="border-t border-white/10 pt-3.5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/60">Flight Recording</span>
                  {isRecording && (
                    <span className="flex items-center gap-1 text-[11px] text-red-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      REC ({recordingFrames} f)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      onClick={handleStartCapture}
                      className="flex-1 py-2 bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 text-red-400 rounded-lg text-xs font-semibold transition text-center cursor-pointer"
                    >
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={handleStopCapture}
                      className="flex-1 py-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition text-center cursor-pointer"
                    >
                      Stop Recording
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Recordings List */}
              <div className="border-t border-white/10 pt-3.5 flex flex-col gap-2 min-h-0">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Recent Recordings</span>
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-48 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                  {recordings.length === 0 ? (
                    <span className="text-xs text-white/30 italic py-1">No recordings yet</span>
                  ) : (
                    recordings.slice(0, 5).map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => startReplay(rec.id)}
                        className="text-left p-2 rounded bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition flex items-center justify-between text-xs group w-full cursor-pointer"
                      >
                        <div className="truncate flex flex-col gap-0.5 max-w-[80%]">
                          <span className="font-semibold text-white/80 group-hover:text-blue-400 transition truncate">{rec.id}</span>
                          <span className="text-[10px] text-white/40 font-mono">{(rec.bytes / 1024).toFixed(1)} KB</span>
                        </div>
                        <Play className="w-3.5 h-3.5 text-white/40 group-hover:text-blue-400 transition flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

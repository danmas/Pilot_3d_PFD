/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileJson, Play, Pause, Activity, Database, Radio } from 'lucide-react';
import { PFDFrame } from './types';
import { sampleFrames } from './sample-data';
import { PFD } from './components/PFD/PFD';

type DataMode = 'sample' | 'live';
type ConnStatus = 'disconnected' | 'connecting' | 'receiving' | 'waiting';

const LIVE_PFD_URL = '/events/pfd';

export default function App() {
  const [frame, setFrame] = useState<PFDFrame>(sampleFrames[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'pfd' | 'data'>('pfd');
  const [dataMode, setDataMode] = useState<DataMode>('sample');
  const [connStatus, setConnStatus] = useState<ConnStatus>('disconnected');
  const [liveSeq, setLiveSeq] = useState<number | null>(null);

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

      // Update at roughly 30fps
      if (dt > 33) {
        frameRef.current = (frameRef.current + 1) % sampleFrames.length;
        setFrameIndex(frameRef.current);
        setFrame(sampleFrames[frameRef.current]);
        lastTime = time;
      }

      if (isPlaying) {
        animationId = requestAnimationFrame(tick);
      }
    };

    if (isPlaying) {
      animationId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying, dataMode]);

  // ---- Live SSE connection ----
  const connectLive = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnStatus('connecting');
    const es = new EventSource(LIVE_PFD_URL);
    eventSourceRef.current = es;

    es.addEventListener('open', () => {
      setConnStatus('waiting');
      setError(null);
    });

    es.addEventListener('pfd-frame', (event) => {
      try {
        const pfdFrame: PFDFrame = JSON.parse(event.data);
        if (pfdFrame.schema === 'pfd-frame.v1') {
          setFrame(pfdFrame);
          setLiveSeq(pfdFrame.seq);
          setConnStatus('receiving');
          setError(null);
        }
      } catch (err) {
        setError('Failed to parse pfd-frame');
      }
    });

    es.addEventListener('status', (event) => {
      try {
        const status = JSON.parse(event.data);
        const fresh = status.lastPacketAgeMs !== null && status.lastPacketAgeMs < 3000;
        setConnStatus(fresh ? 'receiving' : 'waiting');
      } catch {
        // ignore status parse errors
      }
    });

    es.addEventListener('error', () => {
      setConnStatus('disconnected');
      setError('SSE connection lost. Retrying...');
    });
  }, []);

  const disconnectLive = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus('disconnected');
    setLiveSeq(null);
  }, []);

  // Connect/disconnect live when mode changes
  useEffect(() => {
    if (dataMode === 'live') {
      setIsPlaying(false);
      connectLive();
    } else {
      disconnectLive();
    }
    return () => {
      disconnectLive();
    };
  }, [dataMode, connectLive, disconnectLive]);

  // ---- Handlers ----
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (json.schema === 'pfd-frame.v1') {
          setFrame(json);
          setIsPlaying(false);
          setError(null);
        } else {
          setError('Invalid schema version. Expected pfd-frame.v1');
        }
      } catch (err) {
        setError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const connStatusColor = {
    disconnected: 'bg-red-500',
    connecting: 'bg-yellow-500',
    waiting: 'bg-yellow-500',
    receiving: 'bg-green-500',
  }[connStatus];

  const connStatusLabel = {
    disconnected: 'disconnected',
    connecting: 'connecting...',
    waiting: 'waiting UDP',
    receiving: 'receiving UDP',
  }[connStatus];

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-medium text-lg tracking-tight">Primary Flight Display</h1>
              <p className="text-white/50 text-sm">pfd-frame.v1 viewer</p>
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

            {/* Connection status (live mode) */}
            {dataMode === 'live' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                <span className={`w-2 h-2 rounded-full ${connStatusColor}`} />
                <span className="text-white/60 text-sm">{connStatusLabel}</span>
                {liveSeq !== null && (
                  <span className="text-white/30 text-xs">#{liveSeq}</span>
                )}
              </div>
            )}

            {/* Tab toggle */}
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

            {/* Play/Pause (sample only) */}
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
              <Upload className="w-4 h-4" />
              Upload JSON
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

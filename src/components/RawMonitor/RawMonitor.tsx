/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Radio, WifiOff, ArrowLeft, ChevronDown, ChevronRight, ChevronUp, Copy, Monitor } from 'lucide-react';

type ConnStatus = 'idle' | 'connecting' | 'receiving' | 'waiting' | 'error';

interface RawFrame {
  decoded: Record<string, number>;
  hex: string | null;
  receivedAt?: string;
}

interface RawStatus {
  port: number;
  active: boolean;
  receivedPackets: number;
  receivedFrames: number;
  lastPacketAgeMs: number | null;
  lastDecodedKeys: number;
  sseClients: number;
  lastError?: string;
}

const DEFAULT_PORT = 14442;
const RAW_SSE_URL = '/events/raw';

interface Props {
  onBack: () => void;
}

export default function RawMonitor({ onBack }: Props) {
  const [port, setPort] = useState(DEFAULT_PORT);
  const [portInput, setPortInput] = useState(String(DEFAULT_PORT));
  const [listening, setListening] = useState(false);
  const [connStatus, setConnStatus] = useState<ConnStatus>('idle');
  const [lastFrame, setLastFrame] = useState<RawFrame | null>(null);
  const [status, setStatus] = useState<RawStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHex, setShowHex] = useState(false);
  const [showAllKeys, setShowAllKeys] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const frameCountRef = useRef(0);

  // ── connect SSE ──
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) eventSourceRef.current.close();
    setConnStatus('connecting');
    setError(null);
    const es = new EventSource(RAW_SSE_URL);
    eventSourceRef.current = es;

    es.addEventListener('open', () => setConnStatus('waiting'));
    es.addEventListener('raw-frame', (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastFrame(data);
        frameCountRef.current += 1;
        setConnStatus('receiving');
        setError(null);
      } catch { setError('Failed to parse raw-frame'); }
    });
    es.addEventListener('status', (event) => {
      try {
        const s: RawStatus = JSON.parse(event.data);
        setStatus(s);
        setListening(s.active);
        if (s.active) {
          const fresh = s.lastPacketAgeMs !== null && s.lastPacketAgeMs < 3000;
          setConnStatus(fresh ? 'receiving' : 'waiting');
        }
      } catch { /* ignore */ }
    });
    es.addEventListener('error', () => {
      setConnStatus('error');
      setError('SSE connection lost. Retrying...');
    });
  }, []);

  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnStatus('idle');
  }, []);

  // ── start / stop monitor ──
  const startMonitor = async () => {
    const p = Number(portInput);
    if (!Number.isFinite(p) || p < 1 || p > 65535) {
      setError('Invalid port number (1-65535)');
      return;
    }
    setPort(p);
    setError(null);
    try {
      const res = await fetch('/api/raw/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: p }),
      });
      const data = await res.json();
      if (res.ok) {
        setListening(true);
        connectSSE();
      } else {
        setError(data.error || 'Failed to start monitor');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    }
  };

  const stopMonitor = async () => {
    disconnectSSE();
    try {
      await fetch('/api/raw/stop', { method: 'POST' });
    } catch { /* ignore */ }
    setListening(false);
    setConnStatus('idle');
    setLastFrame(null);
    setStatus(null);
  };

  // ── cleanup ──
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  // ── derived ──
  const statusColor = {
    idle: 'bg-white/20',
    connecting: 'bg-yellow-500',
    waiting: 'bg-yellow-500',
    receiving: 'bg-green-500',
    error: 'bg-red-500',
  }[connStatus];

  const statusLabel = {
    idle: 'idle',
    connecting: 'connecting...',
    waiting: 'waiting for data',
    receiving: 'receiving',
    error: 'error',
  }[connStatus];

  const decodedEntries = lastFrame?.decoded
    ? Object.entries(lastFrame.decoded)
    : [];

  const displayEntries = showAllKeys
    ? decodedEntries
    : decodedEntries.slice(0, 20);

  const packetAge =
    status?.lastPacketAgeMs !== null && status?.lastPacketAgeMs !== undefined
      ? `${status.lastPacketAgeMs}ms ago`
      : '—';

  // ── copy hex ──
  const copyHex = () => {
    if (lastFrame?.hex) navigator.clipboard.writeText(lastFrame.hex);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col p-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <header className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-lg transition text-white/60 hover:text-white"
              title="Back to Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-white font-medium text-lg tracking-tight">Raw Data Monitor</h1>
              <p className="text-white/50 text-sm">Live parser output inspector</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <span className={`w-2 h-2 rounded-full ${statusColor}`} />
              <span className="text-white/60 text-sm">{statusLabel}</span>
            </div>

            {/* Stats */}
            {status && (
              <div className="flex items-center gap-4 text-white/40 text-xs">
                <span>packets: {status.receivedPackets}</span>
                <span>frames: {status.receivedFrames}</span>
                <span>age: {packetAge}</span>
              </div>
            )}
          </div>
        </header>

        {/* Control bar */}
        <div className="flex items-center gap-4 bg-black/30 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <label className="text-white/60 text-sm font-medium">UDP Port:</label>
            <input
              type="number"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              disabled={listening}
              className="w-24 px-3 py-1.5 bg-black/50 border border-white/20 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-emerald-400/50 disabled:opacity-40 disabled:cursor-not-allowed"
              min={1}
              max={65535}
            />
          </div>

          {!listening ? (
            <button
              onClick={startMonitor}
              className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 transition text-white text-sm font-medium rounded-lg"
            >
              <Play className="w-4 h-4" /> Start
            </button>
          ) : (
            <button
              onClick={stopMonitor}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600/70 hover:bg-red-500 transition text-white text-sm font-medium rounded-lg"
            >
              <Pause className="w-4 h-4" /> Stop
            </button>
          )}

          {error && (
            <span className="text-red-400 text-sm font-medium truncate max-w-[400px]">{error}</span>
          )}
        </div>

        {/* Data display */}
        {lastFrame ? (
          <div className="flex flex-col gap-4">
            {/* Parameter table */}
            <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <h2 className="text-white/80 text-sm font-semibold flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  Decoded Parameters
                  <span className="text-white/30 font-normal">
                    ({decodedEntries.length} fields)
                  </span>
                </h2>
                <span className="text-white/30 text-xs">
                  last: {lastFrame.receivedAt ?? '—'}
                </span>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-black/60">
                    <tr className="text-white/40 text-xs uppercase tracking-wider">
                      <th className="text-left px-4 py-2 font-medium">Parameter</th>
                      <th className="text-right px-4 py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {displayEntries.map(([key, value]) => (
                      <tr
                        key={key}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-2 text-white/70 font-mono text-xs">
                          {key}
                        </td>
                        <td className="px-4 py-2 text-right text-emerald-400 font-mono text-xs tabular-nums">
                          {Number.isFinite(value) ? (value as number).toFixed(4) : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {decodedEntries.length > 20 && (
                <button
                  onClick={() => setShowAllKeys(!showAllKeys)}
                  className="w-full px-4 py-2 text-white/40 hover:text-white/70 text-xs flex items-center justify-center gap-1 border-t border-white/5 hover:bg-white/[0.02] transition"
                >
                  {showAllKeys ? (
                    <>Show less <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Show all {decodedEntries.length} fields <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>

            {/* Raw hex */}
            {lastFrame.hex && (
              <div className="bg-black/30 rounded-xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setShowHex(!showHex)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition"
                >
                  <span className="text-white/80 text-sm font-semibold flex items-center gap-2">
                    {showHex ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    )}
                    Raw Hex
                    <span className="text-white/30 font-normal text-xs">
                      (first 512 bytes)
                    </span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyHex();
                    }}
                    className="p-1.5 hover:bg-white/10 rounded transition text-white/40 hover:text-white/80"
                    title="Copy hex"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </button>
                {showHex && (
                  <div className="px-4 pb-4">
                    <pre className="text-xs font-mono text-amber-400/70 bg-black/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto select-all">
                      {lastFrame.hex}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-white/20 gap-3">
            <WifiOff className="w-12 h-12" />
            <p className="text-sm">
              {listening ? 'Waiting for UDP data...' : 'Start the monitor to receive parser data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

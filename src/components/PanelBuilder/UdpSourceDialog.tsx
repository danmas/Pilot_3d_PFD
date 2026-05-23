/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

type SourceStatus = {
  udpHost: string;
  udpPort: number;
  active: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export const UdpSourceDialog: React.FC<Props> = ({ open, onClose }) => {
  const [host, setHost] = useState('0.0.0.0');
  const [port, setPort] = useState('14443');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SourceStatus | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    void (async () => {
      try {
        const res = await fetch('/api/source/status');
        if (!res.ok) return;
        const data: SourceStatus = await res.json();
        setStatus(data);
        setHost(data.udpHost);
        setPort(String(data.udpPort));
      } catch {
        // keep defaults
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const apply = async () => {
    const portNum = Number(port);
    if (!Number.isFinite(portNum) || portNum < 1 || portNum > 65535) {
      setError('Invalid UDP port (1-65535)');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/source/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: host.trim() || '0.0.0.0', port: portNum }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error || 'Failed to update source');
        return;
      }
      const next: SourceStatus = await res.json();
      setStatus(next);
      onClose();
    } catch {
      setError('Failed to update source');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md bg-[#161719] border border-[#2d2e30] rounded-lg shadow-2xl p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="udp-dialog-title"
      >
        <h2 id="udp-dialog-title" className="text-sm font-bold text-white mb-4">
          UDP Source
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide">
              Host
            </label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[11px] text-gray-400 mb-1.5 uppercase tracking-wide">
              Port
            </label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-2 bg-[#0a0a0f] border border-[#2d2e30] rounded-md text-white font-mono text-sm focus:outline-none focus:border-blue-500/50"
            />
          </div>
          {status && (
            <div className="text-[10px] text-gray-500 font-mono">
              active: {status.active ? 'yes' : 'no'} | udp://{status.udpHost}:{status.udpPort}
            </div>
          )}
          {error && <div className="text-red-400 text-xs">{error}</div>}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-[#252628] rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void apply()}
            disabled={busy}
            className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-md transition-colors"
          >
            {busy ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};

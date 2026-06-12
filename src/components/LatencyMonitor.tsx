/**
 * LatencyMonitor — замер display latency по методике DOCS/Latency-Measurement-Methodology.md.
 *
 * Измеряет end-to-end: от T₀ (UDP read в bridge) до T₁ (rAF paint в браузере).
 * Вариант A: полный путь «UDP → экран» через два процесса.
 */
import React, { useRef, useCallback, useEffect, useState, memo } from 'react';

/* ─── Типы ─── */

/** Одна запись замера (строка CSV) */
export interface LatencySample {
  frame_id: number;
  t_recv_ms: number;   // T₀ — bridge socket.on('message')
  t_decoded_ms: number; // T_decode — bridge после parse
  t_paint_ms: number;   // T₁ — браузер после rAF
  processing_ms: number; // t_decoded_ms - t_recv_ms
  display_ms: number;    // t_paint_ms - t_recv_ms
}

/* ─── Кольцевой буфер ─── */
const MAX_SAMPLES = 5000;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

/* ─── Глобальное хранилище (mutable ref, не триггерит ререндер) ─── */
const samples: LatencySample[] = [];
let sampleCount = 0;

export function addSample(s: LatencySample): void {
  if (samples.length < MAX_SAMPLES) {
    samples.push(s);
  } else {
    samples[sampleCount % MAX_SAMPLES] = s;
  }
  sampleCount++;
}

export function getSamples(): LatencySample[] {
  return [...samples];
}

export function getStats() {
  if (samples.length === 0) {
    return { count: 0, p50: 0, p95: 0, p99: 0, max: 0, over100: 0, over100Pct: 0, processingP99: 0 };
  }
  const displaySorted = samples.map(s => s.display_ms).sort((a, b) => a - b);
  const procSorted = samples.map(s => s.processing_ms).sort((a, b) => a - b);
  const over100 = displaySorted.filter(v => v > 100).length;
  return {
    count: samples.length,
    p50: percentile(displaySorted, 50),
    p95: percentile(displaySorted, 95),
    p99: percentile(displaySorted, 99),
    max: displaySorted[displaySorted.length - 1],
    over100,
    over100Pct: samples.length > 0 ? (over100 / samples.length) * 100 : 0,
    processingP99: percentile(procSorted, 99),
  };
}

/* ─── Экспорт CSV ─── */
export function exportCsv(): string {
  const header = 'frame_id,t_recv_ms,t_decoded_ms,t_paint_ms,processing_ms,display_ms';
  const rows = samples.map(s =>
    `${s.frame_id},${s.t_recv_ms},${s.t_decoded_ms},${s.t_paint_ms},${s.processing_ms},${s.display_ms}`
  );
  return [header, ...rows].join('\n');
}

/* ─── Компонент-оверлей ─── */
export const LatencyOverlay: React.FC = memo(() => {
  const [stats, setStats] = useState(() => getStats());

  useEffect(() => {
    const t = setInterval(() => setStats(getStats()), 500);
    return () => clearInterval(t);
  }, []);

  const handleExport = useCallback(() => {
    const csv = exportCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `latency_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    samples.length = 0;
    sampleCount = 0;
    setStats(getStats());
  }, []);

  const fmt = (v: number) => v.toFixed(1);

  return (
    <div style={{
      position: 'fixed', bottom: 8, left: 8, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
      borderRadius: 6, padding: '6px 10px',
      fontFamily: "'Courier New', monospace", fontSize: 10,
      color: '#a0aec0', lineHeight: 1.5,
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>
        ⏱ Latency
      </div>
      <div>N: <span style={{ color: '#e2e8f0' }}>{stats.count}</span></div>
      <div>
        P50: <span style={{ color: '#48bb78' }}>{fmt(stats.p50)}</span>
        {' '}P95: <span style={{ color: '#ecc94b' }}>{fmt(stats.p95)}</span>
        {' '}P99: <span style={{ color: '#fc8181' }}>{fmt(stats.p99)}</span>
        {' '}MAX: <span style={{ color: '#f56565' }}>{fmt(stats.max)}</span>
      </div>
      <div>
        &gt;100ms: <span style={{ color: stats.over100 > 0 ? '#f56565' : '#48bb78' }}>
          {stats.over100} ({fmt(stats.over100Pct)}%)
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <button
          onClick={handleExport}
          style={{
            background: 'rgba(59,130,246,0.3)', border: '1px solid #3b82f6',
            color: '#93c5fd', borderRadius: 3, padding: '1px 6px',
            fontSize: 9, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          CSV
        </button>
        <button
          onClick={handleReset}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#a0aec0', borderRadius: 3, padding: '1px 6px',
            fontSize: 9, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
});

LatencyOverlay.displayName = 'LatencyOverlay';

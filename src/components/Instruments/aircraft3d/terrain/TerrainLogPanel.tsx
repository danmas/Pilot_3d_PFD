/**
 * TerrainLogPanel.tsx — полупрозрачное окошко с логами загрузки terrain тайлов.
 *
 * Располагается в правом верхнем углу под ALT (HUD).
 * Каждые 2 секунды опрашивает /api/terrain/logs и показывает последние записи.
 *
 * Цвета:
 *   🟢 HIT — тайл из кэша (серверного или клиентского)
 *   🔴 MISS — загрузка из Mapbox через наш прокси
 *   🟡 ERROR / TIMEOUT / QUOTA_EXCEEDED — ошибки
 */

import { useState, useEffect, useRef } from 'react';

export interface TerrainLogEntry {
  t: string;           // ISO timestamp
  coord: { z: number; x: number; y: number };
  type: 'dem' | 'sat';
  status: 'HIT' | 'MISS' | 'ERROR' | 'TIMEOUT' | 'QUOTA_EXCEEDED';
  error?: string;
  quotaTotal?: number;
}

const MAX_VISIBLE = 30;

const LOG_COLORS: Record<string, string> = {
  HIT: 'text-green-400',       // кэш
  MISS: 'text-red-400',        // Mapbox fetch
  ERROR: 'text-yellow-300',    // ошибка
  TIMEOUT: 'text-yellow-300',  // таймаут
  QUOTA_EXCEEDED: 'text-orange-400', // квота кончилась
};

const STATUS_LABELS: Record<string, string> = {
  HIT: 'CACHE',
  MISS: 'MAPBOX',
  ERROR: 'ERROR',
  TIMEOUT: 'T/O',
  QUOTA_EXCEEDED: 'QUOTA',
};

export function TerrainLogPanel() {
  const [logs, setLogs] = useState<TerrainLogEntry[]>([]);
  const [visible, setVisible] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchLogs() {
      try {
        const res = await fetch('/api/terrain/logs?limit=40');
        if (!res.ok) return;
        const data: TerrainLogEntry[] = await res.json();
        if (mounted) {
          setLogs(data);
        }
      } catch {
        // игнорируем ошибки сети
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Авто-скролл вниз при новых логах
  useEffect(() => {
    if (scrollRef.current && visible) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, visible]);

  // Показываем только последние MAX_VISIBLE записей
  const displayLogs = logs.slice(-MAX_VISIBLE);

  // Считаем статистику
  const hitCount = logs.filter(l => l.status === 'HIT').length;
  const missCount = logs.filter(l => l.status === 'MISS').length;
  const errorCount = logs.filter(l => l.status === 'ERROR' || l.status === 'TIMEOUT').length;
  const total = logs.length;

  if (!visible) {
    return (
      <button
        className="absolute top-2 right-2 mt-[72px] text-[10px] text-white/40 hover:text-white/70
                   bg-black/30 backdrop-blur-sm rounded px-1.5 py-0.5 z-10"
        onClick={() => setVisible(true)}
        title="Показать логи terrain"
      >
        📋
      </button>
    );
  }

  return (
    <div
      className="absolute top-2 right-2 mt-[72px] z-10 select-none"
      style={{ width: '320px', maxHeight: '280px' }}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-0.5">
        <div className="text-[10px] font-mono text-white/50">
          Terrain Log {total > 0 && (
            <span className="text-white/30">
              <span className="text-green-400/60">{hitCount}</span>
              /
              <span className="text-red-400/60">{missCount}</span>
              {errorCount > 0 && (
                <span className="text-yellow-300/60"> !{errorCount}</span>
              )}
            </span>
          )}
        </div>
        <button
          className="text-[10px] text-white/30 hover:text-white/70 leading-none px-1"
          onClick={() => setVisible(false)}
          title="Скрыть логи"
        >
          ✕
        </button>
      </div>

      {/* Список логов */}
      <div
        ref={scrollRef}
        className="bg-black/50 backdrop-blur-sm rounded overflow-y-auto"
        style={{ maxHeight: '245px', scrollbarWidth: 'thin' }}
      >
        {displayLogs.length === 0 ? (
          <div className="text-[10px] font-mono text-white/20 p-2 italic">
            No terrain requests yet
          </div>
        ) : (
          <div className="p-1 space-y-px">
            {displayLogs.map((entry, i) => {
              const time = entry.t ? entry.t.slice(11, 23) : '';
              const c = entry.coord;
              const color = LOG_COLORS[entry.status] || 'text-white/40';
              const label = STATUS_LABELS[entry.status] || entry.status;

              return (
                <div
                  key={i}
                  className={`font-mono text-[9px] leading-tight ${color} truncate`}
                >
                  <span className="text-white/30">{time}</span>{' '}
                  <span className="font-semibold">{label}</span>{' '}
                  <span className="text-white/50">{entry.type}</span>{' '}
                  <span className="text-white/40">{c.z}/{c.x}/{c.y}</span>
                  {entry.error && (
                    <span className="text-yellow-300/60 ml-1">({entry.error})</span>
                  )}
                  {entry.quotaTotal !== undefined && (
                    <span className="text-white/20 ml-1">q:{entry.quotaTotal}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

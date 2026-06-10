/**
 * TerrainDialog — modal for selecting terrain location.
 * Presets + Mapbox geocoding search.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TERRAIN_PRESETS, setTerrainPosition, geocodePlace, type GeocodingResult } from './TerrainManager';

interface TerrainDialogProps {
  token: string;
  currentLat: number;
  currentLon: number;
  onClose: () => void;
}

const STORAGE_KEY = 'pilot-3d-pfd:terrainPos';

function loadSaved(): { lat: number; lon: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function savePos(lat: number, lon: number) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon })); } catch {}
}

export const TerrainDialog: React.FC<TerrainDialogProps> = ({ token, currentLat, currentLon, onClose }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latInput, setLatInput] = useState(currentLat.toFixed(4));
  const [lonInput, setLonInput] = useState(currentLon.toFixed(4));
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const moveTo = useCallback((lat: number, lon: number) => {
    setTerrainPosition(lat, lon);
    savePos(lat, lon);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(async () => {
    if (!search.trim() || !token) return;
    setSearching(true);
    setError(null);
    try {
      const r = await geocodePlace(search.trim(), token);
      setResults(r);
      if (r.length === 0) setError('Ничего не найдено');
    } catch (e) {
      setError((e as Error).message);
    }
    setSearching(false);
  }, [search, token]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  }, [handleSearch]);

  const handleLatLonGo = useCallback(() => {
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    if (isNaN(lat) || isNaN(lon)) return;
    moveTo(lat, lon);
  }, [latInput, lonInput, moveTo]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-gray-900/95 border border-white/15 rounded-xl p-5 w-[420px] max-h-[80vh] overflow-y-auto
                      shadow-2xl shadow-black/50"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-sm font-semibold">🏔 Ландшафт — выбор места</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white text-lg leading-none">&times;</button>
        </div>

        {/* Presets */}
        <div className="mb-4">
          <div className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Пресеты</div>
          <div className="grid grid-cols-2 gap-1.5">
            {TERRAIN_PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => moveTo(p.lat, p.lon)}
                className="text-left px-2 py-1.5 text-[11px] rounded bg-white/10 hover:bg-emerald-600/40
                           text-white/80 hover:text-white transition-colors leading-tight"
              >
                {p.label}
                <br />
                <span className="text-[9px] text-white/30">{p.lat.toFixed(2)}, {p.lon.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-white/10 mb-4" />

        {/* Search */}
        <div className="mb-3">
          <div className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Поиск места</div>
          <div className="flex gap-1.5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Например: Альпы, Париж, Нью-Йорк…"
              className="flex-1 px-2 py-1.5 text-[11px] rounded bg-white/10 border border-white/15
                         text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/50
                         transition-colors"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !search.trim()}
              className="px-3 py-1.5 text-[11px] rounded bg-emerald-600/50 hover:bg-emerald-600/70
                         text-white disabled:opacity-30 transition-colors"
            >
              {searching ? '…' : '🔍'}
            </button>
          </div>
        </div>

        {/* Search results */}
        {results.length > 0 && (
          <div className="mb-3 space-y-1">
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => moveTo(r.lat, r.lon)}
                className="w-full text-left px-2 py-1.5 text-[11px] rounded bg-white/10 hover:bg-emerald-600/40
                           text-white/80 hover:text-white transition-colors leading-tight"
              >
                📍 {r.name}
                <span className="text-white/30 ml-2 text-[9px]">{r.lat.toFixed(4)}, {r.lon.toFixed(4)}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-3 text-[10px] text-red-400">{error}</div>
        )}

        <hr className="border-white/10 mb-3" />

        {/* Manual lat/lon */}
        <div className="mb-3">
          <div className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Точные координаты</div>
          <div className="flex gap-1.5 items-end">
            <div className="flex-1">
              <label className="text-[9px] text-white/30 block mb-0.5">Широта</label>
              <input
                type="text"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLatLonGo()}
                className="w-full px-2 py-1.5 text-[11px] rounded bg-white/10 border border-white/15
                           text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-white/30 block mb-0.5">Долгота</label>
              <input
                type="text"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLatLonGo()}
                className="w-full px-2 py-1.5 text-[11px] rounded bg-white/10 border border-white/15
                           text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <button
              onClick={handleLatLonGo}
              className="px-3 py-1.5 text-[11px] rounded bg-emerald-600/50 hover:bg-emerald-600/70
                         text-white transition-colors"
            >
              GO
            </button>
          </div>
        </div>

        {/* Current position */}
        <div className="text-[9px] text-white/20 text-center">
          Текущая: {currentLat.toFixed(4)}, {currentLon.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

/**
 * MapApp.tsx — схематичная карта тайлов в отдельном окне.
 *
 * - Leaflet без тайл-слоя (тёмный фон), свободный pan/zoom.
 * - Слои тайлов (квадраты-границы без заливки):
 *     • зелёный  — тайлы сейчас в сцене (TerrainManager.getAllTiles)
 *     • серый     — закэшированы на сервере, но не в сцене (/api/terrain/cached)
 *     • красный пунктир — нужны (7×7), но отсутствуют и в сцене, и в кэше
 * - Маркер самолёта + вектор горизонтальной проекции скорости
 *   (длина ∝ путевой скорости, направление = путевой трек).
 * - Компас N/Ю (статичный, north-up) в правом нижнем углу.
 *
 * Данные берёт из BroadcastChannel (главное окно PFD) — ничего не вычисляет.
 */
import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import {
  MAP_CHANNEL,
  type MapStatePacket,
  type TileKey,
  tileKey,
  tileBounds,
} from './mapProtocol';

const CACHE_REFRESH_MS = 5000;

/** SVG силуэта самолёта (нос вверх — север). */
const PLANE_SVG = `<svg viewBox="0 0 24 24"><path d="M12 2 L13.5 9 L22 12 L13.5 12 L13.5 19 L16 21 L16 22 L12 21 L8 22 L8 21 L10.5 19 L10.5 12 L2 12 L10.5 9 Z"/></svg>`;

export function MapApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const sceneLayerRef = useRef<L.LayerGroup | null>(null);
  const cacheLayerRef = useRef<L.LayerGroup | null>(null);
  const missingLayerRef = useRef<L.LayerGroup | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const packetRef = useRef<MapStatePacket | null>(null);
  const cachedTilesRef = useRef<TileKey[]>([]);
  const cachedKeysRef = useRef<Set<string>>(new Set());
  const cachedSigRef = useRef<string>('');
  const lastSceneSigRef = useRef<string>('');
  const lastNeededSigRef = useRef<string>('');
  const hasFitRef = useRef<boolean>(false);
  const hasCenteredRef = useRef<boolean>(false);
  const lastMsgRef = useRef<number>(performance.now());
  const recvLogCount = useRef<number>(0);

  const [connected, setConnected] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [sceneCount, setSceneCount] = useState(0);
  const [missingCount, setMissingCount] = useState(0);

  // ── Перестроение слоёв тайлов ──
  const rebuildLayers = () => {
    const lmap = mapRef.current;
    if (!lmap) return;
    const p = packetRef.current;
    const cachedSet = cachedKeysRef.current;
    const sceneTiles = p?.sceneTiles ?? [];
    const needed = p?.needed ?? [];
    const sceneSet = new Set(sceneTiles.map(tileKey));

    // Сцена — зелёный
    sceneLayerRef.current?.clearLayers();
    for (const t of sceneTiles) {
      L.rectangle(tileBounds(t), {
        color: '#22c55e', weight: 1.5, fill: false, interactive: false,
      }).addTo(sceneLayerRef.current!);
    }

    // Кэш-только — серый
    cacheLayerRef.current?.clearLayers();
    for (const t of cachedTilesRef.current) {
      if (sceneSet.has(tileKey(t))) continue;
      L.rectangle(tileBounds(t), {
        color: '#6b7280', weight: 1, fill: false, opacity: 0.7, interactive: false,
      }).addTo(cacheLayerRef.current!);
    }

    // Отсутствующие (needed \ (scene ∪ cached)) — красный пунктир
    missingLayerRef.current?.clearLayers();
    for (const t of needed) {
      const k = tileKey(t);
      if (sceneSet.has(k) || cachedSet.has(k)) continue;
      L.rectangle(tileBounds(t), {
        color: '#ef4444', weight: 1, fill: false, dashArray: '4 4', opacity: 0.9, interactive: false,
      }).addTo(missingLayerRef.current!);
    }

    setSceneCount(sceneTiles.length);
    setMissingCount(needed.filter((t) => {
      const k = tileKey(t);
      return !sceneSet.has(k) && !cachedSet.has(k);
    }).length);

    // Первичная подгонка вида (только пока не отцентрировались на самолёте)
    if (!hasFitRef.current && !hasCenteredRef.current) {
      const fitTiles = sceneTiles.length > 0 ? sceneTiles : cachedTilesRef.current;
      if (fitTiles.length > 0) {
        const corners: [number, number][] = [];
        for (const t of fitTiles) {
          const b = tileBounds(t);
          corners.push(b[0], b[1]);
        }
        lmap.fitBounds(L.latLngBounds(corners), { padding: [40, 40], maxZoom: 14 });
        hasFitRef.current = true;
      }
    }
  };

  // ── Обновление маркера (самолёт) + вектора скорости ──
  const updateMarker = (p: MapStatePacket) => {
    const lmap = mapRef.current;
    if (!lmap) return;
    const len = p.speed >= 1 ? Math.min(120, (p.speed / 250) * 80) : 0;
    const orient = p.speed >= 1 ? p.track : p.heading; // направление носа
    const vec =
      len > 0
        ? `<div class="mac-vec" style="height:${len}px;transform:rotate(${p.track}deg)"></div>`
        : '';
    const html = `<div class="mac">${vec}<div class="mac-plane" style="transform:rotate(${orient}deg)">${PLANE_SVG}</div><div class="mac-spd">${Math.round(p.speed)} kt</div></div>`;
    const icon = L.divIcon({ className: 'mac-icon', html, iconSize: [0, 0], iconAnchor: [0, 0] });
    if (!markerRef.current) {
      markerRef.current = L.marker([p.lat, p.lon], { icon, interactive: false, zIndexOffset: 1000 }).addTo(lmap);
    } else {
      markerRef.current.setLatLng([p.lat, p.lon]);
      markerRef.current.setIcon(icon);
    }
  };

  // ── Центрировать на самолёте ──
  const recenter = () => {
    const lmap = mapRef.current;
    const p = packetRef.current;
    if (lmap && p && Number.isFinite(p.lat) && Number.isFinite(p.lon)) {
      lmap.setView([p.lat, p.lon], 14, { animate: true });
    }
  };

  // ── Init карты + подписки ──
  useEffect(() => {
    if (!containerRef.current) return;
    const lmap = L.map(containerRef.current, {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: false,
      center: [45.832, 6.865],
      zoom: 12,
      minZoom: 6,
      maxZoom: 17,
      worldCopyJump: true,
    });
    mapRef.current = lmap;
    sceneLayerRef.current = L.layerGroup().addTo(lmap);
    cacheLayerRef.current = L.layerGroup().addTo(lmap);
    missingLayerRef.current = L.layerGroup().addTo(lmap);

    const channel = new BroadcastChannel(MAP_CHANNEL);
    const onMessage = (e: MessageEvent<MapStatePacket>) => {
      const p = e.data;
      if (!p) return;
      packetRef.current = p;
      lastMsgRef.current = performance.now();
      setConnected(true);
      if (recvLogCount.current < 3) {
        recvLogCount.current++;
        console.log('[map] recv', recvLogCount.current,
          { lat: p.lat, lon: p.lon, track: p.track, speed: p.speed, scene: p.sceneTiles.length, needed: p.needed.length });
      }
      const sceneSig = p.sceneTiles.map(tileKey).sort().join(' ');
      const neededSig = p.needed.map(tileKey).sort().join(' ');
      if (sceneSig !== lastSceneSigRef.current || neededSig !== lastNeededSigRef.current) {
        lastSceneSigRef.current = sceneSig;
        lastNeededSigRef.current = neededSig;
        rebuildLayers();
      }
      updateMarker(p);
      // При первом пакете — центрируем карту на самолёте
      if (!hasCenteredRef.current && Number.isFinite(p.lat) && Number.isFinite(p.lon)) {
        hasCenteredRef.current = true;
        lmap.setView([p.lat, p.lon], 14, { animate: true });
      }
    };
    channel.addEventListener('message', onMessage);

    const refreshCache = async () => {
      try {
        const r = await fetch('/api/terrain/cached');
        if (!r.ok) return;
        const data = await r.json();
        const tiles: TileKey[] = Array.isArray(data?.tiles) ? data.tiles : [];
        const sig = tiles.map(tileKey).sort().join(' ');
        setCachedCount(tiles.length);
        if (sig !== cachedSigRef.current) {
          cachedSigRef.current = sig;
          cachedTilesRef.current = tiles;
          cachedKeysRef.current = new Set(tiles.map(tileKey));
          rebuildLayers();
        }
      } catch {
        /* сервер мог быть недоступен */
      }
    };
    refreshCache();
    const cacheTimer = window.setInterval(refreshCache, CACHE_REFRESH_MS);

    // Если главное окно не отвечает — помечаем отключённым
    const watchdog = window.setInterval(() => {
      if (performance.now() - lastMsgRef.current > 3000) setConnected(false);
    }, 1000);

    return () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
      window.clearInterval(cacheTimer);
      window.clearInterval(watchdog);
      lmap.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="map-wrap">
      <style>{`
        .map-wrap { position: relative; width: 100%; height: 100%; background: #0a0a0f; }
        .map-canvas { position: absolute; inset: 0; background: #0a0a0f; }
        .leaflet-container { background: #0a0a0f; }
        .leaflet-control-zoom a { background: #1f2937; color: #d1d5db; border-color: #374151; }
        .leaflet-control-zoom a:hover { background: #374151; }

        /* Маркер самолёта */
        .mac-icon { background: transparent !important; border: none !important; }
        .mac { position: relative; width: 0; height: 0; }
        .mac-plane { position: absolute; left: -13px; top: -13px; width: 26px; height: 26px; transform-origin: center; }
        .mac-plane svg { width: 100%; height: 100%; fill: #22c55e; stroke: #04210f; stroke-width: 1;
          filter: drop-shadow(0 0 5px #22c55e); }
        .mac-vec { position: absolute; left: -1.5px; bottom: 0; width: 3px;
          background: linear-gradient(to top, #22c55e, rgba(34,197,94,0.1));
          transform-origin: bottom center; border-radius: 2px; }
        .mac-spd { position: absolute; left: 16px; top: -8px; font: 11px ui-monospace, monospace;
          color: #22c55e; white-space: nowrap; text-shadow: 0 0 4px #000; }

        /* Оверлеи */
        .map-overlay { position: absolute; z-index: 1000; pointer-events: none;
          font-family: ui-monospace, 'Courier New', monospace; }
        .legend { top: 10px; left: 10px; background: rgba(10,10,15,0.8); border: 1px solid #1f2937;
          border-radius: 6px; padding: 8px 10px; color: #d1d5db; font-size: 11px; line-height: 1.7; }
        .legend .row { display: flex; align-items: center; gap: 6px; }
        .legend .sw { width: 18px; height: 0; border-top: 2px solid; display: inline-block; }
        .legend .sw.green { border-color: #22c55e; }
        .legend .sw.gray { border-color: #6b7280; }
        .legend .sw.red { border-top-style: dashed; border-color: #ef4444; }
        .legend .count { color: #6b7280; margin-left: auto; padding-left: 8px; }

        .status { top: 10px; right: 10px; background: rgba(10,10,15,0.8); border: 1px solid #1f2937;
          border-radius: 6px; padding: 4px 8px; color: #6b7280; font-size: 11px; }
        .status.live { color: #22c55e; }
        .status .dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%;
          margin-right: 5px; vertical-align: middle; }
        .status.live .dot { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
        .status .dot { background: #6b7280; }

        .compass { bottom: 18px; right: 12px; width: 46px; height: 46px;
          background: rgba(10,10,15,0.85); border: 1px solid #1f2937; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; }
        .compass svg { width: 30px; height: 30px; }
        .compass .nl { position: absolute; top: 1px; font-size: 9px; color: #ef4444; font-weight: 700; }
        .compass .sl { position: absolute; bottom: 1px; font-size: 9px; color: #9ca3af; }

        .recenter-btn { bottom: 72px; right: 12px; width: 34px; height: 34px; border-radius: 6px;
          background: rgba(31,41,55,0.9); border: 1px solid #374151; color: #d1d5db; font-size: 18px;
          cursor: pointer; pointer-events: auto; display: flex; align-items: center; justify-content: center; }
        .recenter-btn:hover { background: #374151; }
      `}</style>

      <div ref={containerRef} className="map-canvas" />

      <div className="map-overlay legend">
        <div className="row"><span className="sw green" /> Сцена<span className="count">{sceneCount}</span></div>
        <div className="row"><span className="sw gray" /> Кэш сервера<span className="count">{cachedCount}</span></div>
        <div className="row"><span className="sw red" /> Отсутствуют<span className="count">{missingCount}</span></div>
      </div>

      <div className={`map-overlay status ${connected ? 'live' : ''}`}>
        <span className="dot" />{connected ? 'live' : 'ожидание PFD…'}
      </div>

      <button className="map-overlay recenter-btn" onClick={recenter} title="Центрировать на самолёте">⊕</button>

      <div className="map-overlay compass" title="Север — вверх">
        <span className="nl">N</span>
        <svg viewBox="0 0 30 30">
          <polygon points="15,2 19,15 15,12 11,15" fill="#ef4444" />
          <polygon points="15,28 19,15 15,18 11,15" fill="#9ca3af" />
        </svg>
        <span className="sl">S</span>
      </div>
    </div>
  );
}

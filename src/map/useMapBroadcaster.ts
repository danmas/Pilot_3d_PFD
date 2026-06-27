/**
 * useMapBroadcaster.ts — хук главного окна (сцены 3D).
 *
 * Запускает rAF-цикл (~10 Гц), читает накопленную позицию самолёта,
 * вычисляет геопозицию + путевой вектор и тайлы сцены, и отправляет
 * готовый пакет в BroadcastChannel для окна Карты.
 *
 * Окно Карты ничего не вычисляет — только рисует.
 */
import { useEffect, useRef } from 'react';
import type { TelemetryFrame } from '../types';
import { aircraftPosition, locationRef } from '../components/Instruments/aircraft3d/aircraftPosition';
import { TerrainManager } from '../components/Instruments/aircraft3d/terrain/TerrainManager';
import { MAP_CHANNEL, type MapStatePacket, type TileKey, type ConeMarker } from './mapProtocol';
import { tileWorldUnits } from '../components/Instruments/aircraft3d/terrain/terrainTileUtils';
import sceneConfig from '@/scene-config.json';

const METERS_PER_DEG_LAT = 111320;
const WU_TO_M = 40; // 1 World Unit ≈ 40 м
const MS_TO_KT = 1.94384;
const terrainConfig = (sceneConfig as any).terrain ?? { loadRadius: 3, keepRadius: 4 };
const LOAD_RADIUS = terrainConfig.loadRadius; // совпадает с TerrainManager.loadRadius

export function useMapBroadcaster(frame: TelemetryFrame): void {
  const frameRef = useRef(frame);
  frameRef.current = frame;

  useEffect(() => {
    const channel = new BroadcastChannel(MAP_CHANNEL);
    let raf = 0;
    let last = performance.now();
    let prevX = aircraftPosition.x;
    let prevZ = aircraftPosition.z;
    let lastTrack = 0;
    let lastSpeed = 0;
    let sendLog = 0;

    const tick = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      if (dt >= 0.1) {
        last = now;

        // Δ позиции → путевой вектор (горизонтальная проекция на землю)
        const dx = aircraftPosition.x - prevX;
        const dz = aircraftPosition.z - prevZ;
        // Защита от оборота simple-FDM на ±2000 WU — пропускаем всплеск
        if (Math.abs(dx) < 500 && Math.abs(dz) < 500 && dt > 0) {
          const wuPerSec = Math.hypot(dx, dz) / dt;
          if (wuPerSec > 1e-3) {
            // east = +dx (рост lon), north = -dz (рост lat)
            let tr = (Math.atan2(dx, -dz) * 180) / Math.PI;
            if (tr < 0) tr += 360;
            lastTrack = tr;
          }
          lastSpeed = wuPerSec * WU_TO_M * MS_TO_KT; // WU/s → m/s → kt
        }
        prevX = aircraftPosition.x;
        prevZ = aircraftPosition.z;

        // Геопозиция из locationRef + накопленного смещения (как в useRealTerrain)
        const cosRefLat = Math.cos((locationRef.lat * Math.PI) / 180);
        const simLat = locationRef.lat + (-aircraftPosition.z * WU_TO_M) / METERS_PER_DEG_LAT;
        const simLon = locationRef.lon + (aircraftPosition.x * WU_TO_M) / (METERS_PER_DEG_LAT * cosRefLat);

        // Заголовок (справочно)
        const f = frameRef.current;
        const hRaw = f.Heading1 ?? f.MagneticHeading ?? 0;
        const heading = typeof hRaw === 'number' && Number.isFinite(hRaw) ? hRaw : 0;

        // Тайлы сцены
        const sceneTiles: TileKey[] = TerrainManager.getAllTiles().map((t) => ({
          x: t.coord.x,
          y: t.coord.y,
          z: t.coord.z,
        }));

        // Ожидаемая сетка вокруг центра
        const center = TerrainManager.getCurrentCenter();
        const needed: TileKey[] = [];
        if (center) {
          for (let ddx = -LOAD_RADIUS; ddx <= LOAD_RADIUS; ddx++) {
            for (let ddy = -LOAD_RADIUS; ddy <= LOAD_RADIUS; ddy++) {
              needed.push({ x: center.x + ddx, y: center.y + ddy, z: center.z });
            }
          }
        }

        // ── Конусы-маркеры (вычисляются каждый тик из locationRef —
        //    корректно при смене локации) ──
        const tileWU = tileWorldUnits(14, locationRef.lat) || 200;
        const offsetM = 10 * tileWU * WU_TO_M;
        const cosLat = Math.cos((locationRef.lat * Math.PI) / 180);
        const cones: ConeMarker[] = [
          { lat: locationRef.lat, lon: locationRef.lon, color: 'red', label: 'R' },
          { lat: locationRef.lat + offsetM / METERS_PER_DEG_LAT, lon: locationRef.lon, color: 'blue', label: 'B' },
          { lat: locationRef.lat, lon: locationRef.lon + offsetM / (METERS_PER_DEG_LAT * cosLat), color: 'green', label: 'G' },
        ];

        const packet: MapStatePacket = {
          lat: simLat,
          lon: simLon,
          track: lastTrack,
          speed: lastSpeed,
          heading,
          sceneTiles,
          needed,
          cones,
        };
        if (sendLog < 3) {
          sendLog++;
          console.log('[map-broadcast] send', sendLog,
            { lat: simLat, lon: simLon, track: lastTrack, speed: lastSpeed, scene: sceneTiles.length, needed: needed.length });
        }
        channel.postMessage(packet);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      channel.close();
    };
  }, []);
}

/**
 * TerrainManager — orchestrates tile fetching, caching, and decoding.
 * Singleton pattern for use outside React (e.g., in useFrame).
 */

import {
  latLonToTile,
  tileToLatLon,
  tileGroundSizeMeters,
  decodeTerrainRGB,
  mapboxTileUrl,
  DEFAULT_ZOOM,
  WU_PER_METER,
} from './terrainTileUtils';
import { getTile, putTile, tileCacheKey, clearOlderThan } from './TerrainCache';

/** Mapbox Geocoding API v5 */
const GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export interface GeocodingResult {
  name: string;
  lat: number;
  lon: number;
}

export const TERRAIN_PRESETS: { name: string; lat: number; lon: number; label: string }[] = [
  { name: 'alps',      lat: 46.8182, lon: 8.2275,  label: '🏔 Альпы' },
  { name: 'caucasus',  lat: 43.3499, lon: 42.4453, label: '🏔 Кавказ' },
  { name: 'himalayas', lat: 27.9881, lon: 86.9250, label: '🗻 Гималаи (Эверест)' },
  { name: 'grandcanyon', lat: 36.1069, lon: -112.1129, label: '🏜 Гранд-Каньон' },
  { name: 'andes',     lat: -33.5,   lon: -70.0,   label: '⛰ Анды' },
  { name: 'moscow',    lat: 55.9726, lon: 37.4146, label: '🏙 Москва (Шереметьево)' },
];

export interface TerrainTile {
  z: number;
  x: number;
  y: number;
  /** Center of tile in world units (relative to anchor position) */
  centerWU: { x: number; z: number };
  /** Tile size in world units */
  sizeWU: number;
  /** Decoded height data (512×512 Float32 array, meters) */
  heights: Float32Array | null;
  /** Satellite texture blob (for creating texture) */
  satBlob: Blob | null;
  /** Satellite object URL (for texture loader) */
  satObjectUrl: string | null;
  loading: boolean;
  loaded: boolean;
}

export interface TerrainState {
  anchorLat: number;
  anchorLon: number;
  centerTile: TerrainTile | null;
  token: string;
  ready: boolean;
  error: string | null;
}

type Listener = (state: TerrainState) => void;

class TerrainManagerImpl {
  private token: string;
  private state: TerrainState;
  private listeners = new Set<Listener>();
  private pendingFetches = new Map<string, Promise<void>>();

  constructor(token: string) {
    this.token = token;
    this.state = {
      anchorLat: 0,
      anchorLon: 0,
      centerTile: null,
      token,
      ready: false,
      error: null,
    };
  }

  getState(): TerrainState {
    return this.state;
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify() {
    const s = this.state;
    this.listeners.forEach((fn) => fn(s));
  }

  /**
   * Set anchor position (called when lat/lon changes significantly).
   * Triggers tile loading for the new position.
   */
  async setAnchor(lat: number, lon: number): Promise<void> {
    const zoom = DEFAULT_ZOOM;
    const tile = latLonToTile(lat, lon, zoom);
    const key = tileCacheKey('dem', zoom, tile.x, tile.y);

    // Skip if already at this tile
    if (
      this.state.centerTile?.x === tile.x &&
      this.state.centerTile?.y === tile.y &&
      this.state.centerTile?.z === zoom
    ) {
      return;
    }

    const nw = tileToLatLon(tile.x, tile.y, zoom);
    const sizeM = tileGroundSizeMeters(zoom, lat);
    const sizeWU = sizeM * WU_PER_METER;

    const terrainTile: TerrainTile = {
      z: zoom,
      x: tile.x,
      y: tile.y,
      centerWU: { x: 0, z: 0 }, // centered on aircraft
      sizeWU,
      heights: null,
      satBlob: null,
      satObjectUrl: null,
      loading: true,
      loaded: false,
    };

    this.state = {
      ...this.state,
      anchorLat: lat,
      anchorLon: lon,
      centerTile: terrainTile,
      ready: false,
      error: null,
    };
    this.notify();

    // Fetch DEM and satellite in parallel
    try {
      await Promise.all([
        this.fetchDem(zoom, tile.x, tile.y, terrainTile),
        this.fetchSat(zoom, tile.x, tile.y, terrainTile),
      ]);
      terrainTile.loading = false;
      terrainTile.loaded = true;
      this.state = { ...this.state, ready: true, centerTile: terrainTile };
      this.notify();
    } catch (err) {
      terrainTile.loading = false;
      this.state = {
        ...this.state,
        centerTile: terrainTile,
        error: (err as Error).message,
      };
      this.notify();
    }
  }

  private async fetchDem(z: number, x: number, y: number, tile: TerrainTile) {
    const key = tileCacheKey('dem', z, x, y);
    const url = mapboxTileUrl(this.token, 'dem', z, x, y);

    // Check cache first
    const cached = await getTile(key);
    if (cached) {
      const img = await blobToImage(cached.blob);
      tile.heights = decodeTerrainRGB(imageToImageData(img));
      return;
    }

    // Fetch from network
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`DEM fetch failed: ${resp.status}`);
    const blob = await resp.blob();

    // Cache
    putTile(key, blob, { z, x, y, type: 'dem', timestamp: Date.now(), size: blob.size }).catch(() => {});

    const img = await blobToImage(blob);
    tile.heights = decodeTerrainRGB(imageToImageData(img));
  }

  private async fetchSat(z: number, x: number, y: number, tile: TerrainTile) {
    const key = tileCacheKey('sat', z, x, y);
    const url = mapboxTileUrl(this.token, 'sat', z, x, y);

    // Check cache first
    const cached = await getTile(key);
    if (cached) {
      tile.satBlob = cached.blob;
      tile.satObjectUrl = URL.createObjectURL(cached.blob);
      return;
    }

    // Fetch from network
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Sat fetch failed: ${resp.status}`);
    const blob = await resp.blob();

    // Cache
    putTile(key, blob, { z, x, y, type: 'sat', timestamp: Date.now(), size: blob.size }).catch(() => {});

    tile.satBlob = blob;
    tile.satObjectUrl = URL.createObjectURL(blob);
  }

  dispose() {
    if (this.state.centerTile?.satObjectUrl) {
      URL.revokeObjectURL(this.state.centerTile.satObjectUrl);
    }
    this.listeners.clear();
  }
}

// Helpers

function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

// Singleton

let instance: TerrainManagerImpl | null = null;

export function getTerrainManager(): TerrainManagerImpl | null {
  return instance;
}

export function createTerrainManager(token: string): TerrainManagerImpl {
  if (instance) instance.dispose();
  instance = new TerrainManagerImpl(token);
  return instance;
}

/** Move terrain to a new position */
export function setTerrainPosition(lat: number, lon: number): void {
  const mgr = getTerrainManager();
  if (mgr) mgr.setAnchor(lat, lon);
}

/** Geocode a place name to coordinates using Mapbox API */
export async function geocodePlace(query: string, token: string): Promise<GeocodingResult[]> {
  const url = `${GEOCODING_URL}/${encodeURIComponent(query)}.json?access_token=${token}&limit=5&types=place,region,country`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Geocoding failed: ${resp.status}`);
  const data = await resp.json();
  return (data.features || []).map((f: any) => ({
    name: f.place_name || f.text || 'Unknown',
    lat: f.center?.[1] ?? f.geometry?.coordinates?.[1] ?? 0,
    lon: f.center?.[0] ?? f.geometry?.coordinates?.[0] ?? 0,
  }));
}

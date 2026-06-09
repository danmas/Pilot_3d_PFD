/**
 * terrainTileUtils.ts — конвертация координат, декодирование Terrain-RGB
 *
 * Mapbox Terrain-RGB: https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/
 * Slippy Map Tilenames: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
 */

/** Размер тайла в пикселях (Mapbox Terrain-RGB всегда 512) */
export const TILE_SIZE = 512;

/** Z-level по умолчанию для MVP */
export const DEFAULT_ZOOM = 14;

/** Экваториальная окружность Земли (метры) */
export const EARTH_CIRCUMFERENCE = 40_075_016.686;

/** 1 World Unit ≈ 40 метров (константа из проекта) */
export const WU_PER_METER = 1 / 40;

export interface TileCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * Конвертация lat/lon в tile x/y/z (Slippy Map).
 *
 * Алгоритм OpenStreetMap:
 *   n = 2^zoom
 *   x = floor((lon + 180) / 360 * n)
 *   latRad = lat * PI / 180
 *   y = floor((1 - ln(tan(latRad) + 1/cos(latRad)) / PI) / 2 * n)
 */
export function latLonToTile(lat: number, lon: number, zoom: number): TileCoord {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y, z: zoom };
}

/**
 * Обратная конвертация: центр тайла в lat/lon
 */
export function tileCenterLatLon(x: number, y: number, z: number): { lat: number; lon: number } {
  const n = Math.pow(2, z);
  const lon = (x / n) * 360 - 180 + 360 / n / 2;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y / n + 1 / n / 2))));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lon };
}

/**
 * Размер одного тайла на земле в метрах (на заданной широте)
 */
export function tileGroundSizeMeters(zoom: number, lat: number): number {
  return (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/**
 * Размер тайла в World Units (1 WU ≈ 40 м)
 */
export function tileWorldUnits(zoom: number, lat: number): number {
  return tileGroundSizeMeters(zoom, lat) * WU_PER_METER;
}

/**
 * Декодирование Mapbox Terrain-RGB в массив высот (метры).
 *
 * Каждый пиксель RGB кодирует высоту:
 *   height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 *
 * @param imageData — данные изображения (RGBA, 4 байта на пиксель)
 * @returns Float32Array высот в метрах, размер = width * height
 */
export function decodeTerrainRGB(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const heights = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Не используем alpha — игнорируем
    heights[i] = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
  }
  return heights;
}

/**
 * Получить высоту из Float32Array по UV-координатам (0..1)
 */
export function sampleHeight(
  heights: Float32Array,
  width: number,
  height: number,
  u: number,
  v: number
): number {
  const x = Math.round(Math.max(0, Math.min(1, u)) * (width - 1));
  const y = Math.round(Math.max(0, Math.min(1, v)) * (height - 1));
  return heights[y * width + x];
}

/**
 * URL для Mapbox Terrain-RGB тайла
 */
export function terrainRgbUrl(token: string, z: number, x: number, y: number): string {
  return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`;
}

/**
 * URL для Mapbox Satellite тайла
 */
export function satelliteUrl(token: string, z: number, x: number, y: number): string {
  return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg90?access_token=${token}`;
}

/**
 * Ключ для кэша
 */
export function tileCacheKey(source: 'dem' | 'sat', z: number, x: number, y: number): string {
  return `${source}_${z}_${x}_${y}`;
}

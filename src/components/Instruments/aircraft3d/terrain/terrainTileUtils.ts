/**
 * Terrain tile utilities: Slippy Map coordinate conversion + Terrain-RGB decoding.
 * Mapbox Terrain-RGB v1 format.
 */

export const TILE_SIZE = 512;
export const DEFAULT_ZOOM = 14;

/** World Units per meter — must match aircraft3d scene scale */
export const WU_PER_METER = 1 / 40;

/**
 * Convert lat/lon to tile x/y/z (Slippy Map convention).
 */
export function latLonToTile(
  lat: number,
  lon: number,
  zoom: number,
): { x: number; y: number; z: number } {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return { x, y, z: zoom };
}

/**
 * Tile NW corner → lat/lon.
 */
export function tileToLatLon(
  x: number,
  y: number,
  z: number,
): { lat: number; lon: number } {
  const n = Math.pow(2, z);
  const lon = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat = (latRad * 180) / Math.PI;
  return { lat, lon };
}

/**
 * Ground size of a tile in meters at given latitude.
 */
export function tileGroundSizeMeters(zoom: number, lat: number): number {
  const C = 40075016.686; // equatorial circumference
  return (C * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
}

/**
 * Decode Mapbox Terrain-RGB PNG into height array (meters).
 * formula: height = -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
 */
export function decodeTerrainRGB(imageData: ImageData): Float32Array {
  const { width, height, data } = imageData;
  const heights = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    heights[i] = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
  }
  return heights;
}

/**
 * Tile key for cache indexing: "dem_14_8932_5431"
 */
export function tileKey(type: 'dem' | 'sat', z: number, x: number, y: number): string {
  return `${type}_${z}_${x}_${y}`;
}

/**
 * Mapbox API URL for a tile.
 */
export function mapboxTileUrl(
  token: string,
  type: 'dem' | 'sat',
  z: number,
  x: number,
  y: number,
): string {
  if (type === 'dem') {
    return `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`;
  }
  return `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}.jpg?access_token=${token}`;
}

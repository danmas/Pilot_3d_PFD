/**
 * mapProtocol.ts — общий контракт между главным окном (сцена 3D) и окном Карты.
 *
 * Главное окно через BroadcastChannel шлёт готовый пакет состояния;
 * окно Карты ничего не вычисляет — только рисует.
 */

/** Имя Broadcast-канала между окнами. */
export const MAP_CHANNEL = 'pilot-map-state';

/** Покадровый пакет состояния, отправляемый главным окном. */
export interface MapStatePacket {
  /** Геопозиция самолёта (градусы). */
  lat: number;
  lon: number;
  /** Путевой угол (ground track, градусы от севера по часовой). */
  track: number;
  /** Путевая скорость (kt). */
  speed: number;
  /** Заголовок (MagneticHeading/Heading1, градусы) — справочно. */
  heading: number;
  /** Тайлы, сейчас находящиеся в сцене (TerrainManager.getAllTiles). */
  sceneTiles: TileKey[];
  /** Ожидаемая сетка 7×7 вокруг центра (needed). */
  needed: TileKey[];
}

export interface TileKey {
  x: number;
  y: number;
  z: number;
}

/** Сигнатура-ключ тайла для дедупликации/сравнения множеств. */
export function tileKey(t: TileKey): string {
  return `${t.z}/${t.x}/${t.y}`;
}

/**
 * Границы тайла в виде [[south, west], [north, east]] для Leaflet L.rectangle.
 * Использует углы Slippy Map (getTileCornersLatLon: NW, NE, SE, SW).
 */
export function tileBounds(t: TileKey): [[number, number], [number, number]] {
  const n = Math.pow(2, t.z);
  const lonLeft = (t.x / n) * 360 - 180;
  const lonRight = ((t.x + 1) / n) * 360 - 180;
  const latTopRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (t.y / n))));
  const latTop = (latTopRad * 180) / Math.PI;
  const latBottomRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * ((t.y + 1) / n))));
  const latBottom = (latBottomRad * 180) / Math.PI;
  return [
    [latBottom, lonLeft],
    [latTop, lonRight],
  ];
}

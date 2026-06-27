/**
 * terrain-ws.js — WebSocket endpoint for batch terrain tile loading.
 *
 * Binary protocol:
 *
 * Client -> Server (request):
 *   [reqId: 4 bytes uint32 BE]
 *   [count: 2 bytes uint16 BE]
 *   count * [z: 1 byte][x: 4 bytes uint32 BE][y: 4 bytes uint32 BE][type: 1 byte]
 *   type: 0 = dem, 1 = sat
 *
 * Server -> Client (response per tile):
 *   [reqId: 4 bytes uint32 BE]
 *   [z: 1 byte][x: 4 bytes uint32 BE][y: 4 bytes uint32 BE][type: 1 byte]
 *   [payloadLen: 4 bytes uint32 BE]
 *   [payload: payloadLen bytes]
 *
 * If payloadLen === 0, tile failed or not found.
 */

import { WebSocketServer } from 'ws';
import { loadTileBuffer } from './terrain-tile-loader.js';

const WS_PATH = '/ws/terrain';

const TYPE_DEM = 0;
const TYPE_SAT = 1;
const HEADER_SIZE = 4 + 2; // reqId + count
const TILE_REQUEST_SIZE = 1 + 4 + 4 + 1; // z + x + y + type
const RESPONSE_META_SIZE = 4 + 1 + 4 + 4 + 1 + 4; // reqId + z + x + y + type + payloadLen

function parseRequest(buffer) {
  if (buffer.length < HEADER_SIZE) return null;
  const reqId = buffer.readUInt32BE(0);
  const count = buffer.readUInt16BE(4);
  const expectedLen = HEADER_SIZE + count * TILE_REQUEST_SIZE;
  if (buffer.length !== expectedLen) return null;

  const tiles = [];
  let offset = HEADER_SIZE;
  for (let i = 0; i < count; i++) {
    const z = buffer.readUInt8(offset);
    const x = buffer.readUInt32BE(offset + 1);
    const y = buffer.readUInt32BE(offset + 5);
    const typeByte = buffer.readUInt8(offset + 9);
    const type = typeByte === TYPE_SAT ? 'sat' : 'dem';
    tiles.push({ z, x, y, type });
    offset += TILE_REQUEST_SIZE;
  }
  return { reqId, tiles };
}

function buildResponse(reqId, z, x, y, type, payload) {
  const payloadLen = payload ? payload.length : 0;
  const buf = Buffer.allocUnsafe(RESPONSE_META_SIZE + payloadLen);
  buf.writeUInt32BE(reqId, 0);
  buf.writeUInt8(z, 4);
  buf.writeUInt32BE(x, 5);
  buf.writeUInt32BE(y, 9);
  buf.writeUInt8(type === 'sat' ? TYPE_SAT : TYPE_DEM, 13);
  buf.writeUInt32BE(payloadLen, 14);
  if (payloadLen > 0) {
    payload.copy(buf, 18);
  }
  return buf;
}

export function setupTerrainWebSocket(server) {
  const wss = new WebSocketServer({ server, path: WS_PATH });

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[terrain-ws] connection from ${clientIp}, active: ${wss.clients.size}`);

    ws.on('message', async (data) => {
      const request = parseRequest(data);
      if (!request) {
        console.warn('[terrain-ws] invalid request frame');
        return;
      }

      const { reqId, tiles } = request;
      console.log(`[terrain-ws] reqId=${reqId} tiles=${tiles.length}`);

      // Process in parallel but send individual response frames
      await Promise.all(tiles.map(async ({ z, x, y, type }) => {
        try {
          const buffer = await loadTileBuffer(z, x, y, type);
          const response = buildResponse(reqId, z, x, y, type, buffer);
          ws.send(response);
        } catch (err) {
          console.warn(`[terrain-ws] failed ${type} ${z}/${x}/${y}:`, err.message);
          ws.send(buildResponse(reqId, z, x, y, type, null));
        }
      }));
    });

    ws.on('close', () => {
      console.log(`[terrain-ws] disconnected, active: ${wss.clients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[terrain-ws] client error:', err.message);
    });
  });

  console.log(`[terrain-ws] WebSocket endpoint ready at ${WS_PATH}`);
  return wss;
}

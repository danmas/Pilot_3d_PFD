/**
 * TerrainWebSocketClient.ts — батчевая загрузка terrain-тайлов через WebSocket.
 *
 * Бинарный протокол совпадает с server/terrain-ws.js.
 */

import { terrainRgbUrl, satelliteUrl } from './terrainTileUtils';

export type TileType = 'dem' | 'sat';

export interface TileRequest {
  z: number;
  x: number;
  y: number;
  type: TileType;
}

interface PendingBatchItem {
  request: TileRequest;
  key: string;
  resolve: (blob: Blob | null) => void;
  reject: (err: Error) => void;
}

interface InflightRequest {
  total: number;
  remaining: number;
  results: Map<string, Blob | null>;
  resolve: (results: Map<string, Blob | null>) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const TYPE_DEM = 0;
const TYPE_SAT = 1;
const HEADER_SIZE = 4 + 2;
const TILE_REQUEST_SIZE = 1 + 4 + 4 + 1;
const RESPONSE_META_SIZE = 4 + 1 + 4 + 4 + 1 + 4;
const DEFAULT_TIMEOUT_MS = 15_000;

function tileKey(z: number, x: number, y: number, type: TileType): string {
  return `${type}:${z}/${x}/${y}`;
}

export class TerrainWebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string = '';
  private pending: PendingBatchItem[] = [];
  private inflight = new Map<number, InflightRequest>();
  private reqId = 0;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private state: 'closed' | 'connecting' | 'open' | 'failed' = 'closed';
  private fallbackEnabled: boolean;

  constructor(url?: string, fallbackEnabled = true) {
    // По умолчанию используем тот же host/port, что и страница (Vite dev proxy перенаправит)
    this.url = url || `ws://${window.location.host}/ws/terrain`;
    this.fallbackEnabled = fallbackEnabled;
  }

  setToken(token: string): void {
    this.token = token;
  }

  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isOpen()) {
        resolve();
        return;
      }
      if (this.state === 'connecting') {
        // Простейшая очередь: ждём открытия
        const check = () => {
          if (this.isOpen()) resolve();
          else if (this.state === 'failed') reject(new Error('WebSocket connection failed'));
          else setTimeout(check, 50);
        };
        check();
        return;
      }

      this.state = 'connecting';
      const ws = new WebSocket(this.url);
      ws.binaryType = 'arraybuffer';

      const onOpen = () => {
        cleanup();
        this.ws = ws;
        this.state = 'open';
        console.log('[TerrainWebSocketClient] connected');
        resolve();
      };

      const onError = (err: Event) => {
        cleanup();
        this.state = 'failed';
        this.rejectAll(new Error('WebSocket error'));
        reject(new Error('WebSocket error'));
      };

      const onClose = () => {
        cleanup();
        this.state = 'closed';
        this.ws = null;
      };

      const cleanup = () => {
        ws.removeEventListener('open', onOpen);
        ws.removeEventListener('error', onError);
        ws.removeEventListener('close', onClose);
      };

      ws.addEventListener('open', onOpen);
      ws.addEventListener('error', onError);
      ws.addEventListener('close', onClose);
      ws.addEventListener('message', (ev) => this.handleMessage(ev));
    });
  }

  private rejectAll(err: Error): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    for (const item of this.pending) {
      item.reject(err);
    }
    this.pending = [];
    for (const req of this.inflight.values()) {
      req.reject(err);
    }
    this.inflight.clear();
  }

  fetchTile(z: number, x: number, y: number, type: TileType): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      this.pending.push({ request: { z, x, y, type }, key: tileKey(z, x, y, type), resolve, reject });
      this.scheduleFlush();
    });
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flush();
    }, 0);
  }

  private async flush(): Promise<void> {
    if (this.pending.length === 0) return;

    const batch = this.pending;
    this.pending = [];

    // Пробуем WebSocket; если не готов — fallback
    if (this.state !== 'open' || !this.isOpen()) {
      try {
        await this.connect();
      } catch {
        if (this.fallbackEnabled) {
          await this.fallbackBatch(batch);
          return;
        }
        for (const item of batch) item.reject(new Error('WebSocket not available'));
        return;
      }
    }

    const reqId = ++this.reqId;
    const count = batch.length;
    const buf = new ArrayBuffer(HEADER_SIZE + count * TILE_REQUEST_SIZE);
    const view = new DataView(buf);
    view.setUint32(0, reqId);
    view.setUint16(4, count);
    let offset = HEADER_SIZE;
    for (const item of batch) {
      const { z, x, y, type } = item.request;
      view.setUint8(offset, z);
      view.setUint32(offset + 1, x);
      view.setUint32(offset + 5, y);
      view.setUint8(offset + 9, type === 'sat' ? TYPE_SAT : TYPE_DEM);
      offset += TILE_REQUEST_SIZE;
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.inflight.delete(reqId);
        reject(new Error(`WebSocket tile request ${reqId} timeout`));
      }, DEFAULT_TIMEOUT_MS);

      this.inflight.set(reqId, {
        total: count,
        remaining: count,
        results: new Map(),
        resolve: (results) => {
          clearTimeout(timer);
          for (const item of batch) {
            item.resolve(results.get(item.key) ?? null);
          }
          resolve();
        },
        reject: (err) => {
          clearTimeout(timer);
          for (const item of batch) item.reject(err);
          reject(err);
        },
        timer,
      });

      try {
        this.ws!.send(buf);
      } catch (err: any) {
        this.inflight.delete(reqId);
        clearTimeout(timer);
        for (const item of batch) item.reject(err);
        reject(err);
      }
    });
  }

  private async fallbackBatch(batch: PendingBatchItem[]): Promise<void> {
    await Promise.all(
      batch.map(async (item) => {
        const { z, x, y, type } = item.request;
        try {
          const url = type === 'dem' ? terrainRgbUrl(this.token, z, x, y) : satelliteUrl(this.token, z, x, y);
          const response = await fetch(url);
          if (!response.ok) {
            item.resolve(null);
            return;
          }
          const blob = await response.blob();
          item.resolve(blob);
        } catch (err) {
          item.resolve(null);
        }
      }),
    );
  }

  private handleMessage(ev: MessageEvent): void {
    if (!(ev.data instanceof ArrayBuffer)) return;
    const buf = ev.data;
    if (buf.byteLength < RESPONSE_META_SIZE) return;

    const view = new DataView(buf);
    const reqId = view.getUint32(0);
    const z = view.getUint8(4);
    const x = view.getUint32(5);
    const y = view.getUint32(9);
    const typeByte = view.getUint8(13);
    const type: TileType = typeByte === TYPE_SAT ? 'sat' : 'dem';
    const payloadLen = view.getUint32(14);

    if (buf.byteLength !== RESPONSE_META_SIZE + payloadLen) return;

    const key = tileKey(z, x, y, type);
    let blob: Blob | null = null;
    if (payloadLen > 0) {
      blob = new Blob([new Uint8Array(buf, RESPONSE_META_SIZE, payloadLen)]);
    }

    const req = this.inflight.get(reqId);
    if (!req) return;

    req.results.set(key, blob);
    req.remaining--;
    if (req.remaining <= 0) {
      this.inflight.delete(reqId);
      clearTimeout(req.timer);
      req.resolve(req.results);
    }
  }

  close(): void {
    this.rejectAll(new Error('WebSocket client closed'));
    this.ws?.close();
    this.ws = null;
    this.state = 'closed';
  }
}

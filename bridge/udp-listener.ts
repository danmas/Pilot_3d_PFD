/**
 * Main UDP listener for telemetry stream (port 14443 by default).
 * Extracted from bridge-plugin.ts (P0-2 refactor).
 *
 * Handles marker packets, multi-chunk frame assembly, and delegates decoded data.
 */

import dgram from "node:dgram";
import type { AddressInfo } from "node:net";
import type { DecodeSchema } from "../decoding";

let udpSocket: dgram.Socket | undefined;
let udpActive = false;
let currentFrame: { counter: number; totalBytes: number; remainingBytes: number; chunks: Buffer[] } | null = null;

export function isMarkerPacket(msg: Buffer, syncVal: number): boolean {
  return msg.length >= 10 && (msg.readUInt16BE(0) === syncVal || msg.readUInt16LE(0) === syncVal);
}

export function parseMarkerPacket(msg: Buffer): { counter: number; dataCounters: number[] } {
  const dc = msg.readUInt16LE(2);
  const counter = msg.readUInt32LE(4);
  const dcs: number[] = [];
  for (let i = 0, off = 8; i < dc; i++, off += 2) dcs.push(msg.readUInt16LE(off));
  return { counter, dataCounters: dcs };
}

export interface UdpListenerOptions {
  host: string;
  port: number;
  syncMarker: number;
  onDecoded: (decoded: Record<string, number | null>, payload: Buffer, now: number, counter?: number) => void;
  onRawData: (message: Buffer, now: number) => void;  // for piggyback/raw feed
  onError: (error: Error) => void;
  onListening: (addr: AddressInfo) => void;
  schema: DecodeSchema | null;
  decodePayload: (buf: Buffer, schema: DecodeSchema) => Record<string, number | null>;
}

let options: UdpListenerOptions | null = null;

export function closeUdpListener(): void {
  if (!udpSocket) return;
  try {
    udpSocket.close();
  } catch (e) {
    // ignore
  }
  udpSocket = undefined;
  udpActive = false;
  currentFrame = null;
}

export function startUdpListener(opts: UdpListenerOptions): void {
  closeUdpListener();
  options = opts;
  currentFrame = null;

  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  udpSocket = socket;

  socket.on("message", (message) => {
    const now = Date.now();
    opts.onRawData(message, now);

    if (opts.schema) {
      try {
        if (isMarkerPacket(message, opts.syncMarker)) {
          const marker = parseMarkerPacket(message);
          currentFrame = {
            counter: marker.counter,
            totalBytes: marker.dataCounters.reduce((sum, s) => sum + s, 0),
            remainingBytes: marker.dataCounters.reduce((sum, s) => sum + s, 0),
            chunks: [],
          };
          return;
        }

        if (!currentFrame) {
          const decoded = opts.decodePayload(message, opts.schema);
          opts.onDecoded(decoded, message, now);
          return;
        }

        currentFrame.chunks.push(message);
        currentFrame.remainingBytes -= message.length;
        if (currentFrame.remainingBytes > 0) return;

        const frame = currentFrame;
        currentFrame = null;
        const payload = Buffer.concat(frame.chunks).subarray(0, frame.totalBytes);
        const decoded = opts.decodePayload(payload, opts.schema);
        opts.onDecoded(decoded, payload, now, frame.counter);
      } catch (error) {
        opts.onError(error instanceof Error ? error : new Error(String(error)));
      }
    } else {
      // no schema
      if (!currentFrame) {
        opts.onDecoded({}, message, now);
        return;
      }
      currentFrame.chunks.push(message);
      currentFrame.remainingBytes -= message.length;
      if (currentFrame.remainingBytes > 0) return;

      const frame = currentFrame;
      currentFrame = null;
      const payload = Buffer.concat(frame.chunks).subarray(0, frame.totalBytes);
      opts.onDecoded({}, payload, now, frame.counter);
    }
  });

  socket.on("error", (error) => {
    udpActive = false;
    opts.onError(error);
  });

  socket.bind(opts.port, opts.host, () => {
    const addr = socket.address() as AddressInfo;
    udpActive = true;
    opts.onListening(addr);
  });
}

export function reconfigureUdpListener(nextHost: string, nextPort: number): void {
  // Simple rebind
  if (options) {
    options.host = nextHost;
    options.port = nextPort;
  }
  closeUdpListener();
  if (options) {
    startUdpListener(options);
  }
}

export function getUdpActive(): boolean {
  return udpActive;
}

export function getUdpSocket(): dgram.Socket | undefined {
  return udpSocket;
}

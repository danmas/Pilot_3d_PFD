/**
 * Raw Monitor (decoder stream on separate UDP port, e.g. 14442).
 * Extracted from bridge-plugin.ts as part of monolith refactor (P0-2).
 *
 * Handles its own UDP socket (piggyback mode when port matches main bridge).
 * Feeds raw data for SSE /events/raw and API.
 */

import dgram from "node:dgram";
import type { DecodeSchema } from "../decoding";
import { decodePayload } from "../decoding";

// State (encapsulated)
let rawUdpPort = 14442;
let rawUdpSocket: dgram.Socket | undefined;
let rawUdpActive = false;
let rawLastDecoded: Record<string, number> | null = null;
let rawLastHex: string | null = null;
let rawReceivedPackets = 0;
let rawReceivedFrames = 0;
let rawLastPacketAtMs: number | undefined;
let rawLastError: string | undefined;

let sendRawSseFn: ((event: string, data: unknown) => void) | null = null;
let getRawStatusFn: (() => object) | null = null; // to avoid circular, will be set

export function setCallbacks(sendRawSse: (event: string, data: unknown) => void, getRawStatus: () => object) {
  sendRawSseFn = sendRawSse;
  getRawStatusFn = getRawStatus;
}

export function getRawUdpPort(): number {
  return rawUdpPort;
}

export function closeRawUdpServer(): void {
  if (!rawUdpSocket) return;
  try { rawUdpSocket.close(); } catch { /* ignore */ }
  rawUdpSocket = undefined;
  rawUdpActive = false;
}

export function startRawUdpServer(schema: DecodeSchema | null): void {
  closeRawUdpServer();
  rawLastDecoded = null;
  rawLastHex = null;
  rawReceivedPackets = 0;
  rawReceivedFrames = 0;
  rawLastPacketAtMs = undefined;
  rawLastError = undefined;

  const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
  rawUdpSocket = socket;

  socket.on("message", (message) => {
    const now = Date.now();
    try {
      if (schema) {
        const decoded = decodePayload(message, schema);
        feedRawData(decoded, message, now);
      } else {
        feedRawData(null, message, now);
      }
    } catch (error) {
      rawLastError = error instanceof Error ? error.message : String(error);
      console.error(`[RAW-UDP ERROR] ${rawLastError}`);
      if (sendRawSseFn) sendRawSseFn("status", getRawMonitorState());
    }
  });

  socket.on("error", (error) => {
    rawLastError = error.message;
    rawUdpActive = false;
    console.error(`[RAW-UDP ERROR] ${error.message}`);
    if (sendRawSseFn) sendRawSseFn("status", getRawMonitorState());
  });

  socket.bind(rawUdpPort, "0.0.0.0", () => {
    rawUdpActive = true;
    console.log(`[RAW-MONITOR] UDP udp://0.0.0.0:${rawUdpPort}`);
  });
}

export function reconfigureRawSource(port: number, isPiggyback: boolean): void {
  rawUdpPort = port;
  rawReceivedPackets = 0;
  rawReceivedFrames = 0;
  rawLastPacketAtMs = undefined;
  rawLastDecoded = null;
  rawLastHex = null;
  rawLastError = undefined;

  if (isPiggyback) {
    closeRawUdpServer();
    rawUdpActive = true; // will be synced to main
    return;
  }
  startRawUdpServer(null); // schema will be provided from outside if needed, but for now restart
}

export function feedRawData(decoded: Record<string, number | null> | null, rawMessage: Buffer, now: number): void {
  rawReceivedPackets += 1;
  rawLastPacketAtMs = now;
  rawLastHex = rawMessage.toString("hex").slice(0, 512);

  if (decoded) {
    rawLastDecoded = decoded as Record<string, number>;
    rawReceivedFrames += 1;
    rawLastError = undefined;
    if (sendRawSseFn) {
      sendRawSseFn("raw-frame", { decoded, hex: rawLastHex, receivedAt: new Date(now).toISOString() });
      if (getRawStatusFn) sendRawSseFn("status", getRawStatusFn());
    }
  } else {
    rawReceivedFrames += 1;
    if (sendRawSseFn && getRawStatusFn) sendRawSseFn("status", getRawStatusFn());
  }
}

export function getRawMonitorState(): RawMonitorState {
  return {
    source: {
      udpHost: "0.0.0.0",
      udpPort: rawUdpPort,
    },
    active: rawUdpActive,
    mode: "decoder-stream",
    receivedPackets: rawReceivedPackets,
    receivedFrames: rawReceivedFrames,
    lastPacketAtMs: rawLastPacketAtMs,
    lastDecoded: rawLastDecoded,
    lastRawHex: rawLastHex,
    lastError: rawLastError,
  };
}

// Types (duplicated minimal from main for independence)
export type RawMonitorState = {
  source: {
    udpHost: string;
    udpPort: number;
  };
  active: boolean;
  mode: "decoder-stream";
  receivedPackets: number;
  receivedFrames: number;
  lastPacketAtMs?: number;
  lastDecoded: Record<string, number> | null;
  lastRawHex: string | null;
  lastError?: string;
};

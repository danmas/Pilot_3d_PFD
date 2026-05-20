import type { Plugin, ViteDevServer } from "vite";
import dgram from "node:dgram";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIELD_CATALOG, buildParameterSchema, PFD_KEYS } from "./field-catalog";

// ── types ──────────────────────────────────────────────────────────
type ParameterType =
  | "Float" | "Double" | "Int16" | "Short"
  | "UInt16" | "Int32" | "UInt32" | "Byte" | "UInt8" | "Int8";

type ParameterSchema = Record<string, { Type: ParameterType }>;

type CurrentFrame = {
  counter: number;
  totalBytes: number;
  remainingBytes: number;
  chunks: Buffer[];
};

type RawAvionicsFrame = {
  RadioAltitude?: number; DME_Distance?: number; MagneticHeading?: number;
  RollAngle?: number; PitchAngle?: number; NormalG?: number;
  CAS?: number; Vy?: number; Time?: number;
};

type FlightFrame = {
  schema: "flight-frame.v1"; seq: number; timeMs: number;
  receivedAt: string; source: "tnparser-udp-14444";
  position: { mode: "dme"; distance: number | null; altitude: number | null };
  attitude: { headingDeg: number | null; rollDeg: number | null; pitchDeg: number | null };
  motion: { cas: number | null; vy: number | null; ny: number | null };
  raw: RawAvionicsFrame;
};

type PfdFrame = {
  schema: "pfd-frame.v1"; seq: number; timeMs: number;
  replayTimeMs: number | null; receivedAt: string; source: "tnparser-udp-14444";
  attitude: { pitchDeg: number | null; rollDeg: number | null; headingDeg: number | null; valid: boolean };
  air: { cas: number | null; aoaDeg: number | null; valid: boolean };
  altitude: { radioAlt: number | null; baroAltFt: number | null; baroAltM: number | null; verticalSpeed: number | null; valid: boolean };
  loads: { ny: number | null; g: number | null };
  nav: { dmeDistance: number | null; selectedHeadingDeg: number | null };
  autopilot: {
    selectedSpeed: number | null; selectedAltitudeFt: number | null;
    selectedVerticalSpeed: number | null; fdActive: boolean | null;
    fdPitchCmdDeg: number | null; fdRollCmdDeg: number | null;
  };
  quality: { missing: string[]; unconfirmed: string[] };
  raw: RawAvionicsFrame;
};

type Recording = {
  id: string; fileName: string; path: string; bytes: number; modifiedAt: string;
};

type RawMonitorState = {
  port: number;
  active: boolean;
  receivedPackets: number;
  receivedFrames: number;
  lastPacketAtMs: number | undefined;
  lastDecoded: Record<string, number> | null;
  lastRawHex: string | null;
  lastError: string | undefined;
};

// ── constants ──────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const VIEWER_DIR = path.join(__dirname, "public", "viewer");
const DEFAULT_CAPTURE_DIR = path.join(__dirname, "captures");

// Schema is built directly from field-catalog.ts (single source of truth)
// Sync marker: 0x544e = "TN" (tnparserrt marker packet)
const SYNC_MARKER = 0x544e;

// PFD subset keys — imported from field-catalog, kept as mutable array for RawAvionicsFrame filtering
const AVIONICS_FIELDS: readonly string[] = PFD_KEYS;

// Full 132-field schema — used by raw monitor on port 14442
const fullPayloadSchema: ParameterSchema = buildParameterSchema();

// PFD-only schema: matches the 9-field binary layout on port 14444
const pfdPayloadSchema: ParameterSchema = (() => {
  const catalog = new Map(FIELD_CATALOG.map(e => [e.key, e]));
  const schema: ParameterSchema = {};
  for (const key of PFD_KEYS) {
    const entry = catalog.get(key);
    if (entry) schema[key] = { Type: entry.dataType as ParameterType };
  }
  return schema;
})();

// ── bridge state ───────────────────────────────────────────────────
const sseClients = new Set<http.ServerResponse>();
const pfdSseClients = new Set<http.ServerResponse>();
const rawSseClients = new Set<http.ServerResponse>();

let currentFrame: CurrentFrame | null = null;
let currentFlightFrame: FlightFrame | null = null;
let currentPfdFrame: PfdFrame | null = null;
let firstReceiveTime: number | undefined;
let receivedFrames = 0;
let receivedPackets = 0;
let lastPacketAtMs: number | undefined;
let lastError: string | undefined;
let captureEnabled = true;
let captureStream: fs.WriteStream | undefined;
let capturePath: string | undefined;
let captureFrames = 0;

// ── raw monitor state ──────────────────────────────────────────────
let rawUdpServer: dgram.Socket | undefined;
let rawLastDecoded: Record<string, number> | null = null;
let rawLastHex: string | null = null;
let rawReceivedPackets = 0;
let rawReceivedFrames = 0;
let rawLastPacketAtMs: number | undefined;
let rawLastError: string | undefined;
let rawMonitorPort = 14442;
let rawCurrentFrame: CurrentFrame | null = null;
let bridgeUdpPort = 14444;
let rawPiggyback = false;

// ── plugin entry ───────────────────────────────────────────────────
export interface BridgeOptions {
  udpHost?: string;
  udpPort?: number;
  config?: string;
  captureDir?: string;
  noCapture?: boolean;
}

export function bridgePlugin(opts: BridgeOptions = {}): Plugin {
  const udpHost = opts.udpHost ?? "0.0.0.0";
  const udpPort = opts.udpPort ?? 14444;
  bridgeUdpPort = udpPort;
  const captureDir = opts.captureDir ?? DEFAULT_CAPTURE_DIR;
  captureEnabled = !opts.noCapture;

  let udpServer: dgram.Socket | undefined;
  let statusInterval: ReturnType<typeof setInterval> | undefined;

  // Schema from field-catalog.ts; sync is fixed 0x544e ("TN")
  const sync = SYNC_MARKER;

  return {
    name: "pilot-bridge",

    configureServer(vite: ViteDevServer) {
      // ── UDP ────────────────────────────────────────────────
      udpServer = dgram.createSocket({ type: "udp4", reuseAddr: true });

      udpServer.on("message", (message) => {
        const now = Date.now();
        receivedPackets += 1;
        lastPacketAtMs = now;

        try {
          if (isMarkerPacket(message, sync)) {
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
            const decoded = decodePayload(message, pfdPayloadSchema);
            if (rawPiggyback) feedRawData(decoded, message, now);
            publishDecodedFrame(decoded, now, captureDir);
            return;
          }

          currentFrame.chunks.push(message);
          currentFrame.remainingBytes -= message.length;
          if (currentFrame.remainingBytes > 0) return;

          const frame = currentFrame;
          currentFrame = null;
          const payload = Buffer.concat(frame.chunks).subarray(0, frame.totalBytes);
          const decoded = decodePayload(payload, pfdPayloadSchema);
          if (rawPiggyback) feedRawData(decoded, payload, now);
          publishDecodedFrame(decoded, now, captureDir, frame.counter);
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
          console.error(`[UDP ERROR] ${lastError}`);
        }
      });

      udpServer.on("error", (error) => {
        lastError = error.message;
        console.error(`[UDP ERROR] ${error.message}`);
      });

      udpServer.bind(udpPort, udpHost, () => {
        const addr = udpServer!.address();
        console.log(`[BRIDGE] UDP udp://${addr.address}:${addr.port}`);
        console.log(`[BRIDGE] schema ${Object.keys(pfdPayloadSchema).length} pfd fields / ${Object.keys(fullPayloadSchema).length} full fields (field-catalog.ts)`);
        console.log(`[BRIDGE] capture ${captureEnabled ? `auto ${captureDir}` : "manual/off"}`);
      });

      statusInterval = setInterval(() => {
        sendSse("status", getStatus(udpHost, udpPort));
        sendPfdSse("status", getPfdStatus());
      }, 1000);

      // ── HTTP middleware ────────────────────────────────────
      vite.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

          // SSE streams
          if (req.method === "GET" && url.pathname === "/events") {
            handleSse(res); return;
          }
          if (req.method === "GET" && url.pathname === "/events/pfd") {
            handlePfdSse(res); return;
          }
          if (req.method === "GET" && url.pathname === "/events/raw") {
            console.log(`[RAW-MONITOR] SSE client connecting (total: ${rawSseClients.size + 1})`);
            handleRawSse(res); return;
          }

          // API: status
          if (req.method === "GET" && url.pathname === "/api/status") {
            sendJson(res, getStatus(udpHost, udpPort)); return;
          }
          if (req.method === "GET" && url.pathname === "/api/pfd/status") {
            sendJson(res, getPfdStatus()); return;
          }

          // API: capture
          if (req.method === "GET" && url.pathname === "/api/capture/status") {
            sendJson(res, getCaptureStatus(captureDir)); return;
          }
          if (req.method === "POST" && url.pathname === "/api/capture/start") {
            sendJson(res, startCapture(captureDir)); return;
          }
          if (req.method === "POST" && url.pathname === "/api/capture/stop") {
            sendJson(res, stopCapture()); return;
          }

          // API: live current
          if (req.method === "GET" && url.pathname === "/api/live/current") {
            sendJson(res, currentFlightFrame); return;
          }
          if (req.method === "GET" && url.pathname === "/api/pfd/current") {
            sendJson(res, currentPfdFrame); return;
          }

          // API: raw monitor
          if (req.method === "GET" && url.pathname === "/api/raw/status") {
            sendJson(res, getRawMonitorState()); return;
          }
          if (req.method === "GET" && url.pathname === "/api/raw/current") {
            sendJson(res, { decoded: rawLastDecoded, hex: rawLastHex, receivedAt: rawLastPacketAtMs ? new Date(rawLastPacketAtMs).toISOString() : null }); return;
          }
          if (req.method === "POST" && url.pathname === "/api/raw/start") {
            const body = await readRequestBody(req);
            const port = body?.port ? Number(body.port) : rawMonitorPort;
            console.log(`[RAW-MONITOR] API start requested, port=${port}, body=`, body);
            if (!Number.isFinite(port) || port < 1 || port > 65535) {
              console.log(`[RAW-MONITOR] Invalid port: ${port}`);
              sendJson(res, { error: "Invalid port" }, 400); return;
            }
            const result = startRawMonitor(port);
            console.log(`[RAW-MONITOR] startRawMonitor result:`, JSON.stringify(result));
            sendJson(res, result); return;
          }
          if (req.method === "POST" && url.pathname === "/api/raw/stop") {
            console.log(`[RAW-MONITOR] API stop requested`);
            stopRawMonitor();
            sendJson(res, getRawMonitorState()); return;
          }

          // API: recordings list
          if (req.method === "GET" && url.pathname === "/api/recordings") {
            sendJson(res, listRecordings(captureDir)); return;
          }

          // API: PFD recordings
          const pfdRecMatch = url.pathname.match(/^\/api\/pfd\/recordings\/([^/]+)\/(meta|frame|range)$/);
          if (req.method === "GET" && pfdRecMatch) {
            const rec = getRecordingById(captureDir, decodeURIComponent(pfdRecMatch[1]));
            if (!rec) { sendJson(res, { error: "recording not found" }, 404); return; }
            const action = pfdRecMatch[2];
            if (action === "meta") { sendJson(res, { ...readRecordingMeta(rec), schema: "pfd-frame.v1", sourceSchema: "flight-frame.v1" }); return; }
            if (action === "frame") { sendJson(res, findClosestPfdFrame(rec, Number(url.searchParams.get("timeMs") ?? "0"))); return; }
            if (action === "range") {
              sendJson(res, readPfdFrameRange(rec,
                optionalNumber(url.searchParams.get("fromMs")),
                optionalNumber(url.searchParams.get("toMs")),
                optionalNumber(url.searchParams.get("limit")) ?? 50000,
              )); return;
            }
          }

          // API: flight recordings
          const recMatch = url.pathname.match(/^\/api\/recordings\/([^/]+)\/(meta|frame|range)$/);
          if (req.method === "GET" && recMatch) {
            const rec = getRecordingById(captureDir, decodeURIComponent(recMatch[1]));
            if (!rec) { sendJson(res, { error: "recording not found" }, 404); return; }
            const action = recMatch[2];
            if (action === "meta") { sendJson(res, readRecordingMeta(rec)); return; }
            if (action === "frame") { sendJson(res, findClosestFrame(rec, Number(url.searchParams.get("timeMs") ?? "0"))); return; }
            if (action === "range") {
              sendJson(res, readFrameRange(rec,
                optionalNumber(url.searchParams.get("fromMs")),
                optionalNumber(url.searchParams.get("toMs")),
                optionalNumber(url.searchParams.get("limit")) ?? 50000,
              )); return;
            }
          }

          // viewer static files (at /viewer/*)
          if (req.method === "GET" && url.pathname.startsWith("/viewer/")) {
            serveViewer(url.pathname, res); return;
          }

          // not a bridge route → let Vite handle
          next();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          sendJson(res, { error: message }, 500);
        }
      });
    },

    closeBundle() {
      if (statusInterval) clearInterval(statusInterval);
    },
  };
}

// ── frame pipeline ─────────────────────────────────────────────────
function publishDecodedFrame(
  decoded: Record<string, number>, receivedAtMs: number,
  captureDir: string, counter?: number,
): void {
  receivedFrames += 1;
  const raw: RawAvionicsFrame = {};
  for (const field of AVIONICS_FIELDS) {
    const v = decoded[field];
    if (Number.isFinite(v)) raw[field as keyof RawAvionicsFrame] = v;
  }
  if (firstReceiveTime === undefined) firstReceiveTime = receivedAtMs;

  const timeMs = firstReceiveTime === undefined ? 0 : receivedAtMs - firstReceiveTime;
  const frame: FlightFrame = {
    schema: "flight-frame.v1",
    seq: counter ?? receivedFrames,
    timeMs,
    receivedAt: new Date(receivedAtMs).toISOString(),
    source: "tnparser-udp-14444",
    position: { mode: "dme", distance: fin(raw.DME_Distance), altitude: fin(raw.RadioAltitude) },
    attitude: { headingDeg: fin(raw.MagneticHeading), rollDeg: fin(raw.RollAngle), pitchDeg: fin(raw.PitchAngle) },
    motion: { cas: fin(raw.CAS), vy: fin(raw.Vy), ny: fin(raw.NormalG) },
    raw,
  };

  currentFlightFrame = frame;
  currentPfdFrame = buildPfdFrame(frame);
  writeCaptureFrame(frame, captureDir);
  sendSse("frame", frame);
  sendPfdSse("pfd-frame", currentPfdFrame);
}

function buildPfdFrame(frame: FlightFrame): PfdFrame {
  return {
    schema: "pfd-frame.v1",
    seq: frame.seq, timeMs: frame.timeMs, replayTimeMs: null,
    receivedAt: frame.receivedAt, source: frame.source,
    attitude: {
      pitchDeg: frame.attitude.pitchDeg, rollDeg: frame.attitude.rollDeg,
      headingDeg: frame.attitude.headingDeg,
      valid: frame.attitude.pitchDeg !== null && frame.attitude.rollDeg !== null,
    },
    air: { cas: frame.motion.cas, aoaDeg: null, valid: frame.motion.cas !== null },
    altitude: {
      radioAlt: frame.position.altitude, baroAltFt: null, baroAltM: null,
      verticalSpeed: frame.motion.vy,
      valid: frame.position.altitude !== null || frame.motion.vy !== null,
    },
    loads: { ny: frame.motion.ny, g: null },
    nav: { dmeDistance: frame.position.distance, selectedHeadingDeg: null },
    autopilot: {
      selectedSpeed: null, selectedAltitudeFt: null, selectedVerticalSpeed: null,
      fdActive: null, fdPitchCmdDeg: null, fdRollCmdDeg: null,
    },
    quality: {
      missing: ["baroAltFt", "aoaDeg", "selectedSpeed", "selectedAltitudeFt", "selectedHeadingDeg", "selectedVerticalSpeed", "fdActive", "fdPitchCmdDeg", "fdRollCmdDeg"],
      unconfirmed: ["Vy units/sign", "NormalG scale/origin", "RadioAltitude semantic meaning"],
    },
    raw: frame.raw,
  };
}

function fin(v: number | undefined): number | null { return Number.isFinite(v) ? v : null; }

// ── SSE ────────────────────────────────────────────────────────────
function handleSse(res: http.ServerResponse): void {
  res.writeHead(200, { "Cache-Control": "no-cache", "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write("\n");
  sseClients.add(res);
  sendSseTo(res, "status", getStatus("?", 0));
  if (currentFlightFrame) sendSseTo(res, "frame", currentFlightFrame);
  res.on("close", () => sseClients.delete(res));
}

function handlePfdSse(res: http.ServerResponse): void {
  res.writeHead(200, { "Cache-Control": "no-cache", "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write("\n");
  pfdSseClients.add(res);
  sendSseTo(res, "status", getPfdStatus());
  if (currentPfdFrame) sendSseTo(res, "pfd-frame", currentPfdFrame);
  res.on("close", () => pfdSseClients.delete(res));
}

function sendSse(event: string, data: unknown): void {
  for (const c of sseClients) sendSseTo(c, event, data);
}
function sendPfdSse(event: string, data: unknown): void {
  for (const c of pfdSseClients) sendSseTo(c, event, data);
}
function sendSseTo(res: http.ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ── raw SSE ────────────────────────────────────────────────────────
function handleRawSse(res: http.ServerResponse): void {
  res.writeHead(200, { "Cache-Control": "no-cache", "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write("\n");
  rawSseClients.add(res);
  console.log(`[RAW-MONITOR] SSE client connected, total clients: ${rawSseClients.size}`);
  sendSseTo(res, "status", getRawStatus());
  if (rawLastDecoded) sendSseTo(res, "raw-frame", { decoded: rawLastDecoded, hex: rawLastHex });
  res.on("close", () => {
    rawSseClients.delete(res);
    console.log(`[RAW-MONITOR] SSE client disconnected, remaining clients: ${rawSseClients.size}`);
  });
}

function sendRawSse(event: string, data: unknown): void {
  console.log(`[RAW-MONITOR] SSE broadcast "${event}" to ${rawSseClients.size} clients`);
  for (const c of rawSseClients) sendSseTo(c, event, data);
}

// ── status ─────────────────────────────────────────────────────────
function getStatus(udpHost: string, udpPort: number): object {
  return {
    udp: `udp://${udpHost}:${udpPort}`,
    receivedPackets, receivedFrames,
    lastPacketAgeMs: lastPacketAtMs === undefined ? null : Date.now() - lastPacketAtMs,
    currentSeq: currentFlightFrame?.seq ?? null,
    currentTimeMs: currentFlightFrame?.timeMs ?? null,
    capturePath, capture: getCaptureStatus(""),
    sseClients: sseClients.size, pfdSseClients: pfdSseClients.size, lastError,
  };
}

function getPfdStatus(): object {
  return {
    schema: "pfd-frame.v1",
    live: "/events/pfd", current: "/api/pfd/current",
    receivedFrames,
    currentSeq: currentPfdFrame?.seq ?? null,
    currentTimeMs: currentPfdFrame?.timeMs ?? null,
    lastPacketAgeMs: lastPacketAtMs === undefined ? null : Date.now() - lastPacketAtMs,
    sseClients: pfdSseClients.size,
    missing: currentPfdFrame?.quality.missing ?? [],
    unconfirmed: currentPfdFrame?.quality.unconfirmed ?? [],
    lastError,
  };
}

function getRawStatus() {
  return {
    port: rawMonitorPort,
    active: Boolean(rawUdpServer) || rawPiggyback,
    receivedPackets: rawReceivedPackets,
    receivedFrames: rawReceivedFrames,
    lastPacketAgeMs: rawLastPacketAtMs ? Date.now() - rawLastPacketAtMs : null,
    lastDecodedKeys: rawLastDecoded ? Object.keys(rawLastDecoded).length : 0,
    sseClients: rawSseClients.size,
    lastError: rawLastError,
  };
}

// ── raw monitor start/stop ─────────────────────────────────────────
function feedRawData(decoded: Record<string, number>, rawMessage: Buffer, now: number): void {
  rawReceivedPackets += 1;
  rawLastPacketAtMs = now;
  rawLastHex = rawMessage.toString("hex").slice(0, 512);

  rawLastDecoded = decoded;
  rawReceivedFrames += 1;
  rawLastError = undefined;
  console.log(`[RAW-MONITOR] Bridged frame #${rawReceivedFrames}, ${Object.keys(decoded).length} fields, SSE: ${rawSseClients.size}`);
  sendRawSse("raw-frame", { decoded, hex: rawLastHex, receivedAt: new Date(now).toISOString() });
  sendRawSse("status", getRawStatus());
}

function startRawMonitor(port: number): RawMonitorState {
  console.log(`[RAW-MONITOR] startRawMonitor called, port=${port}, bridgePort=${bridgeUdpPort}`);

  // Если порт совпадает с портом бриджа — piggyback (без своего сокета)
  if (port === bridgeUdpPort) {
    stopRawMonitor();
    rawMonitorPort = port;
    rawPiggyback = true;
    rawLastError = undefined;
    rawReceivedPackets = 0;
    rawReceivedFrames = 0;
    rawLastDecoded = null;
    rawLastHex = null;
    rawLastPacketAtMs = undefined;
    console.log(`[RAW-MONITOR] Piggyback mode ON — tapping bridge pipeline on port ${port}`);
    const state = getRawMonitorState();
    console.log(`[RAW-MONITOR] Returning state: active=${state.active}, port=${state.port}, piggyback=yes`);
    return state;
  }

  stopRawMonitor();
  rawMonitorPort = port;
  rawLastError = undefined;
  rawReceivedPackets = 0;
  rawReceivedFrames = 0;
  rawLastDecoded = null;
  rawLastHex = null;
  rawLastPacketAtMs = undefined;

  console.log(`[RAW-MONITOR] Creating UDP socket with reuseAddr=true...`);
  rawUdpServer = dgram.createSocket({ type: "udp4", reuseAddr: true });
  rawUdpServer.on("message", (message) => {
    const now = Date.now();
    rawReceivedPackets += 1;
    rawLastPacketAtMs = now;
    rawLastHex = message.toString("hex").slice(0, 512);
    console.log(`[RAW-MONITOR] Packet #${rawReceivedPackets} received, ${message.length}B, hex: ${rawLastHex.slice(0, 40)}...`);
    try {
      const decoded = decodePayload(message, fullPayloadSchema);
      rawLastDecoded = decoded;
      rawReceivedFrames += 1;
      rawLastError = undefined;
      console.log(`[RAW-MONITOR] Frame #${rawReceivedFrames} decoded, ${Object.keys(decoded).length} fields, SSE clients: ${rawSseClients.size}`);
      sendRawSse("raw-frame", { decoded, hex: rawLastHex, receivedAt: new Date(now).toISOString() });
      sendRawSse("status", getRawStatus());
    } catch (error) {
      rawLastError = error instanceof Error ? error.message : String(error);
      console.error(`[RAW-MONITOR] Decode error: ${rawLastError}`);
    }
  });

  rawUdpServer.on("error", (error) => {
    rawLastError = error.message;
    console.error(`[RAW-MONITOR] Socket error: ${error.message}`, error);
    sendRawSse("status", getRawStatus());
  });

  console.log(`[RAW-MONITOR] Binding to 0.0.0.0:${port}...`);
  rawUdpServer.bind(port, "0.0.0.0", () => {
    const addr = rawUdpServer!.address();
    console.log(`[RAW-MONITOR] Bound successfully: udp://${addr.address}:${addr.port}`);
    sendRawSse("status", getRawStatus());
  });

  const state = getRawMonitorState();
  console.log(`[RAW-MONITOR] Returning state: active=${state.active}, port=${state.port}`);
  return state;
}

function stopRawMonitor(): void {
  console.log(`[RAW-MONITOR] stopRawMonitor called, wasActive=${Boolean(rawUdpServer)}, piggyback=${rawPiggyback}`);
  rawPiggyback = false;
  if (rawUdpServer) {
    try { rawUdpServer.close(); console.log(`[RAW-MONITOR] Socket closed`); } catch (e) { console.error(`[RAW-MONITOR] Error closing socket:`, e); }
    rawUdpServer = undefined;
  }
  rawCurrentFrame = null;
  sendRawSse("status", getRawStatus());
}

function getRawMonitorState(): RawMonitorState {
  return {
    port: rawMonitorPort,
    active: Boolean(rawUdpServer) || rawPiggyback,
    receivedPackets: rawReceivedPackets,
    receivedFrames: rawReceivedFrames,
    lastPacketAtMs: rawLastPacketAtMs,
    lastDecoded: rawLastDecoded,
    lastRawHex: rawLastHex,
    lastError: rawLastError,
  };
}

// ── capture ────────────────────────────────────────────────────────
function getCaptureStatus(_dir: string): object {
  return { enabled: captureEnabled, active: Boolean(captureStream), path: capturePath, frames: captureFrames, dir: _dir };
}

function startCapture(captureDir: string): object {
  if (captureStream) return getCaptureStatus(captureDir);
  fs.mkdirSync(captureDir, { recursive: true });
  capturePath = createCapturePath(captureDir);
  captureFrames = 0;
  captureStream = fs.createWriteStream(capturePath, { flags: "wx", encoding: "utf8" });
  captureEnabled = true;
  console.log(`[CAPTURE] started ${capturePath}`);
  sendSse("status", getStatus("?", 0));
  sendPfdSse("status", getPfdStatus());
  return getCaptureStatus(captureDir);
}

function stopCapture(): object {
  captureEnabled = false;
  const p = capturePath; const n = captureFrames;
  closeCapture();
  console.log(`[CAPTURE] stopped ${p ?? "n/a"} frames=${n}`);
  sendSse("status", getStatus("?", 0));
  sendPfdSse("status", getPfdStatus());
  return { ...getCaptureStatus(""), stoppedPath: p, stoppedFrames: n };
}

function closeCapture(): void {
  if (!captureStream) return;
  captureStream.end();
  captureStream = undefined;
}

function writeCaptureFrame(frame: FlightFrame, captureDir: string): void {
  if (!captureEnabled) return;
  if (!captureStream) startCapture(captureDir);
  captureStream?.write(`${JSON.stringify(frame)}\n`);
  captureFrames += 1;
}

function createCapturePath(dir: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  for (let i = 0; i < 1000; i++) {
    const suffix = i === 0 ? "" : `_${String(i).padStart(3, "0")}`;
    const p = path.join(dir, `${ts}_live${suffix}.jsonl`);
    if (!fs.existsSync(p)) return p;
  }
  throw new Error("Cannot allocate unique capture file name");
}

// ── recordings ─────────────────────────────────────────────────────
function listRecordings(dir: string): Recording[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".jsonl"))
    .map(f => { const fp = path.join(dir, f); const s = fs.statSync(fp); return { id: f.replace(/\.jsonl$/i, ""), fileName: f, path: fp, bytes: s.size, modifiedAt: s.mtime.toISOString() }; })
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

function getRecordingById(dir: string, id: string): Recording | undefined {
  return listRecordings(dir).find(r => r.id === id || r.fileName === id);
}

function readRecordingMeta(rec: Recording): object {
  const frames = readJsonLines(rec.path);
  return { id: rec.id, fileName: rec.fileName, bytes: rec.bytes, modifiedAt: rec.modifiedAt, frames: frames.length, startTimeMs: frames[0]?.timeMs ?? null, endTimeMs: frames[frames.length - 1]?.timeMs ?? null, firstSeq: frames[0]?.seq ?? null, lastSeq: frames[frames.length - 1]?.seq ?? null };
}

function findClosestFrame(rec: Recording, timeMs: number): FlightFrame | null {
  const frames = readJsonLines(rec.path);
  let best: FlightFrame | null = null; let bestD = Infinity;
  for (const f of frames) { const d = Math.abs(f.timeMs - timeMs); if (d < bestD) { best = f; bestD = d; } }
  return best;
}

function findClosestPfdFrame(rec: Recording, timeMs: number): PfdFrame | null {
  const f = findClosestFrame(rec, timeMs);
  return f ? buildPfdFrame(f) : null;
}

function readFrameRange(rec: Recording, fromMs?: number, toMs?: number, limit = 50000): FlightFrame[] {
  const frames = readJsonLines(rec.path);
  const result: FlightFrame[] = [];
  for (const f of frames) {
    if (fromMs !== undefined && f.timeMs < fromMs) continue;
    if (toMs !== undefined && f.timeMs > toMs) continue;
    result.push(f);
    if (result.length >= limit) break;
  }
  return result;
}

function readPfdFrameRange(rec: Recording, fromMs?: number, toMs?: number, limit = 50000): PfdFrame[] {
  return readFrameRange(rec, fromMs, toMs, limit).map(buildPfdFrame);
}

function readJsonLines(filePath: string): FlightFrame[] {
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean)
    .map(l => JSON.parse(l) as FlightFrame)
    .filter(f => f.schema === "flight-frame.v1" && Number.isFinite(f.timeMs));
}

// ── viewer static ──────────────────────────────────────────────────
function serveViewer(urlPath: string, res: http.ServerResponse): void {
  let filePath = path.resolve(VIEWER_DIR, `.${urlPath.slice("/viewer".length)}`);
  if (!filePath.startsWith(VIEWER_DIR)) { sendJson(res, { error: "forbidden" }, 403); return; }
  // fallback to index.html for directory paths like /viewer/ or /viewer
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) { sendJson(res, { error: "not found" }, 404); return; }
  res.writeHead(200, { "Content-Type": ct(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

function ct(fp: string): string {
  switch (path.extname(fp)) {
    case ".html": return "text/html; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".js": return "text/javascript; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    default: return "application/octet-stream";
  }
}

// ── helpers ────────────────────────────────────────────────────────
function sendJson(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function readRequestBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

function optionalNumber(v: string | null): number | undefined {
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v); return Number.isFinite(n) ? n : undefined;
}

// ── JSONC ──────────────────────────────────────────────────────────
function readJsonc<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const noComments = stripComments(raw);
  const noTrailing = noComments.replace(/,\s*([}\]])/g, "$1");
  return JSON.parse(noTrailing) as T;
}

function stripComments(input: string): string {
  let out = ""; let inStr = false; let esc = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i]; const n = input[i + 1];
    if (inStr) { out += c; esc = c === "\\" && !esc; if (c === "\"" && !esc) inStr = false; if (c !== "\\") esc = false; continue; }
    if (c === "\"") { inStr = true; out += c; continue; }
    if (c === "/" && n === "/") { while (i < input.length && input[i] !== "\n") i++; out += "\n"; continue; }
    out += c;
  }
  return out;
}

function parseSync(v: string): number { return v.startsWith("0x") ? parseInt(v.slice(2), 16) : Number(v); }

// ── UDP decode ─────────────────────────────────────────────────────
function isMarkerPacket(msg: Buffer, syncVal: number): boolean {
  return msg.length >= 10 && (msg.readUInt16BE(0) === syncVal || msg.readUInt16LE(0) === syncVal);
}

function parseMarkerPacket(msg: Buffer): { counter: number; dataCounters: number[] } {
  const dc = msg.readUInt16LE(2);
  const counter = msg.readUInt32LE(4);
  const dcs: number[] = [];
  for (let i = 0, off = 8; i < dc; i++, off += 2) dcs.push(msg.readUInt16LE(off));
  return { counter, dataCounters: dcs };
}

function buildPayloadSchema(schema: ParameterSchema, order: string[]): ParameterSchema {
  const result: ParameterSchema = {};
  for (const f of order) {
    if (!schema[f]) { console.warn(`[WARN] field "${f}" missing in config`); continue; }
    result[f] = schema[f];
  }
  return result;
}

function decodePayload(payload: Buffer, schema: ParameterSchema): Record<string, number> {
  const result: Record<string, number> = {};
  let off = 0;
  for (const [name, def] of Object.entries(schema)) {
    const sz = byteSize(def.Type);
    if (off + sz > payload.length) break;
    result[name] = readValue(payload, off, def.Type);
    off += sz;
  }
  return result;
}

function byteSize(t: ParameterType): number {
  switch (t) { case "Double": return 8; case "Float": case "Int32": case "UInt32": return 4; case "Int16": case "Short": case "UInt16": return 2; case "Byte": case "UInt8": case "Int8": return 1; default: throw new Error(`Unsupported type: ${t}`); }
}

function readValue(payload: Buffer, off: number, t: ParameterType): number {
  switch (t) { case "Double": return payload.readDoubleLE(off); case "Float": return payload.readFloatLE(off); case "Int32": return payload.readInt32LE(off); case "UInt32": return payload.readUInt32LE(off); case "Int16": case "Short": return payload.readInt16LE(off); case "UInt16": return payload.readUInt16LE(off); case "Byte": case "UInt8": return payload.readUInt8(off); case "Int8": return payload.readInt8(off); default: throw new Error(`Unsupported type: ${t}`); }
}

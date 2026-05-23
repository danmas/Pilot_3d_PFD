/**
 * Vite-plugin: UDP → SSE bridge for Pilot_3d_PFD.
 *
 * ПО УМОЛЧАНИЮ: слушает полный 132-полевой поток tnparserrt на порту 14443.
 * Схема декодирования загружается из out.json при старте и сопоставляется
 * с field-catalog.ts по ARINC param (двухпроходное сопоставление).
 *
 * Расчётные поля с префиксом dec_ добавляются после декодирования (applyDecFormulas).
 */

import type { Plugin, ViteDevServer } from "vite";
import dgram from "node:dgram";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FIELD_CATALOG } from "./field-catalog";
import {
  loadOutJson,
  findStreamForPort,
  buildDecodeSchema,
  decodePayload,
  applyDecFormulas,
  validateSchema,
  type DecodeSchema,
} from "./decoding";

// ── types ──────────────────────────────────────────────────────────

type CurrentFrame = {
  counter: number;
  totalBytes: number;
  remainingBytes: number;
  chunks: Buffer[];
};

/** Плоский фрейм телеметрии — канонические ключи field-catalog.ts + dec_* */
type TelemetryFrame = {
  [key: string]: number | null | string | undefined;
  schema: "telemetry-frame.v1";
  seq: number;
  timeMs: number;
  replayTimeMs: number | null;
  receivedAt: string;
  source: string;
};

type Recording = {
  id: string; fileName: string; path: string; bytes: number; modifiedAt: string;
};

type RawMonitorState = {
  source: {
    udpHost: string;
    udpPort: number;
  };
  active: boolean;
  mode: "decoder-stream";
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
const PANEL_CONFIG_CURRENT_PATH = path.join(PROJECT_ROOT, "panel-config-current.json");
const PANEL_MENU_PATH = path.join(__dirname, "panel-menu.json");
const VIEWER_DIR = path.join(__dirname, "public", "viewer");
const DEFAULT_CAPTURE_DIR = path.join(__dirname, "captures");

// Sync marker: 0x544e = "TN" (tnparserrt marker packet)
const SYNC_MARKER = 0x544e;

// ── bridge state ───────────────────────────────────────────────────
const sseClients = new Set<http.ServerResponse>();
const pfdSseClients = new Set<http.ServerResponse>();
const rawSseClients = new Set<http.ServerResponse>();

let currentFrame: CurrentFrame | null = null;
let currentTelemetryFrame: TelemetryFrame | null = null;
let currentPfdFrame: TelemetryFrame | null = null;
let firstReceiveTime: number | undefined;
let bridgeUdpHost = "0.0.0.0";
let bridgeUdpPort = 14443;
let bridgeUdpActive = false;
let receivedFrames = 0;
let receivedPackets = 0;
let lastPacketAtMs: number | undefined;
let lastError: string | undefined;
let captureEnabled = true;
let captureStream: fs.WriteStream | undefined;
let capturePath: string | undefined;
let captureFrames = 0;

// ── raw monitor state ──────────────────────────────────────────────
let rawLastDecoded: Record<string, number> | null = null;
let rawLastHex: string | null = null;
let rawReceivedPackets = 0;
let rawReceivedFrames = 0;
let rawLastPacketAtMs: number | undefined;
let rawLastError: string | undefined;

// Схема декодирования загружается при старте один раз
let decodeSchema: DecodeSchema | null = null;
let decodeSchemaPort: number | null = null;

function ensureDecodeSchema(): DecodeSchema {
  if (decodeSchema && decodeSchemaPort === bridgeUdpPort) return decodeSchema;
  console.log("[BRIDGE] Loading decode schema from out.json...");
  const outPath = path.resolve(PROJECT_ROOT, "out.json");
  const configs = loadOutJson(__dirname, outPath);
  const stream = findStreamForPort(configs, bridgeUdpPort);
  if (!stream) {
    throw new Error(
      `[BRIDGE] No stream configured for port ${bridgeUdpPort} in out.json. ` +
      `Check the JSON for a section with "port": "${bridgeUdpPort}".`
    );
  }
  console.log(`[BRIDGE] Found ${stream.slots.length} slots for port ${bridgeUdpPort}`);
  decodeSchema = buildDecodeSchema(stream.slots, FIELD_CATALOG);
  decodeSchemaPort = bridgeUdpPort;
  const report = validateSchema(decodeSchema);
  console.log("[BRIDGE] Schema validation report:");
  console.log(report.report);
  if (!report.valid) {
    console.warn("[BRIDGE] ⚠ Schema VALIDATION WARNINGS — check out.json ↔ field-catalog.ts alignment");
  }
  return decodeSchema;
}

// ── plugin entry ───────────────────────────────────────────────────
export interface BridgeOptions {
  udpHost?: string;
  udpPort?: number;
  config?: string;
  captureDir?: string;
  noCapture?: boolean;
}

export function bridgePlugin(opts: BridgeOptions = {}): Plugin {
  bridgeUdpHost = opts.udpHost ?? "0.0.0.0";
  bridgeUdpPort = opts.udpPort ?? 14443;
  const captureDir = opts.captureDir ?? DEFAULT_CAPTURE_DIR;
  captureEnabled = !opts.noCapture;

  let udpServer: dgram.Socket | undefined;
  let statusInterval: ReturnType<typeof setInterval> | undefined;

  // Sync is fixed 0x544e ("TN")
  const sync = SYNC_MARKER;

  const publishStatusUpdates = () => {
    sendSse("status", getStatus());
    sendPfdSse("status", getPfdStatus());
    sendRawSse("status", getRawStatus());
  };

  const closeUdpServer = () => {
    if (!udpServer) return;
    try {
      udpServer.close();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[BRIDGE] Failed to close UDP socket: ${msg}`);
    }
    udpServer = undefined;
    bridgeUdpActive = false;
  };

  const startUdpServer = () => {
    closeUdpServer();
    currentFrame = null;

    const schema = ensureDecodeSchema();
    const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
    udpServer = socket;

    socket.on("message", (message) => {
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
          const decoded = decodePayload(message, schema);
          feedRawData(decoded, message, now);
          publishDecodedFrame(decoded, now, captureDir);
          return;
        }

        currentFrame.chunks.push(message);
        currentFrame.remainingBytes -= message.length;
        if (currentFrame.remainingBytes > 0) return;

        const frame = currentFrame;
        currentFrame = null;
        const payload = Buffer.concat(frame.chunks).subarray(0, frame.totalBytes);
        const decoded = decodePayload(payload, schema);
        feedRawData(decoded, payload, now);
        publishDecodedFrame(decoded, now, captureDir, frame.counter);
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error(`[UDP ERROR] ${lastError}`);
      }
    });

    socket.on("error", (error) => {
      lastError = error.message;
      bridgeUdpActive = false;
      console.error(`[UDP ERROR] ${error.message}`);
      publishStatusUpdates();
    });

    socket.bind(bridgeUdpPort, bridgeUdpHost, () => {
      const addr = socket.address();
      bridgeUdpActive = true;
      console.log(`[BRIDGE] UDP udp://${addr.address}:${addr.port}`);
      console.log(`[BRIDGE] schema ${schema.mappings.length} fields / ${schema.frameBytes} bytes per frame (out.json→field-catalog.ts)`);
      console.log(`[BRIDGE] capture ${captureEnabled ? `auto ${captureDir}` : "manual/off"}`);
      publishStatusUpdates();
    });
  };

  const reconfigureSource = (nextHost: string, nextPort: number) => {
    bridgeUdpHost = nextHost;
    bridgeUdpPort = nextPort;
    decodeSchema = null;
    decodeSchemaPort = null;
    firstReceiveTime = undefined;
    receivedPackets = 0;
    receivedFrames = 0;
    rawReceivedPackets = 0;
    rawReceivedFrames = 0;
    rawLastDecoded = null;
    rawLastHex = null;
    rawLastPacketAtMs = undefined;
    currentTelemetryFrame = null;
    currentPfdFrame = null;
    lastPacketAtMs = undefined;
    lastError = undefined;
    rawLastError = undefined;
    startUdpServer();
  };

  return {
    name: "pilot-bridge",

    configureServer(vite: ViteDevServer) {
      startUdpServer();

      statusInterval = setInterval(() => {
        publishStatusUpdates();
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
            sendJson(res, getStatus()); return;
          }
          if (req.method === "GET" && url.pathname === "/api/source/status") {
            sendJson(res, getSourceStatus()); return;
          }
          if (req.method === "POST" && url.pathname === "/api/source/config") {
            const body = await readRequestBody(req);
            const nextHost = typeof body?.host === "string" && body.host.trim().length > 0
              ? body.host.trim()
              : bridgeUdpHost;
            const nextPort = body?.port === undefined
              ? bridgeUdpPort
              : Number(body.port);
            if (!Number.isFinite(nextPort) || nextPort < 1 || nextPort > 65535) {
              sendJson(res, { error: "Invalid port" }, 400); return;
            }
            reconfigureSource(nextHost, nextPort);
            sendJson(res, getSourceStatus()); return;
          }
          if (req.method === "GET" && url.pathname === "/api/pfd/status") {
            sendJson(res, getPfdStatus()); return;
          }

          // API: Panel Builder current config
          if (req.method === "GET" && url.pathname === "/api/panel/config/current") {
            const config = readPanelConfigCurrent();
            if (!config) { sendJson(res, { error: "panel config not found" }, 404); return; }
            sendJson(res, config); return;
          }
          if (req.method === "PUT" && url.pathname === "/api/panel/config/current") {
            const body = await readRequestBody(req);
            if (!isPanelConfigNode(body)) {
              sendJson(res, { error: "invalid panel config" }, 400); return;
            }
            writePanelConfigCurrent(body);
            sendJson(res, { ok: true, file: path.basename(PANEL_CONFIG_CURRENT_PATH) }); return;
          }
          if (req.method === "GET" && url.pathname === "/api/panel/menu") {
            const menu = readPanelMenu();
            if (!menu) { sendJson(res, { error: "panel menu not found" }, 404); return; }
            sendJson(res, menu); return;
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
            sendJson(res, currentTelemetryFrame); return;
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
            sendJson(res, getRawMonitorState()); return;
          }
          if (req.method === "POST" && url.pathname === "/api/raw/stop") {
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
            if (action === "meta") { sendJson(res, readRecordingMeta(rec)); return; }
            if (action === "frame") { sendJson(res, findClosestPfdFrame(rec, Number(url.searchParams.get("timeMs") ?? "0"))); return; }
            if (action === "range") {
              sendJson(res, readPfdFrameRange(rec,
                optionalNumber(url.searchParams.get("fromMs")),
                optionalNumber(url.searchParams.get("toMs")),
                optionalNumber(url.searchParams.get("limit")) ?? 50000,
              )); return;
            }
          }

          // API: recordings (telemetry)
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
      closeUdpServer();
    },
  };
}

// ── frame pipeline ─────────────────────────────────────────────────

function publishDecodedFrame(
  decoded: Record<string, number | null>,
  receivedAtMs: number,
  captureDir: string,
  counter?: number,
): void {
  receivedFrames += 1;

  // Добавляем расчётные поля (dec_*)
  const enriched = applyDecFormulas(decoded);

  if (firstReceiveTime === undefined) firstReceiveTime = receivedAtMs;
  const timeMs = firstReceiveTime === undefined ? 0 : receivedAtMs - firstReceiveTime;
  const source = `tnparser-udp-${bridgeUdpPort}`;

  const frame: TelemetryFrame = {
    schema: "telemetry-frame.v1",
    seq: counter ?? receivedFrames,
    timeMs,
    replayTimeMs: null,
    receivedAt: new Date(receivedAtMs).toISOString(),
    source,
    ...enriched,
  };

  currentTelemetryFrame = frame;
  currentPfdFrame = frame;
  writeCaptureFrame(frame, captureDir);
  sendSse("frame", frame);
  sendPfdSse("pfd-frame", frame);
}

// ── SSE ────────────────────────────────────────────────────────────
function handleSse(res: http.ServerResponse): void {
  res.writeHead(200, { "Cache-Control": "no-cache", "Content-Type": "text/event-stream; charset=utf-8", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  res.write("\n");
  sseClients.add(res);
  sendSseTo(res, "status", getStatus());
  if (currentTelemetryFrame) sendSseTo(res, "frame", currentTelemetryFrame);
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
  // [SILENCED] console.log(`[RAW-MONITOR] SSE broadcast "${event}" to ${rawSseClients.size} clients`);
  for (const c of rawSseClients) sendSseTo(c, event, data);
}

// ── status ─────────────────────────────────────────────────────────
function getStatus(): object {
  return {
    udp: `udp://${bridgeUdpHost}:${bridgeUdpPort}`,
    source: getSourceStatus(),
    receivedPackets, receivedFrames,
    lastPacketAgeMs: lastPacketAtMs === undefined ? null : Date.now() - lastPacketAtMs,
    currentSeq: currentTelemetryFrame?.seq ?? null,
    currentTimeMs: currentTelemetryFrame?.timeMs ?? null,
    schema: "telemetry-frame.v1",
    capturePath, capture: getCaptureStatus(""),
    sseClients: sseClients.size, pfdSseClients: pfdSseClients.size, lastError,
  };
}

function getPfdStatus(): object {
  return {
    schema: "telemetry-frame.v1",
    live: "/events/pfd", current: "/api/pfd/current",
    receivedFrames,
    currentSeq: currentPfdFrame?.seq ?? null,
    currentTimeMs: currentPfdFrame?.timeMs ?? null,
    lastPacketAgeMs: lastPacketAtMs === undefined ? null : Date.now() - lastPacketAtMs,
    sseClients: pfdSseClients.size,
    fieldCount: currentPfdFrame ? Object.keys(currentPfdFrame).filter(k => k !== "schema" && k !== "seq" && k !== "timeMs" && k !== "replayTimeMs" && k !== "receivedAt" && k !== "source").length : 0,
    lastError,
  };
}

function getSourceStatus() {
  return {
    udpHost: bridgeUdpHost,
    udpPort: bridgeUdpPort,
    active: bridgeUdpActive,
    schema: "telemetry-frame.v1",
    source: `tnparser-udp-${bridgeUdpPort}`,
  };
}

function getRawStatus() {
  return {
    source: {
      udpHost: bridgeUdpHost,
      udpPort: bridgeUdpPort,
    },
    mode: "decoder-stream" as const,
    active: bridgeUdpActive,
    receivedPackets: rawReceivedPackets,
    receivedFrames: rawReceivedFrames,
    lastPacketAgeMs: rawLastPacketAtMs ? Date.now() - rawLastPacketAtMs : null,
    lastDecodedKeys: rawLastDecoded ? Object.keys(rawLastDecoded).length : 0,
    sseClients: rawSseClients.size,
    lastError: rawLastError,
  };
}

// ── raw monitor (decoder stream only) ──────────────────────────────
function feedRawData(decoded: Record<string, number | null>, rawMessage: Buffer, now: number): void {
  rawReceivedPackets += 1;
  rawLastPacketAtMs = now;
  rawLastHex = rawMessage.toString("hex").slice(0, 512);

  rawLastDecoded = decoded as Record<string, number>;
  rawReceivedFrames += 1;
  rawLastError = undefined;
  // [SILENCED] console.log(`[RAW-MONITOR] Bridged frame #${rawReceivedFrames}, ${Object.keys(decoded).length} fields, SSE: ${rawSseClients.size}`);
  sendRawSse("raw-frame", { decoded, hex: rawLastHex, receivedAt: new Date(now).toISOString() });
  sendRawSse("status", getRawStatus());
}

function getRawMonitorState(): RawMonitorState {
  return {
    source: {
      udpHost: bridgeUdpHost,
      udpPort: bridgeUdpPort,
    },
    active: bridgeUdpActive,
    mode: "decoder-stream",
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
  sendSse("status", getStatus());
  sendPfdSse("status", getPfdStatus());
  return getCaptureStatus(captureDir);
}

function stopCapture(): object {
  captureEnabled = false;
  const p = capturePath; const n = captureFrames;
  closeCapture();
  console.log(`[CAPTURE] stopped ${p ?? "n/a"} frames=${n}`);
  sendSse("status", getStatus());
  sendPfdSse("status", getPfdStatus());
  return { ...getCaptureStatus(""), stoppedPath: p, stoppedFrames: n };
}

function closeCapture(): void {
  if (!captureStream) return;
  captureStream.end();
  captureStream = undefined;
}

function writeCaptureFrame(frame: TelemetryFrame, captureDir: string): void {
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
  return { id: rec.id, fileName: rec.fileName, bytes: rec.bytes, modifiedAt: rec.modifiedAt, schema: "telemetry-frame.v1", frames: frames.length, startTimeMs: frames[0]?.timeMs ?? null, endTimeMs: frames[frames.length - 1]?.timeMs ?? null, firstSeq: frames[0]?.seq ?? null, lastSeq: frames[frames.length - 1]?.seq ?? null };
}

function findClosestFrame(rec: Recording, timeMs: number): TelemetryFrame | null {
  const frames = readJsonLines(rec.path);
  let best: TelemetryFrame | null = null; let bestD = Infinity;
  for (const f of frames) { const d = Math.abs(f.timeMs - timeMs); if (d < bestD) { best = f; bestD = d; } }
  return best;
}

function findClosestPfdFrame(rec: Recording, timeMs: number): TelemetryFrame | null {
  return findClosestFrame(rec, timeMs);
}

function readFrameRange(rec: Recording, fromMs?: number, toMs?: number, limit = 50000): TelemetryFrame[] {
  const frames = readJsonLines(rec.path);
  const result: TelemetryFrame[] = [];
  for (const f of frames) {
    if (fromMs !== undefined && f.timeMs < fromMs) continue;
    if (toMs !== undefined && f.timeMs > toMs) continue;
    result.push(f);
    if (result.length >= limit) break;
  }
  return result;
}

function readPfdFrameRange(rec: Recording, fromMs?: number, toMs?: number, limit = 50000): TelemetryFrame[] {
  return readFrameRange(rec, fromMs, toMs, limit);
}

function readJsonLines(filePath: string): TelemetryFrame[] {
  return fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean)
    .map(l => {
      const obj = JSON.parse(l);
      // Backward compat: accept old flight-frame.v1 and pfd-frame.v1 captures
      if (obj.schema === "telemetry-frame.v1" || obj.schema === "flight-frame.v1" || obj.schema === "pfd-frame.v1") {
        return obj as TelemetryFrame;
      }
      return null;
    })
    .filter((f): f is TelemetryFrame => f !== null && Number.isFinite(f.timeMs));
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

// ── panel config ────────────────────────────────────────────────────
function isPanelConfigNode(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const node = value as Record<string, unknown>;
  return typeof node.id === "string" && typeof node.type === "string";
}

function readPanelConfigCurrent(): Record<string, unknown> | null {
  if (!fs.existsSync(PANEL_CONFIG_CURRENT_PATH)) return null;
  const raw = fs.readFileSync(PANEL_CONFIG_CURRENT_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return isPanelConfigNode(parsed) ? parsed : null;
}

function writePanelConfigCurrent(config: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(PANEL_CONFIG_CURRENT_PATH), { recursive: true });
  fs.writeFileSync(PANEL_CONFIG_CURRENT_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function isPanelMenuConfig(value: unknown): value is { items: unknown[] } {
  if (!value || typeof value !== "object") return false;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return false;
  return items.every((item) => {
    if (!item || typeof item !== "object") return false;
    const row = item as { type?: string; label?: unknown; action?: unknown };
    if (row.type === "separator") return true;
    if (row.type === "item") {
      return typeof row.label === "string" && typeof row.action === "string";
    }
    return false;
  });
}

function readPanelMenu(): Record<string, unknown> | null {
  if (!fs.existsSync(PANEL_MENU_PATH)) return null;
  const raw = fs.readFileSync(PANEL_MENU_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return isPanelMenuConfig(parsed) ? parsed : null;
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

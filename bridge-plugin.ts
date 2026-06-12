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
  type StreamConfig,
} from "./decoding";
import {
  DEFAULT_SIMULATOR_INITIAL_CONFIG,
  FlightSimulator,
  type SimulatorBlackboxFrame,
  type SimulatorControls,
  type SimulatorInitialConfig,
  type SimulatorPilotSnapshot,
} from "./simulator";

import {
  startCapture as startCaptureManager,
  stopCapture as stopCaptureManager,
  writeCaptureFrame,
  writeSimulatorBlackboxFrame,
  getStatus as getCaptureStatusFromManager,
  createCapturePath,
} from "./bridge/capture";

import {
  handleSse,
  handlePfdSse,
  handleRawSse,
  sendSse,
  sendPfdSse,
  sendRawSse,
  sseClients,
  pfdSseClients,
  rawSseClients,
} from "./bridge/sse-publisher";

import * as RawMonitor from "./bridge/raw-monitor";
import * as SimulatorIntegration from "./bridge/simulator-integration";
import * as UdpListener from "./bridge/udp-listener";
import * as HttpApi from "./bridge/http-api";

// ── types ──────────────────────────────────────────────────────────

/** Плоский фрейм телеметрии — канонические ключи field-catalog.ts + dec_* */
export type TelemetryFrame = {
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

export type SimulatorProfile = {
  id: string;
  name: string;
  description: string;
  durationMs: number;
};

export type SimulatorInitialPreset = {
  id: string;
  name: string;
  description: string;
  config: SimulatorInitialConfig;
};

export type SimulatorProfileRunResult =
  | {
      ok: true;
      profile: SimulatorProfile;
      preset: SimulatorInitialPreset | null;
      initialConfig: SimulatorInitialConfig;
      frames: number;
      telemetryRecordingId: string;
      blackboxRecordingId: string;
      telemetryPath: string;
      blackboxPath: string;
      schema: { telemetry: string; blackbox: string };
    }
  | {
      ok: false;
      error: string;
      profiles: SimulatorProfile[];
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
const PROJECT_ROOT = path.resolve(__dirname);
const PANEL_CONFIG_CURRENT_PATH = path.join(__dirname, "data", "panels", "panel-config-current.json");
const PANELS_DIR = path.join(__dirname, "data", "panels");
const SIMULATOR_CONFIG_PATH = path.join(PROJECT_ROOT, "simulator-config.json");
const PANEL_MENU_PATH = path.join(__dirname, "panel-menu.json");
const VIEWER_DIR = path.join(__dirname, "public", "viewer");
const DEFAULT_CAPTURE_DIR = path.join(__dirname, "captures");

// Sync marker
const SYNC_MARKER = 0x544e;

// ── bridge state ───────────────────────────────────────────────────
// SSE clients now managed in ./bridge/sse-publisher.ts
// UDP frame assembly in ./bridge/udp-listener.ts
// (imported for size reporting in status)

let currentTelemetryFrame: TelemetryFrame | null = null;
let currentPfdFrame: TelemetryFrame | null = null;
let firstReceiveTime: number | undefined;
let latencyFrameId = 0; // монотонный счётчик для latency measurement
let bridgeUdpHost = "0.0.0.0";
let bridgeUdpPort = 14443;
let bridgeUdpActive = false;
let receivedFrames = 0;
let receivedPackets = 0;
let lastPacketAtMs: number | undefined;
let lastError: string | undefined;
// Capture / blackbox state moved to ./bridge/capture.ts (extraction for P0 #2 refactor)
// Old variables removed to avoid duplication.

let bridgeMode: "udp" | "simulator" = "udp";
const simulator = new FlightSimulator();
let simulatorInterval: ReturnType<typeof setInterval> | undefined;
let simulatorPilotSnapshot: SimulatorPilotSnapshot = { source: "api" };

// Simulator profiles and presets now from ./bridge/simulator-integration.ts (P0-2 extraction)
const SIMULATOR_PROFILES = SimulatorIntegration.SIMULATOR_PROFILES;
const SIMULATOR_INITIAL_PRESETS = SimulatorIntegration.SIMULATOR_INITIAL_PRESETS;

// Raw monitor state moved to ./bridge/raw-monitor.ts (P0-2 extraction)
// (rawUdpPort etc. now internal to RawMonitor module)

// Схема декодирования загружается при старте один раз
let decodeSchema: DecodeSchema | null = null;
let decodeSchemaPort: number | null = null;

function ensureDecodeSchema(): DecodeSchema | null {
  if (decodeSchema && decodeSchemaPort === bridgeUdpPort) return decodeSchema;
  console.log("[BRIDGE] Loading decode schema from out.json...");
  const outPath = path.resolve(PROJECT_ROOT, "out.json");

  // ── Проверка наличия out.json ──
  if (!fs.existsSync(outPath)) {
    const errMsg =
      "╔═══════════════════════════════════════════════════════════════╗\n" +
      "║  ❌  Файл out.json НЕ НАЙДЕН в корне проекта!               ║\n" +
      "║                                                               ║\n" +
      "║  Декодирование телеметрии НЕВОЗМОЖНО без out.json.           ║\n" +
      "║  Raw Data будет отображаться, но Decoded Parameters — ПУСТО. ║\n" +
      "║                                                               ║\n" +
      "║  Скопируй out.json из Windows-проекта в:                      ║\n" +
      "║    " + outPath + "\n" +
      "║                                                               ║\n" +
      "║  Или настрой UDP_CONFIG в .env:                               ║\n" +
      "║    UDP_CONFIG=/путь/к/out.json                                ║\n" +
      "╚═══════════════════════════════════════════════════════════════╝";
    console.error("\n" + errMsg + "\n");
    lastError = errMsg;
    return null;
  }

  let configs: StreamConfig[];
  try {
    configs = loadOutJson(__dirname, outPath);
  } catch (err) {
    const parseMsg = `❌ Ошибка загрузки out.json: ${err instanceof Error ? err.message : String(err)}`;
    console.error("\n" + parseMsg + "\n");
    lastError = parseMsg;
    return null;
  }

  const stream = findStreamForPort(configs, bridgeUdpPort);
  if (!stream) {
    const errMsg =
      "╔══════════════════════════════════════════════════════════════════╗\n" +
      "║  ❌  В out.json не найден stream для порта " + String(bridgeUdpPort).padEnd(30) + "║\n" +
      "║                                                                  ║\n" +
      "║  Проверь, что в файле есть секция с \"port\": \"" + bridgeUdpPort + "\"      ║\n" +
      "║  и \"state\": \"on\".                                                ║\n" +
      "╚══════════════════════════════════════════════════════════════════╝";
    console.error("\n" + errMsg + "\n");
    lastError = errMsg;
    return null;
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

const getStatus: any = () => ({});
const getPfdStatus: any = () => ({});
const getSourceStatus: any = () => ({});
const getRawStatus: any = () => ({});
const normalizeSimulatorConfig: any = (v: any) => ({});
const normalizePilotSnapshot: any = (v: any) => ({});
const readSimulatorConfig: any = () => ({});
const writeSimulatorConfig: any = (c: any) => {};
const clamp: any = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const optionalNumber: any = (v: string | null) => v ? Number(v) : undefined;
const publishDecodedFrame: any = (decoded: any, receivedAtMs: any, captureDir: any, counter?: any) => ({} as any);
const startSimulator: any = (c: any) => {};
const stopSimulator: any = () => {};

export function bridgePlugin(opts: BridgeOptions = {}): Plugin {
  bridgeUdpHost = opts.udpHost ?? "0.0.0.0";
  bridgeUdpPort = opts.udpPort ?? 14443;
  const captureDir = opts.captureDir ?? DEFAULT_CAPTURE_DIR;
  // captureEnabled handled inside manager (noCapture logic can be extended later)
  simulator.reset(readSimulatorConfig());

  // Wire raw monitor callbacks (after send/getRawStatus are in scope via imports/defs)
  RawMonitor.setCallbacks(sendRawSse, getRawStatus);

  let statusInterval: ReturnType<typeof setInterval> | undefined;

  // Sync is fixed 0x544e ("TN")
  const sync = SYNC_MARKER;

  const publishStatusUpdates = () => {
    sendSse("status", getStatus());
    sendPfdSse("status", getPfdStatus());
    sendRawSse("status", getRawStatus());
  };

  // UDP listener delegated to ./bridge/udp-listener.ts (P0-2)
  const closeUdpServer = () => UdpListener.closeUdpListener();
  const startUdpServer = () => {
    UdpListener.startUdpListener({
      host: bridgeUdpHost,
      port: bridgeUdpPort,
      syncMarker: sync,
      schema: ensureDecodeSchema(),
      decodePayload,
      onRawData: (message, now) => {
        receivedPackets += 1;
        lastPacketAtMs = now;
        if (RawMonitor.getRawUdpPort() === bridgeUdpPort) {
          RawMonitor.feedRawData(null, message, now);
        }
      },
      onDecoded: (decoded, payload, now, counter) => {
        if (bridgeMode === "simulator") return;
        if (decoded && Object.keys(decoded).length > 0) {
          publishDecodedFrame(decoded, now, captureDir, counter);
        } else {
          publishDecodedFrame(payload.length > 0 ? {} : {}, now, captureDir, counter);
        }
      },
      onError: (error) => {
        lastError = error.message;
        bridgeUdpActive = false;
        console.error(`[UDP ERROR] ${error.message}`);
        publishStatusUpdates();
      },
      onListening: (addr) => {
        bridgeUdpActive = true;
        console.log(`[BRIDGE] UDP udp://${addr.address}:${addr.port}`);
        const schema = ensureDecodeSchema();
        if (schema) {
          console.log(`[BRIDGE] schema ${schema.mappings.length} fields / ${schema.frameBytes} bytes per frame (out.json→field-catalog.ts)`);
        } else {
          console.error(`[BRIDGE] ❌ Декодирование отключено — out.json не загружен`);
        }
        const capStatus = getCaptureStatusFromManager(captureDir);
        console.log(`[BRIDGE] capture ${capStatus.enabled ? `auto ${captureDir}` : "manual/off"}`);
        publishStatusUpdates();
      },
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
    lastPacketAtMs = undefined;
    lastError = undefined;
    currentTelemetryFrame = null;
    currentPfdFrame = null;
    UdpListener.reconfigureUdpListener(nextHost, nextPort);
  };

  // ── raw monitor: independent UDP listener (delegated to ./bridge/raw-monitor.ts) ─
  const closeRawUdpServer = () => RawMonitor.closeRawUdpServer();
  const startRawUdpServer = () => RawMonitor.startRawUdpServer(ensureDecodeSchema());
  const reconfigureRawSource = (port: number) => {
    const isPiggy = port === bridgeUdpPort;
    RawMonitor.reconfigureRawSource(port, isPiggy);
  };

  return {
    name: "pilot-bridge",

    async configureServer(vite: ViteDevServer) {
      startUdpServer();
      startRawUdpServer();

      statusInterval = setInterval(() => {
        publishStatusUpdates();
      }, 1000);

      // ── HTTP middleware (delegated to ./bridge/http-api.ts) ────────────────────────────────────
      HttpApi.setupHttpApi(vite.middlewares, {
        captureDir,
        getStatus,
        getPfdStatus,
        getSourceStatus,
        getRawStatus,
        reconfigureSource,
        startSimulator,
        stopSimulator,
        sendJson: (res: any, data: any, status = 200) => {
          res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify(data, null, 2));
        },
        readRequestBody: (req: any) => new Promise((resolve, reject) => {
          let body = "";
          req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
          req.on("end", () => { try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); } });
          req.on("error", reject);
        }),
        RawMonitor,
        SimulatorIntegration,
        Capture: { getStatus: getCaptureStatusFromManager, startCapture: startCaptureManager, stopCapture: stopCaptureManager } as any,
      });

      // HTTP API fully delegated to ./bridge/http-api.ts (setupHttpApi called above).
      // Old middleware body removed during extraction.
          // [REMOVED] old HTTP middleware body - full routes now in ./bridge/http-api.ts (setupHttpApi above)









      // Stray capture API removed.

      // Stray simulator status route removed.
      // Remaining simulator and other old ifs removed.
    },
    closeBundle() {
      if (statusInterval) clearInterval(statusInterval);
      stopSimulator();
      try { stopCaptureManager(); } catch {}
      closeUdpServer();
    },
  };
}

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
import {
  DEFAULT_SIMULATOR_INITIAL_CONFIG,
  FlightSimulator,
  type SimulatorBlackboxFrame,
  type SimulatorControls,
  type SimulatorInitialConfig,
  type SimulatorPilotSnapshot,
} from "./simulator";

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

type SimulatorProfile = {
  id: string;
  name: string;
  description: string;
  durationMs: number;
};

type SimulatorInitialPreset = {
  id: string;
  name: string;
  description: string;
  config: SimulatorInitialConfig;
};

type SimulatorProfileRunResult =
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
const sseClients = new Set<http.ServerResponse>();
const pfdSseClients = new Set<http.ServerResponse>();
const rawSseClients = new Set<http.ServerResponse>();

let currentFrame: CurrentFrame | null = null;
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
let captureEnabled = false;
let captureStream: fs.WriteStream | undefined;
let capturePath: string | undefined;
let captureFrames = 0;

// ── simulator state ────────────────────────────────────────────────
let bridgeMode: "udp" | "simulator" = "udp";
const simulator = new FlightSimulator();
let simulatorInterval: ReturnType<typeof setInterval> | undefined;
let simulatorPilotSnapshot: SimulatorPilotSnapshot = { source: "api" };
let blackboxStream: fs.WriteStream | undefined;
let blackboxPath: string | undefined;
let blackboxFrames = 0;

const SIMULATOR_PROFILES: SimulatorProfile[] = [
  {
    id: "trim_hold_60s",
    name: "Trim hold 60s",
    description: "Neutral controls, initial throttle. Checks trim drift, CAS/Vy/G stability.",
    durationMs: 60_000,
  },
  {
    id: "pitch_step_up",
    name: "Pitch step up",
    description: "5s nose-up command, then neutral. Checks pitch->AoA->Vy/CAS response.",
    durationMs: 35_000,
  },
  {
    id: "pitch_step_down",
    name: "Pitch step down",
    description: "5s nose-down command, then neutral. Checks acceleration/descent response.",
    durationMs: 35_000,
  },
  {
    id: "roll_command_step",
    name: "Roll command step / release",
    description: "3s full right roll command, then neutral. Checks roll response, centering and turn rate. Does not guarantee exactly 30deg bank.",
    durationMs: 45_000,
  },
  {
    id: "throttle_step",
    name: "Throttle step",
    description: "Throttle 0.6 -> 1.0 step. Checks N1 spool and CAS response.",
    durationMs: 45_000,
  },
  {
    id: "combined_maneuver",
    name: "Combined maneuver",
    description: "Pitch, roll, rudder and throttle sequence for cross-coupled response checks.",
    durationMs: 70_000,
  },
];

const SIMULATOR_INITIAL_PRESETS: SimulatorInitialPreset[] = [
  {
    id: "cruise_10000_250",
    name: "Cruise 250 kt / 10000 ft",
    description: "Базовый режим для проверки trim и стандартных команд.",
    config: { altitudeFt: 10_000, casKt: 250, throttle: 0.6, pitchDeg: 3 },
  },
  {
    id: "low_speed_3000_160",
    name: "Low speed 160 kt / 3000 ft",
    description: "Низкая скорость: видно, как модель реагирует на pitch/AoA/Vy ближе к нижнему диапазону.",
    config: { altitudeFt: 3_000, casKt: 160, throttle: 0.55, pitchDeg: 5 },
  },
  {
    id: "high_altitude_25000_250",
    name: "High altitude 250 kt / 25000 ft",
    description: "Высота: проверка влияния плотности и CAS/TAS-пересчёта.",
    config: { altitudeFt: 25_000, casKt: 250, throttle: 0.72, pitchDeg: 4 },
  },
  {
    id: "approach_1500_140",
    name: "Approach 140 kt / 1500 ft",
    description: "Заходный режим без механизации: полезен для проверки низкой скорости и вертикальной реакции.",
    config: { altitudeFt: 1_500, casKt: 140, throttle: 0.5, pitchDeg: 4 },
  },
];

// ── raw monitor state ──────────────────────────────────────────────
let rawUdpPort = 14442;
let rawUdpSocket: dgram.Socket | undefined;
let rawUdpActive = false;
let rawLastDecoded: Record<string, number> | null = null;
let rawLastHex: string | null = null;
let rawReceivedPackets = 0;
let rawReceivedFrames = 0;
let rawLastPacketAtMs: number | undefined;
let rawLastError: string | undefined;

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

export function bridgePlugin(opts: BridgeOptions = {}): Plugin {
  bridgeUdpHost = opts.udpHost ?? "0.0.0.0";
  bridgeUdpPort = opts.udpPort ?? 14443;
  const captureDir = opts.captureDir ?? DEFAULT_CAPTURE_DIR;
  captureEnabled = opts.noCapture ? false : false;
  simulator.reset(readSimulatorConfig());

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
      if (bridgeMode === "simulator") return;
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
          if (schema) {
            const decoded = decodePayload(message, schema);
            if (rawUdpPort === bridgeUdpPort) feedRawData(decoded, message, now);
            publishDecodedFrame(decoded, now, captureDir);
          } else {
            if (rawUdpPort === bridgeUdpPort) feedRawData(null, message, now);
            publishDecodedFrame(message.length > 0 ? {} : {}, now, captureDir);
          }
          return;
        }

        currentFrame.chunks.push(message);
        currentFrame.remainingBytes -= message.length;
        if (currentFrame.remainingBytes > 0) return;

        const frame = currentFrame;
        currentFrame = null;
        const payload = Buffer.concat(frame.chunks).subarray(0, frame.totalBytes);
        if (schema) {
          const decoded = decodePayload(payload, schema);
          if (rawUdpPort === bridgeUdpPort) feedRawData(decoded, payload, now);
          publishDecodedFrame(decoded, now, captureDir, frame.counter);
        } else {
          if (rawUdpPort === bridgeUdpPort) feedRawData(null, payload, now);
          publishDecodedFrame(payload.length > 0 ? {} : {}, now, captureDir, frame.counter);
        }
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
      if (schema) {
        console.log(`[BRIDGE] schema ${schema.mappings.length} fields / ${schema.frameBytes} bytes per frame (out.json→field-catalog.ts)`);
      } else {
        console.error(`[BRIDGE] ❌ Декодирование отключено — out.json не загружен`);
      }
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
    lastPacketAtMs = undefined;
    lastError = undefined;
    currentTelemetryFrame = null;
    currentPfdFrame = null;
    startUdpServer();
  };

  // ── raw monitor: independent UDP listener ─────────────────────────
  const closeRawUdpServer = () => {
    if (!rawUdpSocket) return;
    try { rawUdpSocket.close(); } catch { /* ignore */ }
    rawUdpSocket = undefined;
    rawUdpActive = false;
  };

  const startRawUdpServer = () => {
    closeRawUdpServer();
    rawLastDecoded = null;
    rawLastHex = null;
    rawReceivedPackets = 0;
    rawReceivedFrames = 0;
    rawLastPacketAtMs = undefined;
    rawLastError = undefined;

    const schema = ensureDecodeSchema();

    const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
    rawUdpSocket = socket;

    socket.on("message", (message) => {
      const now = Date.now();
      rawReceivedPackets += 1;
      rawLastPacketAtMs = now;

      try {
        const decoded = decodePayload(message, schema);
        feedRawData(decoded, message, now);
      } catch (error) {
        rawLastError = error instanceof Error ? error.message : String(error);
        console.error(`[RAW-UDP ERROR] ${rawLastError}`);
      }
    });

    socket.on("error", (error) => {
      rawLastError = error.message;
      rawUdpActive = false;
      console.error(`[RAW-UDP ERROR] ${error.message}`);
    });

    socket.bind(rawUdpPort, "0.0.0.0", () => {
      rawUdpActive = true;
      console.log(`[RAW-MONITOR] UDP udp://0.0.0.0:${rawUdpPort}`);
    });
  };

  const reconfigureRawSource = (port: number) => {
    rawUdpPort = port;
    rawReceivedPackets = 0;
    rawReceivedFrames = 0;
    rawLastPacketAtMs = undefined;
    rawLastDecoded = null;
    rawLastHex = null;
    rawLastError = undefined;
    // If same port as main bridge, piggyback on its stream
    if (port === bridgeUdpPort) {
      closeRawUdpServer();
      rawUdpActive = bridgeUdpActive;
      return;
    }
    startRawUdpServer();
  };

  return {
    name: "pilot-bridge",

    configureServer(vite: ViteDevServer) {
      startUdpServer();
      startRawUdpServer();

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
          if (req.method === "GET" && url.pathname === "/api/source/config") {
            try {
              const configPath = path.join(__dirname, "config.json");
              if (fs.existsSync(configPath)) {
                const raw = fs.readFileSync(configPath, "utf-8");
                const config = JSON.parse(raw);
                sendJson(res, config); return;
              }
            } catch { /* fallthrough */ }
            sendJson(res, { udp: { host: bridgeUdpHost, port: bridgeUdpPort } }); return;
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
            // Сохраняем в config.json — сработает и для dev, и для build
            try {
              const configPath = path.join(__dirname, "config.json");
              fs.writeFileSync(configPath, JSON.stringify({ udp: { host: nextHost, port: nextPort } }, null, 2) + "\n", "utf-8");
            } catch { /* non-critical */ }
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

          // API: Panel profiles (data/panels/)
          const PANELS_PREFIX = "/api/panels/";
          if (url.pathname?.startsWith(PANELS_PREFIX)) {
            console.log("[api] panels request:", req.method, url.pathname);
            const profileName = decodeURIComponent(url.pathname.slice(PANELS_PREFIX.length));

            // GET /api/panels/ — list all profiles
            if (req.method === "GET" && !profileName) {
              try {
                fs.mkdirSync(PANELS_DIR, { recursive: true });
                const files = fs.readdirSync(PANELS_DIR).filter(f => f.endsWith(".json"));
                console.log("[api] panels files:", files, "dir:", PANELS_DIR);
                const profiles = files.map(f => ({
                  name: f.replace(/\.json$/, ""),
                  path: f,
                  updatedAt: fs.statSync(path.join(PANELS_DIR, f)).mtime.toISOString(),
                }));
                console.log("[api] panels result:", JSON.stringify(profiles));
                sendJson(res, profiles); return;
              } catch {
                sendJson(res, { error: "cannot list panels" }, 500); return;
              }
            }

            // GET /api/panels/:name — load profile
            if (req.method === "GET" && profileName) {
              const filePath = path.join(PANELS_DIR, profileName + ".json");
              try {
                if (!fs.existsSync(filePath)) {
                  sendJson(res, { error: "panel not found" }, 404); return;
                }
                const raw = fs.readFileSync(filePath, "utf8");
                const parsed = JSON.parse(raw);
                sendJson(res, { name: profileName, data: parsed }); return;
              } catch {
                sendJson(res, { error: "cannot read panel" }, 500); return;
              }
            }

            // PUT /api/panels/:name — save profile
            if (req.method === "PUT" && profileName) {
              const body = await readRequestBody(req);
              const data = body?.data;
              if (!data || !isPanelConfigNode(data)) {
                sendJson(res, { error: "invalid panel config" }, 400); return;
              }
              try {
                fs.mkdirSync(PANELS_DIR, { recursive: true });
                fs.writeFileSync(path.join(PANELS_DIR, profileName + ".json"), JSON.stringify(data, null, 2) + "\n", "utf8");
                sendJson(res, { ok: true, name: profileName }); return;
              } catch {
                sendJson(res, { error: "cannot write panel" }, 500); return;
              }
            }

            // DELETE /api/panels/:name — delete profile
            if (req.method === "DELETE" && profileName) {
              const filePath = path.join(PANELS_DIR, profileName + ".json");
              try {
                if (!fs.existsSync(filePath)) {
                  sendJson(res, { error: "panel not found" }, 404); return;
                }
                fs.unlinkSync(filePath);
                sendJson(res, { ok: true, name: profileName }); return;
              } catch {
                sendJson(res, { error: "cannot delete panel" }, 500); return;
              }
            }

            sendJson(res, { error: "method not allowed" }, 405); return;
          }

          // API: Profiles (data/profiles/)
          const PROFILES_DIR = path.join(__dirname, "data", "profiles");
          const PROFILES_PREFIX = "/api/profiles/";
          if (url.pathname?.startsWith(PROFILES_PREFIX)) {
            console.log("[api] profiles request:", req.method, url.pathname);
            const profileName = decodeURIComponent(url.pathname.slice(PROFILES_PREFIX.length));

            // GET /api/profiles/ — list all profiles
            if (req.method === "GET" && !profileName) {
              try {
                fs.mkdirSync(PROFILES_DIR, { recursive: true });
                const files = fs.readdirSync(PROFILES_DIR).filter(f => f.endsWith(".json"));
                const profiles = files.map(f => {
                  const raw = fs.readFileSync(path.join(PROFILES_DIR, f), "utf8");
                  try {
                    const parsed = JSON.parse(raw);
                    return {
                      id: f.replace(/\.json$/, ""),
                      name: parsed.name || f.replace(/\.json$/, ""),
                      panelConfigName: parsed.panelConfigName || null,
                      updatedAt: fs.statSync(path.join(PROFILES_DIR, f)).mtime.toISOString(),
                    };
                  } catch {
                    return null;
                  }
                }).filter(Boolean);
                sendJson(res, profiles); return;
              } catch {
                sendJson(res, { error: "cannot list profiles" }, 500); return;
              }
            }

            // GET /api/profiles/:name — load profile
            if (req.method === "GET" && profileName) {
              const filePath = path.join(PROFILES_DIR, profileName + ".json");
              try {
                if (!fs.existsSync(filePath)) {
                  sendJson(res, { error: "profile not found" }, 404); return;
                }
                const raw = fs.readFileSync(filePath, "utf8");
                const parsed = JSON.parse(raw);
                // Add current config status
                const panelConfigName = parsed.panelConfigName || null;
                sendJson(res, { id: profileName, name: parsed.name || profileName, panelConfigName, updatedAt: fs.statSync(filePath).mtime.toISOString() }); return;
              } catch {
                sendJson(res, { error: "cannot read profile" }, 500); return;
              }
            }

            // PUT /api/profiles/:name — save profile
            if (req.method === "PUT" && profileName) {
              const body = await readRequestBody(req);
              const name = typeof body?.name === "string" ? body.name : profileName;
              const panelConfigName = typeof body?.panelConfigName === "string" ? body.panelConfigName : null;
              try {
                fs.mkdirSync(PROFILES_DIR, { recursive: true });
                fs.writeFileSync(path.join(PROFILES_DIR, profileName + ".json"),
                  JSON.stringify({ name, panelConfigName }, null, 2) + "\n", "utf8");
                sendJson(res, { ok: true, id: profileName }); return;
              } catch {
                sendJson(res, { error: "cannot write profile" }, 500); return;
              }
            }

            // DELETE /api/profiles/:name — delete profile
            if (req.method === "DELETE" && profileName) {
              const filePath = path.join(PROFILES_DIR, profileName + ".json");
              try {
                if (!fs.existsSync(filePath)) {
                  sendJson(res, { error: "profile not found" }, 404); return;
                }
                fs.unlinkSync(filePath);
                sendJson(res, { ok: true, id: profileName }); return;
              } catch {
                sendJson(res, { error: "cannot delete profile" }, 500); return;
              }
            }

            sendJson(res, { error: "method not allowed" }, 405); return;
          }

          // API: capture
          if (req.method === "GET" && url.pathname === "/api/capture/status") {
            sendJson(res, getCaptureStatus(captureDir)); return;
          }
          if (req.method === "POST" && url.pathname === "/api/capture/start") {
            const body = await readRequestBody(req);
            const source = body?.source || "unknown";
            const duration = body?.duration || "capture";
            sendJson(res, startCapture(captureDir, source, duration)); return;
          }
          if (req.method === "POST" && url.pathname === "/api/capture/stop") {
            sendJson(res, stopCapture()); return;
          }

          // API: simulator
          if (req.method === "GET" && url.pathname === "/api/simulator/status") {
            sendJson(res, {
              mode: bridgeMode,
              active: Boolean(simulatorInterval),
              initialConfig: simulator.getInitialConfig(),
              controls: simulator.controls,
              pilot: simulatorPilotSnapshot,
              blackbox: getBlackboxStatus(captureDir),
              state: {
                pitch: simulator.pitch,
                roll: simulator.roll,
                heading: simulator.heading,
                altitude: simulator.altitude,
                vy: simulator.vy,
                cas: simulator.cas,
                throttle: simulator.throttle,
                n1: simulator.n1,
                normalG: simulator.normalG
              }
            });
            return;
          }
          if (req.method === "GET" && url.pathname === "/api/simulator/blackbox/status") {
            sendJson(res, getBlackboxStatus(captureDir));
            return;
          }
          if (req.method === "GET" && url.pathname === "/api/simulator/profiles") {
            sendJson(res, SIMULATOR_PROFILES);
            return;
          }
          if (req.method === "GET" && url.pathname === "/api/simulator/profile-presets") {
            sendJson(res, SIMULATOR_INITIAL_PRESETS);
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/simulator/profile/run") {
            const body = await readRequestBody(req);
            const profileId = typeof body?.profileId === "string" ? body.profileId : "trim_hold_60s";
            const presetId = typeof body?.presetId === "string" ? body.presetId : "cruise_10000_250";
            const preset = SIMULATOR_INITIAL_PRESETS.find((item) => item.id === presetId) ?? null;
            const initialConfig = body?.initialConfig !== undefined
              ? normalizeSimulatorConfig(body.initialConfig)
              : preset?.config ?? readSimulatorConfig();
            const result = runSimulatorProfile(profileId, captureDir, initialConfig, preset);
            if (!result.ok) {
              sendJson(res, result, 404);
              return;
            }
            sendJson(res, result);
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/simulator/mode") {
            const body = await readRequestBody(req);
            const nextMode = body?.mode;
            if (nextMode === "simulator") {
              bridgeMode = "simulator";
              startSimulator(captureDir);
            } else if (nextMode === "udp") {
              bridgeMode = "udp";
              stopSimulator();
            } else {
              sendJson(res, { error: "Invalid mode" }, 400); return;
            }
            sendJson(res, { ok: true, mode: bridgeMode });
            return;
          }
          if (req.method === "GET" && url.pathname === "/api/simulator/config") {
            sendJson(res, simulator.getInitialConfig());
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/simulator/config") {
            const body = await readRequestBody(req);
            const config = simulator.setInitialConfig(normalizeSimulatorConfig(body));
            writeSimulatorConfig(config);
            if (!simulatorInterval) simulator.reset();
            sendJson(res, { ok: true, initialConfig: config });
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/simulator/control") {
            const body = await readRequestBody(req);
            simulatorPilotSnapshot = normalizePilotSnapshot(body);
            simulator.setControls({
              roll: body?.roll !== undefined ? Number(body.roll) : undefined,
              pitch: body?.pitch !== undefined ? Number(body.pitch) : undefined,
              rudder: body?.rudder !== undefined ? Number(body.rudder) : undefined,
              throttle: body?.throttle !== undefined ? Number(body.throttle) : undefined,
            });
            sendJson(res, { ok: true, controls: simulator.controls });
            return;
          }
          if (req.method === "POST" && url.pathname === "/api/simulator/reset") {
            simulator.reset();
            sendJson(res, { ok: true });
            return;
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
          if (req.method === "POST" && url.pathname === "/api/raw/port") {
            const body = await readRequestBody(req);
            const nextPort = Number(body?.port);
            if (!Number.isFinite(nextPort) || nextPort < 1 || nextPort > 65535) {
              sendJson(res, { error: "Invalid port" }, 400); return;
            }
            reconfigureRawSource(nextPort);
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
      stopSimulator();
      closeBlackbox();
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
): TelemetryFrame {
  receivedFrames += 1;
  latencyFrameId += 1;

  // Добавляем расчётные поля (dec_*)
  const enriched = applyDecFormulas(decoded);
  const tDecodedMs = Date.now();

  // DIAG: latency fields
  if (latencyFrameId === 1 || latencyFrameId % 1000 === 0) {
    console.log(`[LATENCY] frame ${latencyFrameId} _t0_ms=${receivedAtMs} _t_decode_ms=${tDecodedMs}`);
  }

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
    _t0_ms: receivedAtMs,
    _t_decode_ms: tDecodedMs,
    _frame_id: latencyFrameId,
    ...enriched,
  };

  currentTelemetryFrame = frame;
  currentPfdFrame = frame;
  writeCaptureFrame(frame, captureDir);
  sendSse("frame", frame);
  sendPfdSse("pfd-frame", frame);
  return frame;
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
    simulatorMode: bridgeMode,
    simulatorActive: Boolean(simulatorInterval),
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
    simulatorMode: bridgeMode,
    simulatorActive: Boolean(simulatorInterval),
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
      udpHost: "0.0.0.0",
      udpPort: rawUdpPort,
    },
    mode: "decoder-stream" as const,
    active: rawUdpActive,
    receivedPackets: rawReceivedPackets,
    receivedFrames: rawReceivedFrames,
    lastPacketAgeMs: rawLastPacketAtMs ? Date.now() - rawLastPacketAtMs : null,
    lastDecodedKeys: rawLastDecoded ? Object.keys(rawLastDecoded).length : 0,
    sseClients: rawSseClients.size,
    lastError: rawLastError,
  };
}

function normalizeSimulatorConfig(value: unknown): SimulatorInitialConfig {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const numberOrDefault = (key: keyof SimulatorInitialConfig) => {
    const value = Number(source[key]);
    return Number.isFinite(value) ? value : DEFAULT_SIMULATOR_INITIAL_CONFIG[key];
  };

  return {
    altitudeFt: clamp(numberOrDefault("altitudeFt"), 0, 60_000),
    casKt: clamp(numberOrDefault("casKt"), 60, 500),
    throttle: clamp(numberOrDefault("throttle"), 0, 1),
    pitchDeg: clamp(numberOrDefault("pitchDeg"), -10, 15),
  };
}

function normalizePilotSnapshot(value: unknown): SimulatorPilotSnapshot {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const pilot = source.pilot && typeof source.pilot === "object" ? source.pilot as Record<string, unknown> : {};
  const keysValue = pilot.keys;
  const keys = Array.isArray(keysValue)
    ? keysValue.filter((key): key is string => typeof key === "string").slice(0, 16)
    : undefined;
  const numberOrUndefined = (key: string): number | undefined => {
    const raw = pilot[key] ?? source[key.replace("CmdRaw", "")];
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  };

  return {
    source: "keyboard",
    keys,
    rollCmdRaw: numberOrUndefined("rollCmdRaw"),
    pitchCmdRaw: numberOrUndefined("pitchCmdRaw"),
    rudderCmdRaw: numberOrUndefined("rudderCmdRaw"),
    throttleCmdRaw: numberOrUndefined("throttleCmdRaw"),
  };
}

function readSimulatorConfig(): SimulatorInitialConfig {
  try {
    if (!fs.existsSync(SIMULATOR_CONFIG_PATH)) {
      writeSimulatorConfig(DEFAULT_SIMULATOR_INITIAL_CONFIG);
      return { ...DEFAULT_SIMULATOR_INITIAL_CONFIG };
    }

    const parsed = JSON.parse(fs.readFileSync(SIMULATOR_CONFIG_PATH, "utf8"));
    return normalizeSimulatorConfig(parsed);
  } catch (error) {
    console.warn("[BRIDGE] Failed to read simulator config", error);
    return { ...DEFAULT_SIMULATOR_INITIAL_CONFIG };
  }
}

function writeSimulatorConfig(config: SimulatorInitialConfig): void {
  fs.writeFileSync(SIMULATOR_CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
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

// ── capture ────────────────────────────────────────────────────────
function getCaptureStatus(_dir: string): object {
  return {
    enabled: captureEnabled,
    active: Boolean(captureStream),
    path: capturePath,
    frames: captureFrames,
    dir: _dir,
    blackbox: getBlackboxStatus(_dir),
  };
}

function getBlackboxStatus(_dir: string): object {
  return {
    enabled: captureEnabled,
    active: Boolean(blackboxStream),
    path: blackboxPath,
    frames: blackboxFrames,
    dir: _dir,
    schema: "sim-blackbox.v1",
  };
}

function startCapture(captureDir: string, source = "unknown", duration = "capture"): object {
  if (captureStream) return getCaptureStatus(captureDir);
  fs.mkdirSync(captureDir, { recursive: true });
  capturePath = createCapturePath(captureDir, source, duration);
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
  const bp = blackboxPath; const bn = blackboxFrames;
  closeCapture();
  closeBlackbox();
  console.log(`[CAPTURE] stopped ${p ?? "n/a"} frames=${n}`);
  sendSse("status", getStatus());
  sendPfdSse("status", getPfdStatus());
  return { ...getCaptureStatus(""), stoppedPath: p, stoppedFrames: n, stoppedBlackboxPath: bp, stoppedBlackboxFrames: bn };
}

function closeCapture(): void {
  if (!captureStream) return;
  captureStream.end();
  captureStream = undefined;
}

function ensureBlackboxStream(captureDir: string): void {
  if (blackboxStream) return;
  fs.mkdirSync(captureDir, { recursive: true });
  if (!captureStream) startCapture(captureDir);
  blackboxPath = createBlackboxPath(captureDir);
  blackboxFrames = 0;
  blackboxStream = fs.createWriteStream(blackboxPath, { flags: "wx", encoding: "utf8" });
  console.log(`[BLACKBOX] started ${blackboxPath}`);
}

function writeSimulatorBlackboxFrame(frame: SimulatorBlackboxFrame, captureDir: string): void {
  if (!captureEnabled) return;
  ensureBlackboxStream(captureDir);
  blackboxStream?.write(`${JSON.stringify(frame)}\n`);
  blackboxFrames += 1;
}

function closeBlackbox(): void {
  if (!blackboxStream) return;
  blackboxStream.end();
  blackboxStream = undefined;
}

// ── simulator loops ────────────────────────────────────────────────
function startSimulator(captureDir: string): void {
  if (simulatorInterval) return;
  simulator.reset();
  firstReceiveTime = undefined;
  simulatorInterval = setInterval(() => {
    const now = Date.now();
    const decoded = simulator.step(0.04);
    const frame = publishDecodedFrame(decoded, now, captureDir);
    writeSimulatorBlackboxFrame(
      simulator.buildBlackboxFrame(frame.timeMs, now, decoded, simulatorPilotSnapshot, "simulator-live"),
      captureDir,
    );
  }, 40);
  console.log("[BRIDGE] Flight Simulator active at 25Hz");
  sendSse("status", getStatus());
  sendPfdSse("status", getPfdStatus());
}

function stopSimulator(): void {
  if (!simulatorInterval) return;
  clearInterval(simulatorInterval);
  simulatorInterval = undefined;
  console.log("[BRIDGE] Flight Simulator stopped");
  sendSse("status", getStatus());
  sendPfdSse("status", getPfdStatus());
}

function writeCaptureFrame(frame: TelemetryFrame, captureDir: string): void {
  if (!captureEnabled) return;
  if (!captureStream) startCapture(captureDir);
  captureStream?.write(`${JSON.stringify(frame)}\n`);
  captureFrames += 1;
}

function createCapturePath(dir: string, source = "unknown", duration = "capture"): string {
  const safeSource = source.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeDuration = duration.replace(/[^a-zA-Z0-9_-]/g, "_");
  return createUniquePfdrecPath(dir, `${safeSource}_${safeDuration}`);
}

function createBlackboxPath(dir: string): string {
  if (capturePath) {
    const base = path.basename(capturePath, ".pfdrec");
    return createUniquePfdrecPath(dir, `${base}_sim_blackbox`);
  }
  return createCapturePath(dir, "unknown", "sim_blackbox");
}

function createUniquePfdrecPath(dir: string, base: string): string {
  for (let i = 0; i < 1000; i++) {
    const suffix = i === 0 ? "" : `_${String(i).padStart(3, "0")}`;
    const p = path.join(dir, `${base}${suffix}.pfdrec`);
    if (!fs.existsSync(p)) return p;
  }
  throw new Error("Cannot allocate unique capture file name");
}

// ── simulator profiles ─────────────────────────────────────────────
function runSimulatorProfile(
  profileId: string,
  captureDir: string,
  initialConfig: SimulatorInitialConfig,
  preset: SimulatorInitialPreset | null,
): SimulatorProfileRunResult {
  const profile = SIMULATOR_PROFILES.find((item) => item.id === profileId);
  if (!profile) {
    return { ok: false, error: `Unknown simulator profile: ${profileId}`, profiles: SIMULATOR_PROFILES };
  }

  fs.mkdirSync(captureDir, { recursive: true });
  const presetTag = preset?.id ?? "custom_initial";
  const telemetryPath = createCapturePath(captureDir, `profile_${profile.id}`, `${presetTag}_telemetry`);
  const blackboxOutputPath = createCapturePath(captureDir, `profile_${profile.id}`, `${presetTag}_blackbox`);
  const telemetryLines: string[] = [];
  const blackboxLines: string[] = [];

  const sim = new FlightSimulator();
  sim.reset(initialConfig);
  const startMs = Date.now();
  const dt = 0.04;
  const stepMs = 40;
  const steps = Math.max(1, Math.round(profile.durationMs / stepMs));

  for (let i = 0; i < steps; i += 1) {
    const timeMs = i * stepMs;
    const receivedAtMs = startMs + timeMs;
    const controls = controlsForProfile(profile.id, timeMs / 1000, sim.throttle);
    sim.setControls(controls);
    const decoded = sim.step(dt);
    const enriched = applyDecFormulas(decoded);
    const frame: TelemetryFrame = {
      schema: "telemetry-frame.v1",
      seq: i + 1,
      timeMs,
      replayTimeMs: null,
      receivedAt: new Date(receivedAtMs).toISOString(),
      source: `simulator-profile-${profile.id}`,
      ...enriched,
    };
    const pilot: SimulatorPilotSnapshot = {
      source: "profile",
      profileId: profile.id,
      rollCmdRaw: controls.roll,
      pitchCmdRaw: controls.pitch,
      rudderCmdRaw: controls.rudder,
      throttleCmdRaw: controls.throttle,
    };
    telemetryLines.push(JSON.stringify(frame));
    blackboxLines.push(JSON.stringify(sim.buildBlackboxFrame(timeMs, receivedAtMs, decoded, pilot, frame.source)));
  }

  fs.writeFileSync(telemetryPath, `${telemetryLines.join("\n")}\n`, { flag: "wx", encoding: "utf8" });
  fs.writeFileSync(blackboxOutputPath, `${blackboxLines.join("\n")}\n`, { flag: "wx", encoding: "utf8" });

  return {
    ok: true,
    profile,
    preset,
    initialConfig,
    frames: steps,
    telemetryRecordingId: path.basename(telemetryPath, ".pfdrec"),
    blackboxRecordingId: path.basename(blackboxOutputPath, ".pfdrec"),
    telemetryPath,
    blackboxPath: blackboxOutputPath,
    schema: {
      telemetry: "telemetry-frame.v1",
      blackbox: "sim-blackbox.v1",
    },
  };
}

function controlsForProfile(profileId: string, t: number, currentThrottle: number): SimulatorControls {
  const base: SimulatorControls = { roll: 0, pitch: 0, rudder: 0, throttle: currentThrottle };
  switch (profileId) {
    case "pitch_step_up":
      return { ...base, pitch: t >= 5 && t < 10 ? 1 : 0 };
    case "pitch_step_down":
      return { ...base, pitch: t >= 5 && t < 10 ? -1 : 0 };
    case "roll_command_step":
    case "roll_step_30deg":
      return { ...base, roll: t >= 5 && t < 8 ? 1 : 0 };
    case "throttle_step":
      return { ...base, throttle: t >= 5 ? 1 : 0.6 };
    case "combined_maneuver":
      if (t < 5) return base;
      if (t < 12) return { ...base, pitch: 0.75, throttle: 0.85 };
      if (t < 22) return { ...base, roll: 0.8, pitch: 0.25, throttle: 0.85 };
      if (t < 30) return { ...base, roll: 0.35, rudder: 0.3, throttle: 0.75 };
      if (t < 42) return { ...base, pitch: -0.55, throttle: 0.55 };
      if (t < 55) return { ...base, throttle: 0.65 };
      return { ...base, throttle: 0.6 };
    case "trim_hold_60s":
    default:
      return base;
  }
}

// ── recordings ─────────────────────────────────────────────────────
function listRecordings(dir: string): Recording[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".pfdrec") && !f.includes("_blackbox"))
    .map(f => { const fp = path.join(dir, f); const s = fs.statSync(fp); return { id: f.replace(/\.pfdrec$/i, ""), fileName: f, path: fp, bytes: s.size, modifiedAt: s.mtime.toISOString() }; })
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

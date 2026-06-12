/**
 * Capture & Blackbox manager.
 * Extracted from bridge-plugin.ts as first step of monolith refactoring (P0 #2).
 *
 * Responsibilities:
 * - Starting/stopping .pfdrec capture streams for telemetry
 * - Managing simulator blackbox sidecar
 * - Writing frames
 * - Status reporting
 */

import fs from "node:fs";
import path from "node:path";

// Minimal telemetry shape for writing (avoid circular dep with bridge-plugin during extraction phase).
type MinimalTelemetryFrame = Record<string, unknown> & {
  schema: string;
  seq: number;
  timeMs: number;
};

type TelemetryFrameForWrite = MinimalTelemetryFrame;

export type CaptureStatus = {
  enabled: boolean;
  active: boolean;
  path?: string;
  frames: number;
  dir: string;
  blackbox: BlackboxStatus;
};

export type BlackboxStatus = {
  enabled: boolean;
  active: boolean;
  path?: string;
  frames: number;
  dir: string;
  schema: string;
};

let captureEnabled = false;
let captureStream: fs.WriteStream | undefined;
let capturePath: string | undefined;
let captureFrames = 0;

let blackboxStream: fs.WriteStream | undefined;
let blackboxPath: string | undefined;
let blackboxFrames = 0;

function getCaptureStatus(dir: string): CaptureStatus {
  return {
    enabled: captureEnabled,
    active: Boolean(captureStream),
    path: capturePath,
    frames: captureFrames,
    dir,
    blackbox: getBlackboxStatus(dir),
  };
}

function getBlackboxStatus(dir: string): BlackboxStatus {
  return {
    enabled: captureEnabled,
    active: Boolean(blackboxStream),
    path: blackboxPath,
    frames: blackboxFrames,
    dir,
    schema: "sim-blackbox.v1",
  };
}

function createUniquePfdrecPath(dir: string, base: string): string {
  for (let i = 0; i < 1000; i++) {
    const suffix = i === 0 ? "" : `_${String(i).padStart(3, "0")}`;
    const p = path.join(dir, `${base}${suffix}.pfdrec`);
    if (!fs.existsSync(p)) return p;
  }
  throw new Error("Cannot allocate unique capture file name");
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

function closeCapture(): void {
  if (!captureStream) return;
  captureStream.end();
  captureStream = undefined;
}

function closeBlackbox(): void {
  if (!blackboxStream) return;
  blackboxStream.end();
  blackboxStream = undefined;
}

export function startCapture(captureDir: string, source = "unknown", duration = "capture"): CaptureStatus {
  if (captureStream) return getCaptureStatus(captureDir);
  fs.mkdirSync(captureDir, { recursive: true });
  capturePath = createCapturePath(captureDir, source, duration);
  captureFrames = 0;
  captureStream = fs.createWriteStream(capturePath, { flags: "wx", encoding: "utf8" });
  captureEnabled = true;
  console.log(`[CAPTURE] started ${capturePath}`);
  return getCaptureStatus(captureDir);
}

export function stopCapture(): { stopped: boolean; status: any } {
  captureEnabled = false;
  const p = capturePath; const n = captureFrames;
  const bp = blackboxPath; const bn = blackboxFrames;
  closeCapture();
  closeBlackbox();
  console.log(`[CAPTURE] stopped ${p ?? "n/a"} frames=${n}`);
  return {
    stopped: true,
    status: {
      ...getCaptureStatus(""),
      stoppedPath: p,
      stoppedFrames: n,
      stoppedBlackboxPath: bp,
      stoppedBlackboxFrames: bn,
    },
  };
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

export function writeSimulatorBlackboxFrame(frame: any, captureDir: string): void {
  if (!captureEnabled) return;
  ensureBlackboxStream(captureDir);
  blackboxStream?.write(`${JSON.stringify(frame)}\n`);
  blackboxFrames += 1;
}

export function writeCaptureFrame(frame: MinimalTelemetryFrame | TelemetryFrameForWrite, captureDir: string): void {
  if (!captureEnabled) return;
  if (!captureStream) startCapture(captureDir);
  captureStream?.write(`${JSON.stringify(frame)}\n`);
  captureFrames += 1;
}

export function getStatus(dir: string) {
  return getCaptureStatus(dir);
}

export { createCapturePath, createBlackboxPath, createUniquePfdrecPath };

// Re-export types for convenience (avoid duplicate name issues)
export type { CaptureStatus as CaptureManagerStatus, BlackboxStatus as BlackboxManagerStatus };

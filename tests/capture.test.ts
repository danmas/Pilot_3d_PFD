import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  startCapture,
  stopCapture,
  writeCaptureFrame,
  writeSimulatorBlackboxFrame,
  getStatus,
  resetCaptureStateForTests,
  type CaptureStatus,
} from '../bridge/capture';

describe('bridge/capture.ts - CaptureManager (roundtrip)', () => {
  let tempDir: string;
  let testCaptureDir: string;

  beforeEach(() => {
    // Use a unique temp dir for each test run to avoid collisions
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pfd-capture-test-'));
    testCaptureDir = path.join(tempDir, 'captures');
  });

  afterEach(() => {
    // Ensure manager state is fully reset between tests (singleton state)
    try { stopCapture(); } catch {}
    resetCaptureStateForTests();

    // Cleanup: remove the entire temp tree
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('startCapture creates a .pfdrec file and updates status', () => {
    const status = startCapture(testCaptureDir, 'unit-test', 'roundtrip');

    expect(status.enabled).toBe(true);
    expect(status.active).toBe(true);
    expect(status.path).toBeDefined();
    expect(status.path).toMatch(/\.pfdrec$/);
    expect(status.frames).toBe(0);
    expect(status.dir).toBe(testCaptureDir);

    // Write a frame, then stop (this flushes the stream)
    writeCaptureFrame({ schema: 'telemetry-frame.v1', seq: 0, timeMs: 0 } as any, testCaptureDir);
    const stopped = stopCapture();

    // After stop the file should exist
    expect(fs.existsSync(stopped.status.stoppedPath!)).toBe(true);
  });

  it('writeCaptureFrame appends JSONL and increments frame count', () => {
    startCapture(testCaptureDir, 'unit-test', 'write-test');

    const frame1 = {
      schema: 'telemetry-frame.v1',
      seq: 1,
      timeMs: 0,
      receivedAt: new Date().toISOString(),
      source: 'test',
      PitchAngle: 1.23,
    };
    const frame2 = { ...frame1, seq: 2, PitchAngle: 4.56 };

    writeCaptureFrame(frame1 as any, testCaptureDir);
    writeCaptureFrame(frame2 as any, testCaptureDir);

    const status = getStatus(testCaptureDir);
    expect(status.frames).toBe(2);
    expect(status.active).toBe(true);

    const stopped = stopCapture();

    // Verify file contents after stop (stream flushed)
    const fileContent = fs.readFileSync(stopped.status.stoppedPath!, 'utf8');
    const lines = fileContent.trim().split('\n');
    expect(lines.length).toBe(2);

    const parsed1 = JSON.parse(lines[0]);
    expect(parsed1.seq).toBe(1);
    expect(parsed1.PitchAngle).toBe(1.23);
  });

  it('writeSimulatorBlackboxFrame works alongside telemetry capture', () => {
    startCapture(testCaptureDir, 'unit-test', 'blackbox-test');

    const dummyTelemetry = { PitchAngle: 5, seq: 10 } as any;
    const blackboxFrame = {
      schema: 'sim-blackbox.v1',
      seq: 1,
      timeMs: 100,
      dt: 0.04,
      receivedAt: new Date().toISOString(),
      source: 'test',
      initialConfig: { altitudeFt: 1000, casKt: 100, throttle: 0.5, pitchDeg: 2 },
      pilot: { source: 'test' },
      controls: { roll: 0, pitch: 0, rudder: 0, throttle: 0.5 },
      state: { pitchDeg: 5, rollDeg: 0, casKt: 100 },
      physics: { cl: 0.5, liftN: 10000 } as any,
      telemetry: dummyTelemetry,
    };

    writeSimulatorBlackboxFrame(blackboxFrame, testCaptureDir);

    const status = getStatus(testCaptureDir);
    expect(status.blackbox.frames).toBe(1);
    expect(status.blackbox.active).toBe(true);
    expect(status.blackbox.path).toMatch(/_sim_blackbox/);

    const stopped = stopCapture();

    // Verify blackbox file after stop
    const bbContent = fs.readFileSync(stopped.status.stoppedBlackboxPath!, 'utf8');
    expect(bbContent).toContain('sim-blackbox.v1');
    expect(bbContent).toContain('"cl":0.5');
  });

  it('stopCapture returns stopped info and disables writing', () => {
    startCapture(testCaptureDir, 'unit-test', 'stop-test');
    writeCaptureFrame({ schema: 'telemetry-frame.v1', seq: 1, timeMs: 0 } as any, testCaptureDir);

    const result = stopCapture();
    expect(result.stopped).toBe(true);
    expect(result.status.stoppedFrames).toBe(1); // exactly the one we wrote in this test


    const afterStop = getStatus(testCaptureDir);
    expect(afterStop.active).toBe(false);
    expect(afterStop.enabled).toBe(false);

    // Further writes should be no-op (no crash, no new frames)
    writeCaptureFrame({ schema: 'telemetry-frame.v1', seq: 99, timeMs: 999 } as any, testCaptureDir);
    const finalStatus = getStatus(testCaptureDir);
    expect(finalStatus.frames).toBe(1); // unchanged
  });

  it('roundtrip with real-like data + cleanup works end-to-end', () => {
    // Simulate a short capture session
    const startStatus = startCapture(testCaptureDir, 'e2e-test', 'full-roundtrip');

    const frames: any[] = [];
    for (let i = 0; i < 5; i++) {
      const f = {
        schema: 'telemetry-frame.v1',
        seq: i + 1,
        timeMs: i * 40,
        receivedAt: new Date().toISOString(),
        source: 'e2e',
        PitchAngle: i * 0.5,
        RollAngle: i * -0.3,
      };
      frames.push(f);
      writeCaptureFrame(f, testCaptureDir);
    }

    const stopResult = stopCapture();

    // Read back the file (after stop it should be flushed and closed)
    expect(stopResult.status.stoppedPath).toBeDefined();
    const content = fs.readFileSync(stopResult.status.stoppedPath!, 'utf8').trim();
    const writtenFrames = content.split('\n').map(line => JSON.parse(line));

    expect(writtenFrames.length).toBe(5);
    expect(writtenFrames[0].PitchAngle).toBe(0);
    expect(writtenFrames[4].PitchAngle).toBe(2);

    // File should exist until we clean (afterEach will handle)
    expect(fs.existsSync(stopResult.status.stoppedPath!)).toBe(true);
  });
});

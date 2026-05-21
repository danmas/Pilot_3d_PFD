import { TelemetryFrame } from './types';

// Static frame for initial state (flat canonical keys from field-catalog.ts)
export const sampleFrame: TelemetryFrame = {
  "schema": "telemetry-frame.v1",
  "seq": 207132,
  "timeMs": 0,
  "replayTimeMs": 0,
  "receivedAt": "2026-05-18T08:07:17.214Z",
  "source": "tnparser-udp-14443",
  "PitchAngle": 4.286693572998047,
  "RollAngle": 0.17028671503067017,
  "MagneticHeading": -138.70814514160156,
  "CAS": 207.8125,
  "AoA": 4.6,
  "dec_RadioAltFt": 5120,
  "dec_BaroAltFt": 12000,
  "BaroAltitude": 12000,
  "Vy": -53,
  "NormalG": -0.00650033401325345,
  "dec_G": null,
  "DME_Distance": 49.296875,
  "HeadingSelect": null,
  "SpeedSelect": 200,
  "StandardAltitude": 20000,
  "VerticalSpeedSelect": null,
  "FlightDirectorOn": null,
  "FD_PitchCmd": null,
  "FD_RollCmd": null,
};

// Generate an animation sequence (flat frame, varying core PFD values)
export const sampleFrames: TelemetryFrame[] = Array.from({ length: 300 }).map((_, i) => {
  const t = (i / 300) * Math.PI * 2;
  return {
    ...sampleFrame,
    seq: sampleFrame.seq + i,
    timeMs: i * 33,
    replayTimeMs: i * 33,
    PitchAngle: 4.28 + Math.sin(t) * 10,
    RollAngle: Math.sin(t * 2) * 30,
    CAS: 207 + Math.sin(t) * 20,
    AoA: 4.6 + Math.cos(t) * 2,
    dec_BaroAltFt: 12000 + Math.sin(t) * 500,
    Vy: Math.cos(t) * 3000,
    dec_RadioAltFt: 5120 + Math.sin(t) * 500,
  };
});

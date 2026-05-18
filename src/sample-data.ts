import { PFDFrame } from './types';

// Original static frame
export const sampleFrame: PFDFrame = {
  "schema": "pfd-frame.v1",
  "seq": 207132,
  "timeMs": 0,
  "replayTimeMs": 0,
  "receivedAt": "2026-05-18T08:07:17.214Z",
  "source": "tnparser-udp-14444",
  "attitude": {
    "pitchDeg": 4.286693572998047,
    "rollDeg": 0.17028671503067017,
    "headingDeg": -138.70814514160156,
    "valid": true
  },
  "air": {
    "cas": 207.8125,
    "aoaDeg": 4.6,
    "valid": true
  },
  "altitude": {
    "radioAlt": 5120,
    "baroAltFt": 12000,
    "baroAltM": 3658,
    "verticalSpeed": -53,
    "valid": true
  },
  "loads": {
    "ny": -0.00650033401325345,
    "g": null
  },
  "nav": {
    "dmeDistance": 49.296875,
    "selectedHeadingDeg": null
  },
  "autopilot": {
    "selectedSpeed": 200,
    "selectedAltitudeFt": 20000,
    "selectedVerticalSpeed": null,
    "fdActive": null,
    "fdPitchCmdDeg": null,
    "fdRollCmdDeg": null
  }
};

// Generate an animation sequence
export const sampleFrames: PFDFrame[] = Array.from({ length: 300 }).map((_, i) => {
  const t = i / 300 * Math.PI * 2; // 0 to 2PI
  return {
    ...sampleFrame,
    seq: sampleFrame.seq + i,
    timeMs: i * 33, // ~30fps
    replayTimeMs: i * 33,
    attitude: {
      ...sampleFrame.attitude,
      pitchDeg: 4.28 + Math.sin(t) * 10,
      rollDeg: Math.sin(t * 2) * 30, // Roll back and forth
    },
    air: {
      ...sampleFrame.air,
      cas: 207 + Math.sin(t) * 20, // Speed changes
      aoaDeg: 4.6 + Math.cos(t) * 2,
    },
    altitude: {
      ...sampleFrame.altitude,
      baroAltFt: 12000 + Math.sin(t) * 500, // Altitude changes
      verticalSpeed: Math.cos(t) * 3000, // VS up and down
      radioAlt: 5120 + Math.sin(t) * 500,
    }
  };
});


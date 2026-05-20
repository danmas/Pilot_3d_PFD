export interface PFDFrame {
  schema: string;
  seq: number;
  timeMs: number;
  replayTimeMs: number | null;
  receivedAt: string;
  source: string;
  attitude: {
    pitchDeg: number | null;
    rollDeg: number | null;
    headingDeg: number | null;
    valid: boolean;
  };
  air: {
    cas: number | null;
    aoaDeg: number | null;
    valid: boolean;
  };
  altitude: {
    radioAlt: number | null;
    baroAltFt: number | null;
    baroAltM: number | null;
    verticalSpeed: number | null;
    valid: boolean;
  };
  loads: {
    ny: number | null;
    g: number | null;
  };
  nav: {
    dmeDistance: number | null;
    selectedHeadingDeg: number | null;
  };
  autopilot: {
    selectedSpeed: number | null;
    selectedAltitudeFt: number | null;
    selectedVerticalSpeed: number | null;
    fdActive: boolean | null;
    fdPitchCmdDeg: number | null;
    fdRollCmdDeg: number | null;
  };
  engine?: {
    n1: number | null;
    n2: number | null;
    fuelFlow: number | null;
    egt: number | null;
    oilPress: number | null;
    oilTemp: number | null;
    vibration: number | null;
  };
  surfaces?: {
    flapL: number | null;
    flapR: number | null;
    slatL: number | null;
    slatR: number | null;
    phiST: number | null;
    deltaPB: number | null;
    deltaEPL: number | null;
    deltaEPR: number | null;
  };
  quality?: any;
  raw?: any;
}

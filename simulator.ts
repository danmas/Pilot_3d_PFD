import { FIELD_CATALOG } from "./field-catalog";

export interface SimulatorControls {
  roll: number;      // -1 (left) to +1 (right)
  pitch: number;     // -1 (down/nose down) to +1 (up/nose up)
  rudder: number;    // -1 (left) to +1 (right)
  throttle: number;  // 0 to 1
}

export interface SimulatorInitialConfig {
  altitudeFt: number;
  casKt: number;
  throttle: number;
  pitchDeg: number;
}

export const DEFAULT_SIMULATOR_INITIAL_CONFIG: SimulatorInitialConfig = {
  altitudeFt: 10_000,
  casKt: 250,
  throttle: 0.6,
  pitchDeg: 3.0,
};

/**
 * Simplified flight dynamics model designed for PFD instrument visualization.
 *
 * The model is intentionally simplified to produce stable, visually correct
 * behaviour on the PFD displays rather than true aerodynamic fidelity.
 *
 * Key design decisions:
 *  - Trim state: at reset conditions (CAS 250 kt, alt 10000 ft, throttle 0.6)
 *    the aircraft is in trimmed level flight with vy=0, normalG≈1.
 *  - Pitch stability: inherent pitch damping brings the aircraft back to its
 *    trimmed AoA when controls are released.
 *  - Speed stability: thrust is balanced against drag at trim so the speed
 *    converges back when controls are neutral.
 */
export class FlightSimulator {
  // ── flight state ─────────────────────────────────────────────────
  public pitch = DEFAULT_SIMULATOR_INITIAL_CONFIG.pitchDeg; // degrees (trim pitch)
  public roll = 0.0;         // degrees
  public heading = 0.0;      // degrees (-180 … +180)
  public altitude = DEFAULT_SIMULATOR_INITIAL_CONFIG.altitudeFt * 0.3048; // meters
  public vy = 0.0;           // m/s  (vertical speed)
  public cas = DEFAULT_SIMULATOR_INITIAL_CONFIG.casKt; // knots
  public throttle = DEFAULT_SIMULATOR_INITIAL_CONFIG.throttle; // 0 … 1
  public n1 = 68.0;          // % N1  (trim N1)
  public normalG = 1.0;      // Normal load factor

  // ── controls ─────────────────────────────────────────────────────
  public controls: SimulatorControls = {
    roll: 0,
    pitch: 0,
    rudder: 0,
    throttle: DEFAULT_SIMULATOR_INITIAL_CONFIG.throttle,
  };

  private seq = 0;

  // ── aircraft constants ───────────────────────────────────────────
  private readonly MASS = 60_000;      // kg
  private readonly G    = 9.81;        // m/s²
  private readonly S    = 122;         // wing area m²
  private readonly MAX_THRUST = 220_000; // N  (total, both engines)
  private readonly RHO0 = 1.225;       // sea-level air density  kg/m³

  // ── trim constants (computed once to keep the model stable) ──────
  // At trim: Lift = Weight, Thrust = Drag.
  // trimCl ≈ W / (0.5 * rho * V² * S)  at 5000 ft, 250 kt
  private readonly TRIM_CL = 0.465;    // lift coefficient at trim
  private readonly CL_ALPHA = 5.5;     // per radian
  private readonly CD0 = 0.022;        // zero-lift drag coeff
  private readonly K   = 0.045;        // induced drag factor  Cd = Cd0 + K*Cl²

  // ── rate limits ──────────────────────────────────────────────────
  private readonly MAX_PITCH_RATE = 6;  // deg/s at full stick
  private readonly MAX_ROLL_RATE  = 25; // deg/s at full stick
  private readonly MAX_YAW_RATE   = 8;  // deg/s from rudder

  // ── pitch damping (natural weathercock / SAS) ────────────────────
  private readonly PITCH_DAMPING = 1.8; // 1/s  (how fast pitch rate damps)

  // ── internal state ───────────────────────────────────────────────
  private pitchRate = 0;  // deg/s (smoothed)
  private initialConfig = { ...DEFAULT_SIMULATOR_INITIAL_CONFIG };

  // ================================================================
  public getInitialConfig(): SimulatorInitialConfig {
    return { ...this.initialConfig };
  }

  public setInitialConfig(config: Partial<SimulatorInitialConfig>): SimulatorInitialConfig {
    if (config.altitudeFt !== undefined) {
      this.initialConfig.altitudeFt = clamp(config.altitudeFt, 0, 60_000);
    }
    if (config.casKt !== undefined) {
      this.initialConfig.casKt = clamp(config.casKt, 60, 500);
    }
    if (config.throttle !== undefined) {
      this.initialConfig.throttle = clamp(config.throttle, 0, 1);
    }
    if (config.pitchDeg !== undefined) {
      this.initialConfig.pitchDeg = clamp(config.pitchDeg, -10, 15);
    }

    return this.getInitialConfig();
  }

  public reset(config?: Partial<SimulatorInitialConfig>): void {
    const initial = config ? this.setInitialConfig(config) : this.initialConfig;
    const initialThrottle = clamp(initial.throttle, 0, 1);

    this.pitch      = initial.pitchDeg;
    this.roll       = 0.0;
    this.heading    = 0.0;
    this.altitude   = initial.altitudeFt * 0.3048;
    this.vy         = 0.0;
    this.cas        = initial.casKt;
    this.throttle   = initialThrottle;
    this.n1         = 20 + initialThrottle * 80;
    this.normalG    = 1.0;
    this.pitchRate  = 0;
    this.controls   = { roll: 0, pitch: 0, rudder: 0, throttle: initialThrottle };
    this.seq        = 0;
  }

  public setControls(ctrl: Partial<SimulatorControls>): void {
    if (ctrl.roll    !== undefined) this.controls.roll    = clamp(ctrl.roll, -1, 1);
    if (ctrl.pitch   !== undefined) this.controls.pitch   = clamp(ctrl.pitch, -1, 1);
    if (ctrl.rudder  !== undefined) this.controls.rudder  = clamp(ctrl.rudder, -1, 1);
    if (ctrl.throttle !== undefined) {
      this.controls.throttle = clamp(ctrl.throttle, 0, 1);
      this.throttle = this.controls.throttle;
    }
  }

  // ================================================================
  public step(dt: number): Record<string, number | null> {
    this.seq += 1;

    // ── 1. Engine spool ──────────────────────────────────────────
    const targetN1 = 20 + this.throttle * 80;          // 20 … 100 %
    this.n1 += (targetN1 - this.n1) * clamp(dt * 2.5, 0, 1); // ~0.4 s spool
    this.n1 = clamp(this.n1, 20, 100);

    // ── 2. Atmosphere ────────────────────────────────────────────
    const h   = Math.max(0, this.altitude);
    const rho = this.RHO0 * Math.pow(Math.max(0.1, 1 - 2.25577e-5 * h), 4.2559);

    // ── 3. Airspeed ──────────────────────────────────────────────
    let tasMs = this.cas * 0.51444;             // CAS (kt) → TAS (m/s) simplified
    tasMs = Math.max(20, tasMs);                // stall floor

    // ── 4. Forces ────────────────────────────────────────────────
    const qS = 0.5 * rho * tasMs * tasMs * this.S;

    // Angle of attack from pitch + flight path
    const gamma = Math.atan2(this.vy, tasMs);   // flight-path angle (rad)
    const alphaRad = (this.pitch * Math.PI / 180) - gamma;
    const alphaDeg = alphaRad * 180 / Math.PI;

    // Cl with linear α; clamp to avoid nonsense at extreme α
    let Cl = this.TRIM_CL + this.CL_ALPHA * (alphaRad - this.TRIM_CL / this.CL_ALPHA);
    Cl = clamp(Cl, -0.5, 2.0);

    const Cd = this.CD0 + this.K * Cl * Cl;

    const lift  = qS * Cl;
    const drag  = qS * Cd;
    const thrust = (this.n1 / 100) * this.MAX_THRUST;

    // ── 5. Longitudinal dynamics (speed) ─────────────────────────
    const pitchRad = this.pitch * Math.PI / 180;
    const ax = (thrust - drag) / this.MASS - this.G * Math.sin(pitchRad);
    tasMs += ax * dt;
    tasMs = Math.max(20, tasMs);

    // CAS back-calculation  (simplified: CAS ≈ TAS * sqrt(rho/rho0))
    this.cas = (tasMs / 0.51444) * Math.sqrt(clamp(rho / this.RHO0, 0.3, 1.2));
    this.cas = clamp(this.cas, 60, 500);

    // ── 6. Normal dynamics (vertical speed) ──────────────────────
    const rollRad = this.roll * Math.PI / 180;
    const nz = (lift * Math.cos(rollRad)) / (this.MASS * this.G);  // load factor

    // Vertical accel: (nz - 1) * g  in Earth frame, simplified
    const verticalAccel = (nz - 1.0) * this.G - this.vy * 0.08;   // light damping
    this.vy += verticalAccel * dt;
    this.vy = clamp(this.vy, -80, 80);        // ~15 000 ft/min max

    this.normalG = clamp(nz, -1, 4);

    // ── 7. Altitude ──────────────────────────────────────────────
    this.altitude += this.vy * dt;
    if (this.altitude < 0) {
      this.altitude = 0;
      this.vy = Math.max(0, this.vy);
      this.pitch = Math.max(0, this.pitch);
      this.roll *= 0.9;
      this.normalG = 1.0;
    }

    // ── 8. Attitude rates ────────────────────────────────────────
    // Pitch: stick commands pitch rate, with damping towards 0
    const cmdPitchRate = this.controls.pitch * this.MAX_PITCH_RATE;
    this.pitchRate += (cmdPitchRate - this.pitchRate) * clamp(dt * 8, 0, 1);
    this.pitch += this.pitchRate * dt;
    this.pitch = clamp(this.pitch, -30, 30);

    // Roll: stick commands roll rate; slight auto-centering when released
    const cmdRollRate = this.controls.roll * this.MAX_ROLL_RATE;
    const rollDamping = Math.abs(this.controls.roll) < 0.05 ? -this.roll * 0.8 : 0;
    this.roll += (cmdRollRate + rollDamping) * dt;
    this.roll = clamp(this.roll, -60, 60);

    // Heading: rudder + coordinated turn
    let coordRate = 0;
    if (Math.abs(this.roll) > 0.5 && tasMs > 20) {
      coordRate = (this.G / tasMs) * Math.tan(rollRad) * (180 / Math.PI);
      coordRate = clamp(coordRate, -10, 10);
    }
    const yawRate = this.controls.rudder * this.MAX_YAW_RATE + coordRate;
    this.heading += yawRate * dt;
    if (this.heading >  180) this.heading -= 360;
    if (this.heading < -180) this.heading += 360;

    // ── 9. Build telemetry frame ─────────────────────────────────
    const payload: Record<string, number | null> = {};
    for (const f of FIELD_CATALOG) payload[f.key] = null;

    payload.RadioAltitude       = this.altitude * 3.28084;  // → feet
    payload.BaroAltitude        = this.altitude * 3.28084;
    payload.PitchAngle          = this.pitch;
    payload.RollAngle           = this.roll;
    payload.MagneticHeading     = this.heading;
    payload.CAS                 = this.cas;
    payload.Vy                  = this.vy * 1000;           // → mm/s
    payload.NormalG             = this.normalG;
    payload.Time                = Date.now();

    // Control surfaces / inputs
    payload.FCU_Roll_Left       = this.controls.roll;
    payload.FCU_Pitch_Left      = this.controls.pitch;
    payload.FCU_Roll_Right      = this.controls.roll;
    payload.FCU_Pitch_Right     = this.controls.pitch;
    payload.Engine_N1_Left      = this.n1;
    payload.Engine_N1_Right     = this.n1;
    payload.Engine_N1_Target_Left  = this.throttle * 100;
    payload.Engine_N1_Target_Right = this.throttle * 100;

    // Computed / dec_ fields that PFD instruments may read
    payload.AoA                 = alphaDeg;

    return payload;
  }
}

// ── helpers ──────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

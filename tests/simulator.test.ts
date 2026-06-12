import { describe, it, expect, beforeEach } from 'vitest';
import {
  FlightSimulator,
  DEFAULT_SIMULATOR_INITIAL_CONFIG,
  type SimulatorControls,
} from '../simulator';

describe('simulator.ts - FlightSimulator', () => {
  let sim: FlightSimulator;

  beforeEach(() => {
    sim = new FlightSimulator();
    // Ensure clean starting state
    sim.reset();
  });

  it('initializes / resets to default cruise-like conditions', () => {
    const initial = sim.step(0); // get a telemetry payload (step also builds it)
    expect(initial.BaroAltitude).toBeCloseTo(DEFAULT_SIMULATOR_INITIAL_CONFIG.altitudeFt);
    expect(initial.CAS).toBeCloseTo(DEFAULT_SIMULATOR_INITIAL_CONFIG.casKt, 0);
    // throttle is applied via controls
    expect(sim.getInitialConfig().throttle).toBeCloseTo(DEFAULT_SIMULATOR_INITIAL_CONFIG.throttle);
  });

  it('step(dt) advances seq and produces telemetry payload', () => {
    const p1 = sim.step(0.04);
    const p2 = sim.step(0.04);

    expect(p2).not.toBe(p1); // new object each time (current impl)
    // The step method returns the telemetry frame directly
    expect(typeof p2.PitchAngle).toBe('number');
    expect(typeof p2.RollAngle).toBe('number');
    expect(typeof p2.CAS).toBe('number');
  });

  it('setControls affects attitude over multiple steps', () => {
    const controls: SimulatorControls = { roll: 0.6, pitch: 0.4, rudder: 0, throttle: 0.6 };
    sim.setControls(controls);

    const p0 = sim.step(0.04);
    const initialPitch = p0.PitchAngle as number;
    const initialRoll = p0.RollAngle as number;

    // Run a number of steps with sustained input
    let last: Record<string, number | null> = p0;
    for (let i = 0; i < 30; i++) {
      last = sim.step(0.04);
    }

    expect(last.PitchAngle as number).toBeGreaterThan(initialPitch + 1);
    expect(last.RollAngle as number).toBeGreaterThan(initialRoll + 5);
  });

  it('reset(config) restores the requested initial state', () => {
    sim.setControls({ roll: 0.8, pitch: 0.7, rudder: 0, throttle: 1 });
    for (let i = 0; i < 40; i++) sim.step(0.04);

    const newInitial = { altitudeFt: 3000, casKt: 160, throttle: 0.5, pitchDeg: 4 };
    sim.reset(newInitial);

    const after = sim.step(0.04);
    expect(after.BaroAltitude).toBeCloseTo(newInitial.altitudeFt, 0);
    expect(after.CAS).toBeCloseTo(newInitial.casKt, 0);
  });

  it('buildBlackboxFrame produces a well-formed blackbox snapshot', () => {
    const tel = sim.step(0.04);
    const bb = sim.buildBlackboxFrame(Date.now(), Date.now(), tel, { source: 'test' });

    expect(bb.schema).toBe('sim-blackbox.v1');
    expect(bb.state).toHaveProperty('pitchDeg');
    expect(bb.state).toHaveProperty('casKt');
    expect(bb.physics).toHaveProperty('cl');
    expect(bb.physics).toHaveProperty('liftN');
    expect(bb.controls).toHaveProperty('pitch');
    expect(bb.telemetry).toHaveProperty('PitchAngle');
  });

  it('getInitialConfig / setInitialConfig work and affect reset', () => {
    const cfg = sim.setInitialConfig({ altitudeFt: 25000, casKt: 280 });
    expect(cfg.altitudeFt).toBe(25000);
    expect(cfg.casKt).toBe(280);

    sim.reset();
    const tel = sim.step(0);
    expect(tel.BaroAltitude).toBeCloseTo(25000);
  });
});

import { describe, expect, it } from 'vitest';
import { aiFlagsToRaceInput } from './aiInputAdapter';
import {
  applyRadialDeadZone,
  buildRaceInputFromIntent,
  controlsFromNudgeVector,
  createReverseLatchState,
  getNudgeActionLabel,
  resolveBrakeAndReverse,
  vectorFromTouch,
  vectorMagnitude,
  computePadGeometry,
  BRAKE_REVERSE,
  NUDGE_DEAD_ZONE,
} from './nudgePadLogic';
import { ZERO_DRIVE_INTENT } from './raceInput';
import { buildKeyboardIntent, mergeDriveIntents } from './touchControlsLogic';

describe('nudgePadLogic vector mapping', () => {
  const geo = computePadGeometry(176, 188);

  it('centre produces zero controls', () => {
    const controls = controlsFromNudgeVector(vectorFromTouch(geo.cx, geo.cy, geo));
    expect(controls.steer).toBe(0);
    expect(controls.throttle).toBe(0);
    expect(controls.upwardDemand).toBe(0);
  });

  it('down produces forward throttle', () => {
    const vector = vectorFromTouch(geo.cx, geo.cy + geo.radius * 0.9, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.throttle).toBeGreaterThan(0.5);
    expect(controls.upwardDemand).toBe(0);
  });

  it('down-left produces throttle and negative steering', () => {
    const vector = vectorFromTouch(geo.cx - geo.radius * 0.6, geo.cy + geo.radius * 0.6, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.throttle).toBeGreaterThan(0);
    expect(controls.steer).toBeLessThan(0);
  });

  it('down-right produces throttle and positive steering', () => {
    const vector = vectorFromTouch(geo.cx + geo.radius * 0.6, geo.cy + geo.radius * 0.6, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.throttle).toBeGreaterThan(0);
    expect(controls.steer).toBeGreaterThan(0);
  });

  it('up produces upward demand', () => {
    const vector = vectorFromTouch(geo.cx, geo.cy - geo.radius * 0.9, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.upwardDemand).toBeGreaterThan(0.5);
    expect(controls.throttle).toBe(0);
  });

  it('left produces steering without throttle', () => {
    const vector = vectorFromTouch(geo.cx - geo.radius * 0.9, geo.cy, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.steer).toBeLessThan(-0.3);
    expect(controls.throttle).toBe(0);
    expect(controls.upwardDemand).toBe(0);
  });

  it('right produces steering without throttle', () => {
    const vector = vectorFromTouch(geo.cx + geo.radius * 0.9, geo.cy, geo);
    const controls = controlsFromNudgeVector(vector);
    expect(controls.steer).toBeGreaterThan(0.3);
    expect(controls.throttle).toBe(0);
  });

  it('clamps vector to unit radius', () => {
    const vector = vectorFromTouch(geo.cx + geo.radius * 3, geo.cy, geo);
    expect(vectorMagnitude(vector)).toBeCloseTo(1, 5);
  });

  it('dead-zone values produce zero controls', () => {
    const tiny = { x: 0.02, y: 0.03 };
    const dead = applyRadialDeadZone(tiny, NUDGE_DEAD_ZONE);
    expect(dead.x).toBe(0);
    expect(dead.y).toBe(0);
    const controls = controlsFromNudgeVector(tiny);
    expect(controls.steer).toBe(0);
    expect(controls.throttle).toBe(0);
  });
});

describe('nudgePadLogic brake and reverse', () => {
  it('upward input at forward speed produces brake, not reverse', () => {
    const latch = createReverseLatchState();
    const result = resolveBrakeAndReverse(1, 80, latch);
    expect(result.brake).toBe(1);
    expect(result.reverse).toBe(0);
  });

  it('upward input near zero speed produces reverse', () => {
    const latch = createReverseLatchState();
    const result = resolveBrakeAndReverse(1, 5, latch);
    expect(result.reverse).toBe(1);
    expect(result.brake).toBe(0);
  });

  it('upward input while already reversing continues reverse', () => {
    const latch = createReverseLatchState();
    const result = resolveBrakeAndReverse(0.8, -30, latch);
    expect(result.reverse).toBe(0.8);
    expect(result.brake).toBe(0);
  });

  it('does not apply full brake and reverse simultaneously', () => {
    const latch = createReverseLatchState();
    const forward = resolveBrakeAndReverse(1, 100, latch);
    const reverse = resolveBrakeAndReverse(1, -20, latch);
    expect(forward.brake).toBeGreaterThan(0);
    expect(forward.reverse).toBe(0);
    expect(reverse.reverse).toBeGreaterThan(0);
    expect(reverse.brake).toBe(0);
  });

  it('hysteresis keeps braking between thresholds until slow enough', () => {
    let latch = createReverseLatchState();
    const mid = resolveBrakeAndReverse(1, 20, latch);
    expect(mid.brake).toBe(1);
    expect(mid.reverse).toBe(0);
    latch = mid.latch;
    const slow = resolveBrakeAndReverse(1, BRAKE_REVERSE.REVERSE_ENGAGE_THRESHOLD, latch);
    expect(slow.reverse).toBe(1);
  });
});

describe('nudgePadLogic input reset and labels', () => {
  it('zero intent produces zero race input', () => {
    const latch = createReverseLatchState();
    const built = buildRaceInputFromIntent(ZERO_DRIVE_INTENT, 0, latch);
    expect(built.input).toEqual({ steer: 0, throttle: 0, brake: 0, reverse: 0 });
  });

  it('centre shows COAST', () => {
    expect(getNudgeActionLabel(ZERO_DRIVE_INTENT, 0, createReverseLatchState())).toBe('COAST');
  });

  it('forward input shows strength label', () => {
    const intent = { steer: 0, throttle: 0.9, upwardDemand: 0 };
    expect(getNudgeActionLabel(intent, 0, createReverseLatchState())).toBe('MAX');
  });

  it('upward input at forward speed shows BRAKE', () => {
    const intent = { steer: 0, throttle: 0, upwardDemand: 1 };
    expect(getNudgeActionLabel(intent, 60, createReverseLatchState())).toBe('BRAKE');
  });

  it('upward input near zero shows REVERSE', () => {
    const intent = { steer: 0, throttle: 0, upwardDemand: 1 };
    expect(getNudgeActionLabel(intent, 0, createReverseLatchState())).toBe('REVERSE');
  });

  it('does not show MAX when only steering horizontally', () => {
    const intent = { steer: 1, throttle: 0, upwardDemand: 0 };
    expect(getNudgeActionLabel(intent, 40, createReverseLatchState())).toBe('COAST');
  });
});

describe('touchControlsLogic keyboard fallback', () => {
  it('W/Up produces forward throttle', () => {
    const intent = buildKeyboardIntent({ forward: true, backward: false, left: false, right: false });
    expect(intent.throttle).toBe(1);
    expect(intent.upwardDemand).toBe(0);
  });

  it('S/Down produces upward demand', () => {
    const intent = buildKeyboardIntent({ forward: false, backward: true, left: false, right: false });
    expect(intent.upwardDemand).toBe(1);
    expect(intent.throttle).toBe(0);
  });

  it('A/Left steers left', () => {
    const intent = buildKeyboardIntent({ forward: false, backward: false, left: true, right: false });
    expect(intent.steer).toBe(-1);
  });

  it('D/Right steers right', () => {
    const intent = buildKeyboardIntent({ forward: false, backward: false, left: false, right: true });
    expect(intent.steer).toBe(1);
  });

  it('merged intents do not create invalid values', () => {
    const pad = { steer: -0.5, throttle: 0.4, upwardDemand: 0 };
    const keys = buildKeyboardIntent({ forward: true, backward: false, left: false, right: false });
    const merged = mergeDriveIntents(pad, keys);
    expect(merged.throttle).toBe(1);
    expect(merged.steer).toBe(-0.5);
    expect(merged.upwardDemand).toBe(0);
  });
});

describe('aiInputAdapter', () => {
  it('maps AI flags to race input with auto throttle', () => {
    expect(aiFlagsToRaceInput(false, false, false)).toEqual({
      steer: 0,
      throttle: 1,
      brake: 0,
      reverse: 0,
    });
  });

  it('maps AI braking without reverse', () => {
    expect(aiFlagsToRaceInput(true, false, true)).toEqual({
      steer: -1,
      throttle: 0,
      brake: 1,
      reverse: 0,
    });
  });
});

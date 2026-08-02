import { describe, expect, it } from 'vitest';
import {
  applyBarrierHitSpeed,
  computeWallSlideVelocity,
  steeringSpeedFactor,
} from './drivingPhysics';

describe('drivingPhysics', () => {
  it('gives stronger low-speed steering than linear factor', () => {
    const linear = 0.15 + 0.85 * 0.25;
    const curved = steeringSpeedFactor(85, 340, 0.15);
    expect(curved).toBeGreaterThan(linear);
  });

  it('retains scrape speed on barrier hit', () => {
    const speed = applyBarrierHitSpeed({
      speed: 200,
      throttle: 1,
      speedRetain: 0.75,
      scrapeMinSpeed: 55,
      throttleFloor: 95,
    });
    expect(speed).toBeGreaterThanOrEqual(95 + 55 * 0.45);
    expect(speed).toBeLessThan(200);
  });

  it('never zeroes speed on light barrier tap', () => {
    const speed = applyBarrierHitSpeed({
      speed: 15,
      throttle: 0,
      speedRetain: 0.75,
      scrapeMinSpeed: 55,
      throttleFloor: 95,
    });
    expect(speed).toBe(55);
  });

  it('keeps throttle scrape floor when pushing into wall', () => {
    const speed = applyBarrierHitSpeed({
      speed: 30,
      throttle: 0.8,
      speedRetain: 0.75,
      scrapeMinSpeed: 55,
      throttleFloor: 95,
    });
    expect(speed).toBeGreaterThanOrEqual(0.8 * 95 + 55 * 0.45);
  });

  it('biases velocity laterally when sliding along a wall', () => {
    const result = computeWallSlideVelocity({
      bodyVx: 10,
      bodyVy: 0,
      facingAngle: 0,
      targetSpeed: 120,
      lateralRetain: 0.55,
      forwardPush: 0.2,
    });
    expect(Math.hypot(result.vx, result.vy)).toBeGreaterThan(30);
  });
});

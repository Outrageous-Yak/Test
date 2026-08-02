import { describe, expect, it } from 'vitest';
import {
  computePadGeometry,
  movementDelta,
  speedForMagnitude,
  steerFromNudgeVector,
  vectorFromTouch,
  vectorMagnitude,
} from './nudgePadLogic';

describe('nudgePadLogic', () => {
  it('computes pad geometry from panel size', () => {
    const geo = computePadGeometry(160, 168);
    expect(geo.cx).toBe(80);
    expect(geo.radius).toBeGreaterThan(10);
    expect(geo.cy).toBeGreaterThan(geo.radius);
  });

  it('normalizes touch vector to unit circle', () => {
    const geo = computePadGeometry(160, 168);
    const far = vectorFromTouch(geo.cx + geo.radius * 2, geo.cy, geo);
    expect(far.x).toBeCloseTo(1, 5);
    expect(far.y).toBeCloseTo(0, 5);
  });

  it('maps magnitude to speed tiers', () => {
    expect(speedForMagnitude(0.05).label).toBe('STOP');
    expect(speedForMagnitude(0.2).label).toBe('FINE');
    expect(speedForMagnitude(0.9).label).toBe('MAX');
  });

  it('returns zero steer inside dead zone', () => {
    expect(steerFromNudgeVector({ x: 0.05, y: 0.02 })).toBe(0);
    expect(steerFromNudgeVector({ x: -0.5, y: 0.1 })).toBe(-0.5);
  });

  it('computes movement delta along vector direction', () => {
    const vector = { x: 1, y: 0 };
    const delta = movementDelta(vector, 20, 0.1);
    expect(delta.x).toBeCloseTo(20, 5);
    expect(delta.y).toBeCloseTo(0, 5);
  });

  it('returns zero movement delta when inactive', () => {
    const delta = movementDelta({ x: 0.5, y: 0.5 }, 0, 0.1);
    expect(delta.x).toBe(0);
    expect(delta.y).toBe(0);
    expect(vectorMagnitude({ x: 0.3, y: 0.4 })).toBeCloseTo(0.5, 5);
  });
});

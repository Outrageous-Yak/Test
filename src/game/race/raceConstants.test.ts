import { describe, it, expect } from 'vitest';
import { RACE_WORLD, DRIVING, CAMERA, BARRIER } from './raceConstants';

describe('raceConstants', () => {
  it('defines Mango Meadows world dimensions', () => {
    expect(RACE_WORLD.WIDTH).toBe(3200);
    expect(RACE_WORLD.HEIGHT).toBe(2400);
    expect(RACE_WORLD.ROAD_OUTER_A).toBeGreaterThan(RACE_WORLD.ROAD_INNER_A);
    expect(RACE_WORLD.ROAD_OUTER_B).toBeGreaterThan(RACE_WORLD.ROAD_INNER_B);
  });

  it('has sensible driving tuning values', () => {
    expect(DRIVING.MAX_SPEED).toBeGreaterThan(0);
    expect(DRIVING.MAX_REVERSE_SPEED).toBeGreaterThan(0);
    expect(DRIVING.MAX_REVERSE_SPEED).toBeLessThan(DRIVING.MAX_SPEED);
    expect(DRIVING.REVERSE_SPEED_RATIO).toBeGreaterThan(0.35);
    expect(DRIVING.REVERSE_SPEED_RATIO).toBeLessThan(0.5);
    expect(DRIVING.ACCELERATION).toBeGreaterThan(0);
    expect(DRIVING.BRAKE_FORCE).toBeGreaterThan(DRIVING.FRICTION);
    expect(DRIVING.TURN_RATE).toBeGreaterThan(0);
    expect(DRIVING.TURN_RATE).toBeGreaterThan(3.5);
    expect(DRIVING.MIN_TURN_SPEED).toBeGreaterThan(0.3);
    expect(DRIVING.BARRIER_SCRAPE_MIN_SPEED).toBeGreaterThan(40);
  });

  it('configures camera follow and zoom', () => {
    expect(CAMERA.ZOOM).toBeGreaterThan(0);
    expect(CAMERA.ZOOM).toBeLessThan(1.5);
    expect(CAMERA.FOLLOW_LERP).toBeGreaterThan(0);
    expect(CAMERA.FOLLOW_LERP).toBeLessThanOrEqual(1);
  });

  it('defines barrier segment count for oval colliders', () => {
    expect(BARRIER.SEGMENTS).toBeGreaterThanOrEqual(16);
    expect(BARRIER.THICKNESS).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { isWrongWayTravel } from './wrongWayDetection';

describe('wrongWayDetection', () => {
  it('returns false at low speed', () => {
    expect(isWrongWayTravel(10, 0, 0, 60)).toBe(false);
  });

  it('returns false when travelling with expected direction', () => {
    expect(isWrongWayTravel(100, 0, 0, 60)).toBe(false);
  });

  it('returns true when travelling opposite expected direction', () => {
    expect(isWrongWayTravel(-100, 0, 0, 60)).toBe(true);
  });
});

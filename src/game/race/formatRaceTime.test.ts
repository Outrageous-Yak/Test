import { describe, it, expect } from 'vitest';
import { formatRaceTime } from './formatRaceTime';

describe('formatRaceTime', () => {
  it('formats zero milliseconds', () => {
    expect(formatRaceTime(0)).toBe('00:00.000');
  });

  it('formats sub-second times', () => {
    expect(formatRaceTime(999)).toBe('00:00.999');
  });

  it('formats exact seconds', () => {
    expect(formatRaceTime(1000)).toBe('00:01.000');
  });

  it('formats minutes and fractional seconds', () => {
    expect(formatRaceTime(61234)).toBe('01:01.234');
  });

  it('formats larger valid times', () => {
    expect(formatRaceTime(125678)).toBe('02:05.678');
    expect(formatRaceTime(3599999)).toBe('59:59.999');
  });

  it('clamps negative values to zero', () => {
    expect(formatRaceTime(-500)).toBe('00:00.000');
  });
});

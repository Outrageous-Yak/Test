import { describe, it, expect } from 'vitest';
import { getMangoMeadowsRaceData } from './mangoMeadowsRaceData';
import { validatePathPoints } from '../RacePositionSystem';

describe('mangoMeadowsRaceData', () => {
  const data = getMangoMeadowsRaceData();

  it('provides four non-overlapping grid poses', () => {
    expect(data.gridPoses).toHaveLength(4);
    data.gridPoses.forEach((pose) => {
      expect(Number.isFinite(pose.x)).toBe(true);
      expect(Number.isFinite(pose.y)).toBe(true);
      expect(Number.isFinite(pose.rotation)).toBe(true);
    });

    for (let i = 0; i < data.gridPoses.length; i += 1) {
      for (let j = i + 1; j < data.gridPoses.length; j += 1) {
        const a = data.gridPoses[i];
        const b = data.gridPoses[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        expect(dist).toBeGreaterThan(30);
      }
    }
  });

  it('has valid looping AI path inside world bounds', () => {
    expect(data.aiPath.length).toBeGreaterThanOrEqual(20);
    expect(
      validatePathPoints(data.aiPath, data.worldWidth, data.worldHeight),
    ).toBe(true);
  });

  it('includes eight checkpoints', () => {
    expect(data.checkpoints).toHaveLength(8);
  });
});

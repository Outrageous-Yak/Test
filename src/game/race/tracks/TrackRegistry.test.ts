import { describe, it, expect } from 'vitest';
import {
  getPlayableTrack,
  getPlayableTrackIds,
  isPlayableTrack,
  isSupportedRaceTrack,
} from './TrackRegistry';
import { getMangoMeadowsRaceData } from './mangoMeadows/mangoMeadowsRaceData';
import { getRubyCoastRaceData } from './rubyCoast/rubyCoastRaceData';
import { getVolcanoRushRaceData } from './volcanoRush/volcanoRushRaceData';
import { allPointsWithinBounds, dedupeConsecutivePoints } from './trackPathUtils';
import { validatePlayableTrackDefinition } from './trackValidation';

describe('TrackRegistry', () => {
  it('registers all three playable tracks', () => {
    expect(isPlayableTrack('mango-meadows')).toBe(true);
    expect(isPlayableTrack('ruby-coast')).toBe(true);
    expect(isPlayableTrack('volcano-rush')).toBe(true);
    expect(getPlayableTrackIds()).toEqual(['mango-meadows', 'ruby-coast', 'volcano-rush']);
    expect(new Set(getPlayableTrackIds()).size).toBe(3);
  });

  it('returns null for unknown ids', () => {
    expect(getPlayableTrack('desert-drift' as 'mango-meadows')).toBeNull();
    expect(isSupportedRaceTrack(null)).toBe(false);
  });

  it('validates each playable track definition', () => {
    getPlayableTrackIds().forEach((id) => {
      const track = getPlayableTrack(id)!;
      expect(validatePlayableTrackDefinition(track)).toEqual([]);
      expect(track.raceData.worldWidth).toBeGreaterThan(0);
      expect(track.raceData.worldHeight).toBeGreaterThan(0);
      expect(track.raceData.gridPoses).toHaveLength(4);
      expect(track.raceData.checkpoints.length).toBeGreaterThan(0);
      expect(track.raceData.aiPath.length).toBeGreaterThanOrEqual(8);
      expect(track.lapCount).toBe(3);
    });
  });
});

describe('Mango Meadows migration', () => {
  const data = getMangoMeadowsRaceData();

  it('keeps mango-meadows id via registry', () => {
    expect(getPlayableTrack('mango-meadows')?.id).toBe('mango-meadows');
  });

  it('has eight checkpoints with one finish line', () => {
    expect(data.checkpoints).toHaveLength(8);
    expect(data.checkpoints.filter((cp) => cp.isFinishLine)).toHaveLength(1);
  });

  it('has a valid AI path', () => {
    expect(data.aiPath).toHaveLength(32);
    expect(allPointsWithinBounds(data.aiPath, data.worldWidth, data.worldHeight)).toBe(true);
  });
});

describe('Ruby Coast data', () => {
  const data = getRubyCoastRaceData();

  it('uses ruby-coast id and three laps', () => {
    const track = getPlayableTrack('ruby-coast')!;
    expect(track.id).toBe('ruby-coast');
    expect(track.displayName).toBe('Ruby Coast');
    expect(track.lapCount).toBe(3);
  });

  it('has unique finite checkpoints and one finish line', () => {
    const indices = data.checkpoints.map((cp) => cp.index);
    expect(new Set(indices).size).toBe(indices.length);
    expect(data.checkpoints.filter((cp) => cp.isFinishLine)).toHaveLength(1);
  });

  it('has a valid AI path within world bounds', () => {
    expect(data.aiPath.length).toBeGreaterThanOrEqual(36);
    expect(allPointsWithinBounds(data.aiPath, data.worldWidth, data.worldHeight, 20)).toBe(true);
    expect(dedupeConsecutivePoints(data.aiPath).length).toBe(data.aiPath.length);
  });
});

describe('Volcano Rush data', () => {
  const data = getVolcanoRushRaceData();

  it('uses volcano-rush id and display name', () => {
    const track = getPlayableTrack('volcano-rush')!;
    expect(track.id).toBe('volcano-rush');
    expect(track.displayName).toBe('Volcano Rush');
    expect(track.lapCount).toBe(3);
  });

  it('has sufficient checkpoints with one finish line', () => {
    expect(data.checkpoints.length).toBeGreaterThanOrEqual(10);
    expect(data.checkpoints.filter((cp) => cp.isFinishLine)).toHaveLength(1);
    const indices = data.checkpoints.map((cp) => cp.index);
    expect(new Set(indices).size).toBe(indices.length);
  });

  it('has non-overlapping spawns and valid AI path', () => {
    const poses = data.gridPoses;
    for (let i = 0; i < poses.length; i += 1) {
      for (let j = i + 1; j < poses.length; j += 1) {
        expect(Math.hypot(poses[i].x - poses[j].x, poses[i].y - poses[j].y)).toBeGreaterThan(30);
      }
    }
    expect(data.aiPath.length).toBeGreaterThanOrEqual(48);
    expect(allPointsWithinBounds(data.aiPath, data.worldWidth, data.worldHeight, 20)).toBe(true);
    expect(dedupeConsecutivePoints(data.aiPath).length).toBe(data.aiPath.length);
  });
});

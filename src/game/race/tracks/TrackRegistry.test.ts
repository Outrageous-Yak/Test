import { describe, it, expect } from 'vitest';
import {
  getPlayableTrack,
  getPlayableTrackIds,
  isPlayableTrack,
  isSupportedRaceTrack,
} from './TrackRegistry';
import { getMangoMeadowsRaceData } from './mangoMeadows/mangoMeadowsRaceData';
import { getRubyCoastRaceData } from './rubyCoast/rubyCoastRaceData';
import { allPointsWithinBounds, dedupeConsecutivePoints } from './trackPathUtils';

describe('TrackRegistry', () => {
  it('registers Mango Meadows and Ruby Coast', () => {
    expect(isPlayableTrack('mango-meadows')).toBe(true);
    expect(isPlayableTrack('ruby-coast')).toBe(true);
    expect(getPlayableTrackIds()).toEqual(['mango-meadows', 'ruby-coast']);
  });

  it('does not register Volcano Rush as playable', () => {
    expect(isPlayableTrack('volcano-rush')).toBe(false);
    expect(getPlayableTrack('volcano-rush')).toBeNull();
  });

  it('returns null for unknown ids', () => {
    expect(getPlayableTrack('desert-drift' as 'mango-meadows')).toBeNull();
    expect(isSupportedRaceTrack(null)).toBe(false);
  });

  it('provides valid world sizes and spawns for each playable track', () => {
    getPlayableTrackIds().forEach((id) => {
      const track = getPlayableTrack(id)!;
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
    data.checkpoints.forEach((cp) => {
      expect(Number.isFinite(cp.x)).toBe(true);
      expect(Number.isFinite(cp.y)).toBe(true);
    });
  });

  it('has non-overlapping spawns', () => {
    const poses = data.gridPoses;
    for (let i = 0; i < poses.length; i += 1) {
      for (let j = i + 1; j < poses.length; j += 1) {
        const dist = Math.hypot(poses[i].x - poses[j].x, poses[i].y - poses[j].y);
        expect(dist).toBeGreaterThan(30);
      }
    }
  });

  it('has a valid AI path within world bounds', () => {
    expect(data.aiPath.length).toBeGreaterThanOrEqual(36);
    expect(allPointsWithinBounds(data.aiPath, data.worldWidth, data.worldHeight, 20)).toBe(true);
    const deduped = dedupeConsecutivePoints(data.aiPath);
    expect(deduped.length).toBe(data.aiPath.length);
  });
});

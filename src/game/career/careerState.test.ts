import { describe, it, expect } from 'vitest';
import {
  applyRaceCareerResult,
  applyRaceStarted,
  resetCareerProgress,
  createDefaultCareerSlice,
} from './careerState';

describe('careerState', () => {
  it('increments races started', () => {
    const slice = createDefaultCareerSlice();
    const next = applyRaceStarted(slice);
    expect(next.careerStatistics.racesStarted).toBe(1);
  });

  it('applies win rewards and unlocks', () => {
    const slice = createDefaultCareerSlice();
    const { state, outcome } = applyRaceCareerResult(slice, {
      trackId: 'mango-meadows',
      playerPosition: 1,
      finishTimeMs: 80_000,
      fastestLapMs: 25_000,
      didFinish: true,
    });

    expect(outcome.coinsEarned).toBe(100);
    expect(state.coins).toBe(100);
    expect(state.unlockedTracks).toContain('ruby-coast');
    expect(state.completedTracks).toContain('mango-meadows');
    expect(state.bestTimes['mango-meadows']).toBe(80_000);
    expect(state.careerStatistics.wins).toBe(1);
    expect(state.careerStatistics.fastestLapMs).toBe(25_000);
  });

  it('does not replace slower best time', () => {
    const slice = {
      ...createDefaultCareerSlice(),
      bestTimes: { 'mango-meadows': 70_000 },
    };

    const { state, outcome } = applyRaceCareerResult(slice, {
      trackId: 'mango-meadows',
      playerPosition: 2,
      finishTimeMs: 90_000,
      fastestLapMs: null,
      didFinish: true,
    });

    expect(outcome.isNewRecord).toBe(false);
    expect(state.bestTimes['mango-meadows']).toBe(70_000);
    expect(state.coins).toBe(60);
  });

  it('resets career progress while keeping structure', () => {
    const slice = createDefaultCareerSlice();
    const progressed = applyRaceCareerResult(slice, {
      trackId: 'mango-meadows',
      playerPosition: 1,
      finishTimeMs: 80_000,
      fastestLapMs: 25_000,
      didFinish: true,
    }).state;

    const reset = resetCareerProgress(progressed);
    expect(reset.coins).toBe(0);
    expect(reset.bestTimes).toEqual({});
    expect(reset.completedTracks).toEqual([]);
    expect(reset.unlockedTracks).toEqual(['mango-meadows']);
    expect(reset.careerStatistics.racesStarted).toBe(0);
  });
});

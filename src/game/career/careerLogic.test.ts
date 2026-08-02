import { describe, it, expect } from 'vitest';
import {
  COIN_REWARDS,
  computeBestTimeUpdate,
  computeFastestLapUpdate,
  getCoinsForPosition,
  getUnlockForWin,
  isPodium,
  isWin,
  processRaceCareerOutcome,
} from './careerLogic';

describe('careerLogic coins', () => {
  it('awards correct coins for positions 1–4', () => {
    expect(getCoinsForPosition(1)).toBe(COIN_REWARDS[1]);
    expect(getCoinsForPosition(2)).toBe(COIN_REWARDS[2]);
    expect(getCoinsForPosition(3)).toBe(COIN_REWARDS[3]);
    expect(getCoinsForPosition(4)).toBe(COIN_REWARDS[4]);
    expect(getCoinsForPosition(5)).toBe(0);
  });
});

describe('careerLogic win and unlock', () => {
  it('treats first place as a win', () => {
    expect(isWin(1)).toBe(true);
    expect(isWin(2)).toBe(false);
  });

  it('treats top three as podium', () => {
    expect(isPodium(1)).toBe(true);
    expect(isPodium(3)).toBe(true);
    expect(isPodium(4)).toBe(false);
  });

  it('unlocks Ruby Coast only on Mango Meadows win', () => {
    expect(getUnlockForWin('mango-meadows', 1)).toBe('ruby-coast');
    expect(getUnlockForWin('mango-meadows', 2)).toBeNull();
    expect(getUnlockForWin('ruby-coast', 1)).toBe('volcano-rush');
    expect(getUnlockForWin('ruby-coast', 2)).toBeNull();
  });
});

describe('careerLogic best times', () => {
  it('records first best time', () => {
    const result = computeBestTimeUpdate(undefined, 120_000);
    expect(result.bestTimeMs).toBe(120_000);
    expect(result.isNewRecord).toBe(true);
  });

  it('replaces slower times', () => {
    const result = computeBestTimeUpdate(100_000, 120_000);
    expect(result.bestTimeMs).toBe(100_000);
    expect(result.isNewRecord).toBe(false);
  });

  it('updates faster times', () => {
    const result = computeBestTimeUpdate(120_000, 100_000);
    expect(result.bestTimeMs).toBe(100_000);
    expect(result.isNewRecord).toBe(true);
  });
});

describe('careerLogic fastest lap', () => {
  it('stores first lap time', () => {
    expect(computeFastestLapUpdate(null, 30_000)).toBe(30_000);
  });

  it('keeps faster lap', () => {
    expect(computeFastestLapUpdate(25_000, 30_000)).toBe(25_000);
  });
});

describe('processRaceCareerOutcome', () => {
  it('marks Mango Meadows complete and unlocks Ruby Coast on win', () => {
    const outcome = processRaceCareerOutcome(
      {
        trackId: 'mango-meadows',
        playerPosition: 1,
        finishTimeMs: 90_000,
        fastestLapMs: 28_000,
        didFinish: true,
      },
      {},
      [],
    );

    expect(outcome.coinsEarned).toBe(100);
    expect(outcome.trackUnlocked).toBe('ruby-coast');
    expect(outcome.trackMarkedComplete).toBe(true);
    expect(outcome.isNewRecord).toBe(true);
    expect(outcome.bestTimeMs).toBe(90_000);
  });

  it('does not unlock Ruby Coast on second place at Mango Meadows', () => {
    const outcome = processRaceCareerOutcome(
      {
        trackId: 'mango-meadows',
        playerPosition: 2,
        finishTimeMs: 95_000,
        fastestLapMs: null,
        didFinish: true,
      },
      {},
      [],
    );

    expect(outcome.coinsEarned).toBe(60);
    expect(outcome.trackUnlocked).toBeNull();
    expect(outcome.trackMarkedComplete).toBe(false);
  });

  it('marks Ruby Coast complete and unlocks Volcano Rush on win', () => {
    const outcome = processRaceCareerOutcome(
      {
        trackId: 'ruby-coast',
        playerPosition: 1,
        finishTimeMs: 110_000,
        fastestLapMs: 32_000,
        didFinish: true,
      },
      {},
      [],
    );

    expect(outcome.trackUnlocked).toBe('volcano-rush');
    expect(outcome.trackMarkedComplete).toBe(true);
    expect(outcome.coinsEarned).toBe(100);
  });

  it('does not unlock Volcano Rush on second place at Ruby Coast', () => {
    const outcome = processRaceCareerOutcome(
      {
        trackId: 'ruby-coast',
        playerPosition: 2,
        finishTimeMs: 115_000,
        fastestLapMs: null,
        didFinish: true,
      },
      {},
      [],
    );

    expect(outcome.trackUnlocked).toBeNull();
    expect(outcome.coinsEarned).toBe(60);
  });
});

import type { TrackId } from '../state/gameStateTypes';

/** Coin rewards by finishing position (1st–4th) */
export const COIN_REWARDS: Record<1 | 2 | 3 | 4, number> = {
  1: 100,
  2: 60,
  3: 40,
  4: 25,
};

export interface CareerStatistics {
  racesStarted: number;
  racesFinished: number;
  wins: number;
  podiums: number;
  fastestLapMs: number | null;
  totalRaceTimeMs: number;
  totalCoinsEarned: number;
}

export const DEFAULT_CAREER_STATISTICS: CareerStatistics = {
  racesStarted: 0,
  racesFinished: 0,
  wins: 0,
  podiums: 0,
  fastestLapMs: null,
  totalRaceTimeMs: 0,
  totalCoinsEarned: 0,
};

export type BestTimes = Partial<Record<TrackId, number>>;

export interface RaceCareerInput {
  trackId: TrackId;
  playerPosition: number;
  finishTimeMs: number | null;
  fastestLapMs: number | null;
  didFinish: boolean;
}

export interface RaceCareerOutcome {
  coinsEarned: number;
  bestTimeMs: number | null;
  previousBestTimeMs: number | null;
  isNewRecord: boolean;
  trackUnlocked: TrackId | null;
  trackMarkedComplete: boolean;
}

export function getCoinsForPosition(position: number): number {
  if (position === 1) return COIN_REWARDS[1];
  if (position === 2) return COIN_REWARDS[2];
  if (position === 3) return COIN_REWARDS[3];
  if (position === 4) return COIN_REWARDS[4];
  return 0;
}

export function isWin(position: number): boolean {
  return position === 1;
}

export function isPodium(position: number): boolean {
  return position >= 1 && position <= 3;
}

/** Returns the track to unlock after a win, if any */
export function getUnlockForWin(trackId: TrackId, position: number): TrackId | null {
  if (!isWin(position)) return null;
  if (trackId === 'mango-meadows') return 'ruby-coast';
  return null;
}

export function computeBestTimeUpdate(
  currentBest: number | undefined,
  finishTimeMs: number | null,
): { bestTimeMs: number | null; isNewRecord: boolean } {
  if (finishTimeMs === null || finishTimeMs <= 0) {
    return { bestTimeMs: currentBest ?? null, isNewRecord: false };
  }
  if (currentBest === undefined || finishTimeMs < currentBest) {
    return { bestTimeMs: finishTimeMs, isNewRecord: true };
  }
  return { bestTimeMs: currentBest, isNewRecord: false };
}

export function computeFastestLapUpdate(
  currentFastest: number | null,
  lapTimeMs: number | null,
): number | null {
  if (lapTimeMs === null || lapTimeMs <= 0) return currentFastest;
  if (currentFastest === null || lapTimeMs < currentFastest) return lapTimeMs;
  return currentFastest;
}

export function processRaceCareerOutcome(
  input: RaceCareerInput,
  bestTimes: BestTimes,
  completedTracks: readonly TrackId[],
): RaceCareerOutcome {
  const coinsEarned = input.didFinish ? getCoinsForPosition(input.playerPosition) : 0;
  const previousBest = bestTimes[input.trackId];
  const { bestTimeMs, isNewRecord } = computeBestTimeUpdate(previousBest, input.finishTimeMs);

  const trackUnlocked = getUnlockForWin(input.trackId, input.playerPosition);
  const trackMarkedComplete =
    input.didFinish && isWin(input.playerPosition) && !completedTracks.includes(input.trackId);

  return {
    coinsEarned,
    bestTimeMs: input.didFinish ? bestTimeMs : previousBest ?? null,
    previousBestTimeMs: previousBest ?? null,
    isNewRecord: input.didFinish && isNewRecord,
    trackUnlocked,
    trackMarkedComplete,
  };
}

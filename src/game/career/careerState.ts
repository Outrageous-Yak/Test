import type { TrackId } from '../state/gameStateTypes';
import {
  DEFAULT_CAREER_STATISTICS,
  type BestTimes,
  type CareerStatistics,
  type RaceCareerInput,
  type RaceCareerOutcome,
} from './careerLogic';
import {
  computeFastestLapUpdate,
  isPodium,
  isWin,
  processRaceCareerOutcome,
} from './careerLogic';

export interface CareerStateSlice {
  coins: number;
  bestTimes: BestTimes;
  completedTracks: TrackId[];
  unlockedTracks: TrackId[];
  careerStatistics: CareerStatistics;
}

export function createDefaultCareerSlice(): CareerStateSlice {
  return {
    coins: 0,
    bestTimes: {},
    completedTracks: [],
    unlockedTracks: ['mango-meadows'],
    careerStatistics: { ...DEFAULT_CAREER_STATISTICS },
  };
}

export function applyRaceCareerResult(
  state: CareerStateSlice,
  input: RaceCareerInput,
): { state: CareerStateSlice; outcome: RaceCareerOutcome } {
  const outcome = processRaceCareerOutcome(input, state.bestTimes, state.completedTracks);

  const next: CareerStateSlice = {
    ...state,
    coins: state.coins + outcome.coinsEarned,
    bestTimes: { ...state.bestTimes },
    completedTracks: [...state.completedTracks],
    unlockedTracks: [...state.unlockedTracks],
    careerStatistics: { ...state.careerStatistics },
  };

  if (input.didFinish && outcome.bestTimeMs !== null) {
    next.bestTimes[input.trackId] = outcome.bestTimeMs;
  }

  if (outcome.trackMarkedComplete && !next.completedTracks.includes(input.trackId)) {
    next.completedTracks.push(input.trackId);
  }

  if (outcome.trackUnlocked && !next.unlockedTracks.includes(outcome.trackUnlocked)) {
    next.unlockedTracks.push(outcome.trackUnlocked);
  }

  const stats = next.careerStatistics;
  if (input.didFinish) {
    stats.racesFinished += 1;
    if (input.finishTimeMs !== null) {
      stats.totalRaceTimeMs += input.finishTimeMs;
    }
    if (isWin(input.playerPosition)) stats.wins += 1;
    if (isPodium(input.playerPosition)) stats.podiums += 1;
  }
  stats.totalCoinsEarned += outcome.coinsEarned;
  stats.fastestLapMs = computeFastestLapUpdate(stats.fastestLapMs, input.fastestLapMs);

  return { state: next, outcome };
}

export function applyRaceStarted(state: CareerStateSlice): CareerStateSlice {
  return {
    ...state,
    careerStatistics: {
      ...state.careerStatistics,
      racesStarted: state.careerStatistics.racesStarted + 1,
    },
  };
}

export function resetCareerProgress(state: CareerStateSlice): CareerStateSlice {
  return {
    ...state,
    coins: 0,
    bestTimes: {},
    completedTracks: [],
    unlockedTracks: ['mango-meadows'],
    careerStatistics: { ...DEFAULT_CAREER_STATISTICS },
  };
}

import type { RacerId } from './raceTypes';
import type { TrackId } from '../state/gameStateTypes';

export interface RacerResult {
  racerId: RacerId;
  displayName: string;
  position: number;
  finishTimeMs: number | null;
  status: 'finished' | 'dnf';
  isPlayer: boolean;
}

export interface RaceCareerSummary {
  playerPosition: number;
  finishTimeMs: number | null;
  bestTimeMs: number | null;
  coinsEarned: number;
  isNewRecord: boolean;
  trackUnlocked: TrackId | null;
  trackMarkedComplete: boolean;
  careerComplete: boolean;
  trackId: TrackId | null;
}

export interface RaceResultsPayload {
  trackName: string;
  results: readonly RacerResult[];
  career?: RaceCareerSummary;
}

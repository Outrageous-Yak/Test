import type { RacerId } from './raceTypes';

export interface RacerResult {
  racerId: RacerId;
  displayName: string;
  position: number;
  finishTimeMs: number | null;
  status: 'finished' | 'dnf';
  isPlayer: boolean;
}

export interface RaceResultsPayload {
  trackName: string;
  results: readonly RacerResult[];
}

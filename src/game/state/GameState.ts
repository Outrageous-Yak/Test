import { SaveSystem } from '../systems/SaveSystem';
import { canSelectCharacter } from '../data/characters';
import { canSelectCar } from '../data/cars';
import { isValidTrackId } from '../data/tracks';
import {
  applyRaceCareerResult,
  applyRaceStarted,
  resetCareerProgress,
  type CareerStateSlice,
} from '../career/careerState';
import type { RaceCareerInput, RaceCareerOutcome } from '../career/careerLogic';
import { isCareerComplete } from '../career/careerLogic';
import {
  DEFAULT_GAME_STATE,
  type CharacterId,
  type CarId,
  type TrackId,
  type GameSettings,
  type SerializableGameState,
} from './gameStateTypes';

export type { CharacterId, CarId, TrackId, ControlStyle, GameSettings, SerializableGameState } from './gameStateTypes';
export { DEFAULT_GAME_STATE } from './gameStateTypes';
export type { CareerStatistics, RaceCareerOutcome } from '../career/careerLogic';

/**
 * Central game-state singleton.
 *
 * Access pattern: import { GameState } from './state/GameState' anywhere in the
 * game. State is loaded from local storage on first access and persisted
 * automatically when mutated. Scenes should not pass state through constructor
 * parameters.
 */
class GameStateManager {
  private state: SerializableGameState;

  constructor() {
    this.state = SaveSystem.load();
  }

  getState(): Readonly<SerializableGameState> {
    return this.state;
  }

  get settings(): Readonly<GameSettings> {
    return this.state.settings;
  }

  updateSettings(partial: Partial<GameSettings>): void {
    this.state.settings = { ...this.state.settings, ...partial };
    this.persist();
  }

  setSelectedCharacter(character: CharacterId | null): void {
    if (character !== null && !canSelectCharacter(character, this.state.unlockedCharacters)) {
      return;
    }
    this.state.selectedCharacter = character;
    this.persist();
  }

  setSelectedCar(car: CarId | null): boolean {
    if (car !== null && !canSelectCar(car, this.state.unlockedCars)) {
      return false;
    }
    this.state.selectedCar = car;
    this.persist();
    return true;
  }

  setSelectedTrack(track: TrackId | null): boolean {
    if (track !== null && !this.isTrackUnlocked(track)) {
      return false;
    }
    this.state.selectedTrack = track;
    this.persist();
    return true;
  }

  isTrackUnlocked(trackId: TrackId): boolean {
    return this.state.unlockedTracks.includes(trackId);
  }

  unlockTrack(trackId: TrackId): boolean {
    if (!isValidTrackId(trackId)) {
      return false;
    }
    if (this.state.unlockedTracks.includes(trackId)) {
      return true;
    }
    this.state.unlockedTracks = [...this.state.unlockedTracks, trackId];
    this.persist();
    return true;
  }

  setCoins(coins: number): void {
    this.state.coins = coins;
    this.persist();
  }

  getCoins(): number {
    return this.state.coins;
  }

  getBestTime(trackId: TrackId): number | null {
    return this.state.bestTimes[trackId] ?? null;
  }

  isTrackCompleted(trackId: TrackId): boolean {
    return this.state.completedTracks.includes(trackId);
  }

  isCareerComplete(): boolean {
    return isCareerComplete(this.state.completedTracks);
  }

  getCareerStatistics(): Readonly<SerializableGameState['careerStatistics']> {
    return this.state.careerStatistics;
  }

  recordRaceStarted(): void {
    const slice = this.getCareerSlice();
    const next = applyRaceStarted(slice);
    this.applyCareerSlice(next);
    this.persist();
  }

  recordRaceResult(input: RaceCareerInput): RaceCareerOutcome {
    const slice = this.getCareerSlice();
    const { state, outcome } = applyRaceCareerResult(slice, input);
    this.applyCareerSlice(state);
    if (this.state.selectedTrack && !this.isTrackUnlocked(this.state.selectedTrack)) {
      this.state.selectedTrack = null;
    }
    this.persist();
    return outcome;
  }

  resetCareer(): void {
    const slice = this.getCareerSlice();
    const next = resetCareerProgress(slice);
    this.applyCareerSlice(next);
    if (!this.state.selectedTrack || !this.isTrackUnlocked(this.state.selectedTrack)) {
      this.state.selectedTrack = 'mango-meadows';
    }
    this.persist();
  }

  reset(): void {
    this.state = { ...DEFAULT_GAME_STATE, settings: { ...DEFAULT_GAME_STATE.settings } };
    SaveSystem.reset();
  }

  /** Reload state from local storage — useful after external storage changes */
  reloadFromStorage(): void {
    this.state = SaveSystem.load();
  }

  private persist(): void {
    SaveSystem.save(this.state);
  }

  private getCareerSlice(): CareerStateSlice {
    return {
      coins: this.state.coins,
      bestTimes: this.state.bestTimes,
      completedTracks: this.state.completedTracks,
      unlockedTracks: this.state.unlockedTracks,
      careerStatistics: this.state.careerStatistics,
    };
  }

  private applyCareerSlice(slice: CareerStateSlice): void {
    this.state.coins = slice.coins;
    this.state.bestTimes = slice.bestTimes;
    this.state.completedTracks = slice.completedTracks;
    this.state.unlockedTracks = slice.unlockedTracks;
    this.state.careerStatistics = slice.careerStatistics;
  }
}

export const GameState = new GameStateManager();

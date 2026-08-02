import { SaveSystem } from '../systems/SaveSystem';
import { canSelectCharacter } from '../data/characters';
import { canSelectCar } from '../data/cars';
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

  setSelectedTrack(track: TrackId | null): void {
    this.state.selectedTrack = track;
    this.persist();
  }

  setCoins(coins: number): void {
    this.state.coins = coins;
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
}

export const GameState = new GameStateManager();

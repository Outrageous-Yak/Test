import { SaveSystem } from '../systems/SaveSystem';
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
    this.state.selectedCharacter = character;
    this.persist();
  }

  setSelectedCar(car: CarId | null): void {
    this.state.selectedCar = car;
    this.persist();
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

  private persist(): void {
    SaveSystem.save(this.state);
  }
}

export const GameState = new GameStateManager();

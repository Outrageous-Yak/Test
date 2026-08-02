import {
  DEFAULT_GAME_STATE,
  type GameSettings,
  type SerializableGameState,
} from '../state/gameStateTypes';
import { parseCharacterId, filterUnlockedCharacterIds } from '../data/characters';
import { parseCarId, filterUnlockedCarIds } from '../data/cars';

export const STORAGE_KEY = 'mango-ruby-racing-save-v1';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseSettings(raw: unknown): Partial<GameSettings> {
  if (!isPlainObject(raw)) return {};

  const partial: Partial<GameSettings> = {};

  if (isBoolean(raw.musicEnabled)) partial.musicEnabled = raw.musicEnabled;
  if (isBoolean(raw.soundEnabled)) partial.soundEnabled = raw.soundEnabled;
  if (isBoolean(raw.vibrationEnabled)) partial.vibrationEnabled = raw.vibrationEnabled;
  if (raw.controlStyle === 'buttons' || raw.controlStyle === 'tilt') {
    partial.controlStyle = raw.controlStyle;
  }

  return partial;
}

/**
 * Merge stored data with defaults so new fields added in later versions
 * are always present without breaking existing saves.
 */
export function mergeWithDefaults(partial: Partial<SerializableGameState>): SerializableGameState {
  const unlockedFromSave = isStringArray(partial.unlockedCharacters)
    ? filterUnlockedCharacterIds(partial.unlockedCharacters)
    : [];

  const unlockedCarsFromSave = isStringArray(partial.unlockedCars)
    ? filterUnlockedCarIds(partial.unlockedCars)
    : [];

  return {
    selectedCharacter:
      partial.selectedCharacter === null
        ? null
        : parseCharacterId(partial.selectedCharacter) ?? DEFAULT_GAME_STATE.selectedCharacter,
    selectedCar:
      partial.selectedCar === null
        ? null
        : parseCarId(partial.selectedCar) ?? DEFAULT_GAME_STATE.selectedCar,
    selectedTrack: partial.selectedTrack ?? DEFAULT_GAME_STATE.selectedTrack,
    coins: typeof partial.coins === 'number' && partial.coins >= 0 ? partial.coins : DEFAULT_GAME_STATE.coins,
    unlockedCharacters:
      unlockedFromSave.length > 0
        ? unlockedFromSave
        : [...DEFAULT_GAME_STATE.unlockedCharacters],
    unlockedCars:
      unlockedCarsFromSave.length > 0
        ? unlockedCarsFromSave
        : [...DEFAULT_GAME_STATE.unlockedCars],
    unlockedTracks: isStringArray(partial.unlockedTracks)
      ? partial.unlockedTracks
      : [...DEFAULT_GAME_STATE.unlockedTracks],
    settings: {
      ...DEFAULT_GAME_STATE.settings,
      ...parseSettings(partial.settings),
    },
  };
}

function parseStoredState(raw: unknown): SerializableGameState | null {
  if (!isPlainObject(raw)) return null;
  return mergeWithDefaults(raw as Partial<SerializableGameState>);
}

export const SaveSystem = {
  load(): SerializableGameState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return mergeWithDefaults({});
      }

      const parsed: unknown = JSON.parse(stored);
      const state = parseStoredState(parsed);
      return state ?? mergeWithDefaults({});
    } catch {
      return mergeWithDefaults({});
    }
  },

  save(state: SerializableGameState): void {
    try {
      const serialisable: SerializableGameState = {
        selectedCharacter: state.selectedCharacter,
        selectedCar: state.selectedCar,
        selectedTrack: state.selectedTrack,
        coins: state.coins,
        unlockedCharacters: [...state.unlockedCharacters],
        unlockedCars: [...state.unlockedCars],
        unlockedTracks: [...state.unlockedTracks],
        settings: { ...state.settings },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable));
    } catch {
      // Storage may be full or unavailable — game continues with in-memory state
    }
  },

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors during reset
    }
  },
};

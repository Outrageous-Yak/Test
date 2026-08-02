export type CharacterId = 'mango' | 'ruby';
export type CarId = 'mango-car' | 'red-car';
export type TrackId = 'mango-meadows' | 'ruby-coast' | 'volcano-rush';
export type ControlStyle = 'buttons' | 'tilt';

export interface GameSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  controlStyle: ControlStyle;
}

/** Plain serialisable game state — safe for local storage */
export interface SerializableGameState {
  selectedCharacter: CharacterId | null;
  selectedCar: CarId | null;
  selectedTrack: TrackId | null;
  coins: number;
  unlockedCharacters: string[];
  unlockedCars: string[];
  unlockedTracks: string[];
  settings: GameSettings;
}

export const DEFAULT_GAME_STATE: SerializableGameState = {
  selectedCharacter: null,
  selectedCar: null,
  selectedTrack: null,
  coins: 0,
  unlockedCharacters: ['mango', 'ruby'],
  unlockedCars: ['mango-car', 'red-car'],
  unlockedTracks: ['mango-meadows'],
  settings: {
    musicEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    controlStyle: 'buttons',
  },
};

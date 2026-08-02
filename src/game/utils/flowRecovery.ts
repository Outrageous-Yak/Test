import { GameState } from '../state/GameState';
import { parseCharacterId } from '../data/characters';
import { parseCarId } from '../data/cars';
import { parseTrackId } from '../data/tracks';

/** Whether a valid character is currently selected */
export function hasValidSelectedCharacter(): boolean {
  return parseCharacterId(GameState.getState().selectedCharacter) !== null;
}

/** Whether a valid car is currently selected */
export function hasValidSelectedCar(): boolean {
  return parseCarId(GameState.getState().selectedCar) !== null;
}

/** Whether a valid unlocked track is currently selected */
export function hasValidSelectedTrack(): boolean {
  const state = GameState.getState();
  const trackId = parseTrackId(state.selectedTrack);
  return trackId !== null && GameState.isTrackUnlocked(trackId);
}

import { GameState } from '../state/GameState';
import { parseCharacterId } from '../data/characters';
import { parseCarId } from '../data/cars';

/** Whether a valid character is currently selected */
export function hasValidSelectedCharacter(): boolean {
  return parseCharacterId(GameState.getState().selectedCharacter) !== null;
}

/** Whether a valid car is currently selected */
export function hasValidSelectedCar(): boolean {
  return parseCarId(GameState.getState().selectedCar) !== null;
}

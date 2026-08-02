import { SCENE_KEYS } from '../constants';
import { GameState } from '../state/GameState';
import {
  hasValidSelectedCharacter,
  hasValidSelectedCar,
  hasValidSelectedTrack,
} from '../utils/flowRecovery';
import { isSupportedRaceTrack } from './checkpointLogic';

/** Validates that the current selections can launch the Phase 6 Mango Meadows race */
export function canLaunchPhase6Race(): boolean {
  if (!hasValidSelectedCharacter() || !hasValidSelectedCar() || !hasValidSelectedTrack()) {
    return false;
  }
  const state = GameState.getState();
  return isSupportedRaceTrack(state.selectedTrack);
}

/** Returns the scene key to redirect to when race launch is invalid */
export function getRaceLaunchRedirectScene(): string | null {
  if (!hasValidSelectedCharacter()) return SCENE_KEYS.CHARACTER_SELECT;
  if (!hasValidSelectedCar()) return SCENE_KEYS.CAR_SELECT;
  if (!hasValidSelectedTrack()) return SCENE_KEYS.TRACK_SELECT;
  const state = GameState.getState();
  if (!isSupportedRaceTrack(state.selectedTrack)) return SCENE_KEYS.TRACK_SELECT;
  return null;
}

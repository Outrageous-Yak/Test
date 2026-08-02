import { GameState } from '../../state/GameState';
import type { TrackId } from '../../state/gameStateTypes';
import { getPlayableTrack, isPlayableTrack } from './TrackRegistry';
import type { PlayableTrackDefinition } from './trackTypes';

export interface LoadedPlayableTrack {
  trackId: TrackId;
  definition: PlayableTrackDefinition;
}

/** Load the currently selected playable track from GameState */
export function loadSelectedPlayableTrack(): LoadedPlayableTrack | null {
  const state = GameState.getState();
  if (!state.selectedTrack || !isPlayableTrack(state.selectedTrack)) {
    return null;
  }
  const definition = getPlayableTrack(state.selectedTrack);
  if (!definition) return null;
  return { trackId: state.selectedTrack, definition };
}

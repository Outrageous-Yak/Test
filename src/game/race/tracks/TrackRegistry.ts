import type { TrackId } from '../../state/gameStateTypes';
import type { PlayableTrackDefinition } from './trackTypes';
import { mangoMeadowsTrack } from './mangoMeadows/mangoMeadowsTrack';
import { rubyCoastTrack } from './rubyCoast/rubyCoastTrack';

const PLAYABLE_TRACKS: PlayableTrackDefinition[] = [mangoMeadowsTrack, rubyCoastTrack];

const trackMap = new Map<TrackId, PlayableTrackDefinition>(
  PLAYABLE_TRACKS.map((track) => [track.id, track]),
);

export function getPlayableTrack(trackId: TrackId): PlayableTrackDefinition | null {
  return trackMap.get(trackId) ?? null;
}

export function isPlayableTrack(trackId: TrackId): boolean {
  return trackMap.has(trackId);
}

export function getPlayableTrackIds(): TrackId[] {
  return PLAYABLE_TRACKS.map((track) => track.id);
}

export function isSupportedRaceTrack(trackId: string | null): boolean {
  if (trackId === null) return false;
  return isPlayableTrack(trackId as TrackId);
}

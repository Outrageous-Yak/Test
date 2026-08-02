import type { PlayableTrackDefinition } from '../trackTypes';
import { VOLCANO_RUSH_CAMERA } from './volcanoRushConstants';
import { buildVolcanoRushTrack } from './volcanoRushRenderer';
import { getVolcanoRushRaceData } from './volcanoRushRaceData';

export const volcanoRushTrack: PlayableTrackDefinition = {
  id: 'volcano-rush',
  displayName: 'Volcano Rush',
  lapCount: 3,
  raceData: getVolcanoRushRaceData(),
  camera: VOLCANO_RUSH_CAMERA,
  build: buildVolcanoRushTrack,
};

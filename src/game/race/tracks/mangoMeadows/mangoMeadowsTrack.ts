import { CAMERA } from '../../raceConstants';
import type { PlayableTrackDefinition } from '../trackTypes';
import { buildMangoMeadowsTrack } from './mangoMeadowsRenderer';
import { getMangoMeadowsRaceData } from './mangoMeadowsRaceData';

export const mangoMeadowsTrack: PlayableTrackDefinition = {
  id: 'mango-meadows',
  displayName: 'Mango Meadows',
  lapCount: 3,
  raceData: getMangoMeadowsRaceData(),
  camera: {
    zoom: CAMERA.ZOOM,
    lerpX: CAMERA.FOLLOW_LERP,
    lerpY: CAMERA.FOLLOW_LERP,
  },
  build: buildMangoMeadowsTrack,
};

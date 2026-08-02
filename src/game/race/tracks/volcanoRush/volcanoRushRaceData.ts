import type { TrackRaceData } from '../trackTypes';
import { VOLCANO_RUSH_AI_TUNING } from './volcanoRushConstants';
import { getVolcanoRushRaceDataFields } from './volcanoRushCheckpoints';

export function getVolcanoRushRaceData(): TrackRaceData {
  return {
    ...getVolcanoRushRaceDataFields(),
    aiTuning: { ...VOLCANO_RUSH_AI_TUNING },
  };
}

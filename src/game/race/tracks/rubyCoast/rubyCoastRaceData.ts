import type { TrackRaceData } from '../trackTypes';
import { RUBY_COAST_AI_TUNING } from './rubyCoastConstants';
import { getRubyCoastRaceDataFields } from './rubyCoastCheckpoints';

export function getRubyCoastRaceData(): TrackRaceData {
  return {
    ...getRubyCoastRaceDataFields(),
    aiTuning: { ...RUBY_COAST_AI_TUNING },
  };
}

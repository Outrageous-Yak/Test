import type { PlayableTrackDefinition } from '../trackTypes';
import { RUBY_COAST_CAMERA } from './rubyCoastConstants';
import { buildRubyCoastTrack } from './rubyCoastRenderer';
import { getRubyCoastRaceData } from './rubyCoastRaceData';

export const rubyCoastTrack: PlayableTrackDefinition = {
  id: 'ruby-coast',
  displayName: 'Ruby Coast',
  lapCount: 3,
  raceData: getRubyCoastRaceData(),
  camera: RUBY_COAST_CAMERA,
  build: buildRubyCoastTrack,
};

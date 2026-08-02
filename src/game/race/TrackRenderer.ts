/** @deprecated Use TrackRegistry and mangoMeadows/mangoMeadowsRenderer */
export { buildMangoMeadowsTrack } from './tracks/mangoMeadows/mangoMeadowsRenderer';
export type { TrackBuildResult } from './tracks/trackTypes';

import Phaser from 'phaser';
import { buildMangoMeadowsTrack } from './tracks/mangoMeadows/mangoMeadowsRenderer';

/** @deprecated Use buildMangoMeadowsTrack via TrackRegistry */
export class TrackRenderer {
  constructor(private readonly scene: Phaser.Scene) {}

  buildMangoMeadows() {
    return buildMangoMeadowsTrack(this.scene);
  }

  destroy(): void {
    // Graphics destroyed via TrackBuildResult.destroyGraphics in RaceScene
  }
}

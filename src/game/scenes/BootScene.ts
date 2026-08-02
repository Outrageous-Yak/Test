import Phaser from 'phaser';
import { SCENE_KEYS } from '../constants';

/**
 * Boot Scene — responsible for initial Phaser setup and transitioning to Preload.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BOOT });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    this.scene.start(SCENE_KEYS.PRELOAD);
  }
}

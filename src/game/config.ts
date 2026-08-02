import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { CarSelectScene } from './scenes/CarSelectScene';
import { TrackSelectScene } from './scenes/TrackSelectScene';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './constants';

/**
 * Creates the Phaser game configuration.
 * Called from BootScene during initial setup.
 */
export function createGameConfig(parent: string | HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.BACKGROUND,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: {
      activePointers: 3,
      touch: {
        capture: true,
      },
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'high-performance',
    },
    scene: [BootScene, PreloadScene, MainMenuScene, CharacterSelectScene, CarSelectScene, TrackSelectScene],
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },
  };
}

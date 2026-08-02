import Phaser from 'phaser';
import { COLORS, FONTS, MIN_TOUCH_TARGET } from '../constants';
import type { ButtonCallback } from '../types';

export interface TouchButtonOptions {
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
  onPress: ButtonCallback;
}

/**
 * Creates a touch-friendly button supporting mouse, touch, and keyboard focus.
 */
export function createTouchButton(
  scene: Phaser.Scene,
  options: TouchButtonOptions,
): Phaser.GameObjects.Container {
  const {
    x,
    y,
    label,
    width = 280,
    height = Math.max(MIN_TOUCH_TARGET, 72),
    onPress,
  } = options;

  const container = scene.add.container(x, y);

  const bg = scene.add
    .rectangle(0, 0, width, height, COLORS.BUTTON_NORMAL)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  container.add([bg, text]);

  bg.on('pointerover', () => {
    bg.setFillStyle(COLORS.BUTTON_HOVER);
  });

  bg.on('pointerout', () => {
    bg.setFillStyle(COLORS.BUTTON_NORMAL);
  });

  bg.on('pointerdown', () => {
    bg.setFillStyle(COLORS.BUTTON_PRESSED);
  });

  bg.on('pointerup', () => {
    bg.setFillStyle(COLORS.BUTTON_HOVER);
    onPress();
  });

  return container;
}

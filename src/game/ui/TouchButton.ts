import Phaser from 'phaser';
import { COLORS, FONTS, MIN_TOUCH_TARGET, UI } from '../constants';
import type { ButtonCallback } from '../types';

export interface TouchButtonOptions {
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
  fontSize?: number;
  onPress: ButtonCallback;
  enabled?: boolean;
}

export interface TouchButtonHandle {
  container: Phaser.GameObjects.Container;
  setEnabled: (enabled: boolean) => void;
  setLabel: (label: string) => void;
  isEnabled: () => boolean;
  destroy: () => void;
}

const DISABLED_COLOR = 0x666666;

/**
 * Creates a touch-friendly button supporting mouse, touch, and optional keyboard activation.
 * Returns a handle for enabling/disabling and clean destruction.
 */
export function createTouchButton(
  scene: Phaser.Scene,
  options: TouchButtonOptions,
): TouchButtonHandle {
  const {
    x,
    y,
    label,
    width = UI.MENU_BUTTON_WIDTH,
    height = Math.max(MIN_TOUCH_TARGET, UI.MENU_BUTTON_HEIGHT),
    fontSize = UI.BUTTON_FONT_SIZE,
    onPress,
    enabled = true,
  } = options;

  const container = scene.add.container(x, y);

  const bg = scene.add
    .rectangle(0, 0, width, height, COLORS.BUTTON_NORMAL)
    .setInteractive({ useHandCursor: true });

  const text = scene.add
    .text(0, 0, label, {
      fontFamily: FONTS.PRIMARY,
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  container.add([bg, text]);

  let isEnabled = enabled;
  let isPressed = false;

  const applyVisual = (color: number): void => {
    bg.setFillStyle(color);
  };

  const setEnabled = (value: boolean): void => {
    isEnabled = value;
    if (value) {
      bg.setInteractive({ useHandCursor: true });
      applyVisual(COLORS.BUTTON_NORMAL);
      text.setAlpha(1);
    } else {
      bg.disableInteractive();
      applyVisual(DISABLED_COLOR);
      text.setAlpha(0.6);
      isPressed = false;
    }
  };

  const setLabel = (newLabel: string): void => {
    text.setText(newLabel);
  };

  const onPointerOver = (): void => {
    if (!isEnabled) return;
    applyVisual(COLORS.BUTTON_HOVER);
  };

  const onPointerOut = (): void => {
    if (!isEnabled) return;
    isPressed = false;
    applyVisual(COLORS.BUTTON_NORMAL);
  };

  const onPointerDown = (): void => {
    if (!isEnabled) return;
    isPressed = true;
    applyVisual(COLORS.BUTTON_PRESSED);
  };

  const onPointerUp = (): void => {
    if (!isEnabled || !isPressed) return;
    isPressed = false;
    applyVisual(COLORS.BUTTON_HOVER);
    onPress();
  };

  bg.on('pointerover', onPointerOver);
  bg.on('pointerout', onPointerOut);
  bg.on('pointerdown', onPointerDown);
  bg.on('pointerup', onPointerUp);

  if (!enabled) {
    setEnabled(false);
  }

  return {
    container,
    setEnabled,
    setLabel,
    isEnabled: () => isEnabled,
    destroy: () => {
      bg.off('pointerover', onPointerOver);
      bg.off('pointerout', onPointerOut);
      bg.off('pointerdown', onPointerDown);
      bg.off('pointerup', onPointerUp);
      container.destroy(true);
    },
  };
}

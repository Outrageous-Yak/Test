import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { getCharacterDisplayName } from '../data/characters';
import { getCarDisplayName } from '../data/cars';
import { GameState } from '../state/GameState';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { hasValidSelectedCharacter, hasValidSelectedCar } from '../utils/flowRecovery';

/**
 * Track Select Scene — Phase 3 placeholder.
 * Full track selection arrives in Phase 4.
 */
export class TrackSelectScene extends Phaser.Scene {
  private backButton!: TouchButtonHandle;
  private readonly isTransitioning = { value: false };
  private keyCooldown = false;

  constructor() {
    super({ key: SCENE_KEYS.TRACK_SELECT });
  }

  create(): void {
    if (!hasValidSelectedCharacter()) {
      fadeToScene(this, SCENE_KEYS.CHARACTER_SELECT, this.isTransitioning);
      return;
    }

    if (!hasValidSelectedCar()) {
      fadeToScene(this, SCENE_KEYS.CAR_SELECT, this.isTransitioning);
      return;
    }

    this.isTransitioning.value = false;
    this.keyCooldown = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_TOP, 0.2);

    this.add
      .text(width / 2, height * 0.22, 'CHOOSE YOUR TRACK', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.36, 'Track selection arrives in Phase 4', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.SUBTITLE_FONT_SIZE}px`,
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);

    const state = GameState.getState();
    const summary = [
      `Racer: ${getCharacterDisplayName(state.selectedCharacter)}`,
      `Car: ${getCarDisplayName(state.selectedCar)}`,
    ].join('\n');

    this.add
      .text(width / 2, height * 0.5, summary, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.PANEL_BODY_FONT_SIZE}px`,
        color: '#4ecdc4',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    this.backButton = createTouchButton(this, {
      x: width / 2,
      y: height * 0.72,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.goBack(),
    });

    this.input.keyboard?.on('keydown-ESC', this.onEscapeKey, this);
    fadeInScene(this);
  }

  shutdown(): void {
    this.backButton?.destroy();
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.CAR_SELECT, this.isTransitioning);
  }

  private readonly onEscapeKey = (): void => {
    if (this.keyCooldown || this.isTransitioning.value) return;
    this.keyCooldown = true;
    this.goBack();
    this.time.delayedCall(200, () => {
      this.keyCooldown = false;
    });
  };
}

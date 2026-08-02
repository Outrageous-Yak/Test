import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { getCharacterDisplayName } from '../data/characters';
import { getCarDisplayName } from '../data/cars';
import { getTrackById, getTrackDisplayName } from '../data/tracks';
import { GameState } from '../state/GameState';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import {
  hasValidSelectedCharacter,
  hasValidSelectedCar,
  hasValidSelectedTrack,
} from '../utils/flowRecovery';

/**
 * Race Loading Scene — Phase 4 placeholder before gameplay in Phase 5.
 */
export class RaceLoadingScene extends Phaser.Scene {
  private backButton!: TouchButtonHandle;
  private startButton!: TouchButtonHandle;
  private statusText!: Phaser.GameObjects.Text;
  private dotsText!: Phaser.GameObjects.Text;
  private dotsTimer?: Phaser.Time.TimerEvent;
  private readonly isTransitioning = { value: false };
  private keyCooldown = false;
  private startRaceCooldown = false;

  constructor() {
    super({ key: SCENE_KEYS.RACE_LOADING });
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

    if (!hasValidSelectedTrack()) {
      fadeToScene(this, SCENE_KEYS.TRACK_SELECT, this.isTransitioning);
      return;
    }

    this.isTransitioning.value = false;
    this.keyCooldown = false;
    this.startRaceCooldown = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_BOTTOM, 0.15);

    this.add
      .text(width / 2, height * 0.18, 'GET READY!', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.dotsText = this.add
      .text(width / 2, height * 0.28, 'Preparing', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#cccccc',
      })
      .setOrigin(0.5);

    let dotCount = 0;
    this.dotsTimer = this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        dotCount = (dotCount + 1) % 4;
        this.dotsText.setText(`Preparing${'.'.repeat(dotCount)}`);
      },
    });

    const state = GameState.getState();
    const track = getTrackById(state.selectedTrack!);
    const summary = [
      `Racer: ${getCharacterDisplayName(state.selectedCharacter)}`,
      `Car: ${getCarDisplayName(state.selectedCar)}`,
      `Track: ${getTrackDisplayName(state.selectedTrack)}`,
      `Laps: ${track.lapCount}`,
    ].join('\n');

    this.add
      .text(width / 2, height * 0.46, summary, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.PANEL_BODY_FONT_SIZE}px`,
        color: '#4ecdc4',
        fontStyle: 'bold',
        align: 'center',
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(width / 2, height * 0.66, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#ff6b35',
        align: 'center',
        wordWrap: { width: 500 },
      })
      .setOrigin(0.5);

    this.backButton = createTouchButton(this, {
      x: width / 2 - 180,
      y: height * 0.82,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.goBack(),
    });

    this.startButton = createTouchButton(this, {
      x: width / 2 + 180,
      y: height * 0.82,
      label: 'START RACE',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.onStartRace(),
    });

    this.input.keyboard?.on('keydown-ESC', this.onEscapeKey, this);
    this.input.keyboard?.on('keydown-ENTER', this.onEnterKey, this);
    fadeInScene(this);
  }

  shutdown(): void {
    this.dotsTimer?.remove();
    this.backButton?.destroy();
    this.startButton?.destroy();
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
    this.input.keyboard?.off('keydown-ENTER', this.onEnterKey, this);
  }

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.TRACK_SELECT, this.isTransitioning);
  }

  private onStartRace(): void {
    if (this.startRaceCooldown) return;
    this.startRaceCooldown = true;
    this.statusText.setText('Racing begins in Phase 5');
    this.time.delayedCall(500, () => {
      this.startRaceCooldown = false;
    });
  }

  private readonly onEscapeKey = (): void => {
    if (this.keyCooldown || this.isTransitioning.value) return;
    this.keyCooldown = true;
    this.goBack();
    this.time.delayedCall(200, () => {
      this.keyCooldown = false;
    });
  };

  private readonly onEnterKey = (): void => {
    if (this.keyCooldown || this.startRaceCooldown) return;
    this.keyCooldown = true;
    this.onStartRace();
    this.time.delayedCall(200, () => {
      this.keyCooldown = false;
    });
  };
}

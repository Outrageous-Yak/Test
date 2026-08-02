import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { createTrackCard, type TrackCardHandle } from '../ui/TrackCard';
import { TRACKS } from '../data/tracks';
import { getCharacterDisplayName } from '../data/characters';
import { getCarDisplayName } from '../data/cars';
import { parseTrackId } from '../data/tracks';
import { GameState } from '../state/GameState';
import type { TrackId } from '../state/gameStateTypes';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { triggerSelectionVibration } from '../utils/vibration';
import { hasValidSelectedCharacter, hasValidSelectedCar } from '../utils/flowRecovery';

/**
 * Track Select Scene — choose between Mango Meadows, Ruby Coast, and Volcano Rush.
 */
export class TrackSelectScene extends Phaser.Scene {
  private trackCards: TrackCardHandle[] = [];
  private backButton!: TouchButtonHandle;
  private continueButton!: TouchButtonHandle;
  private readonly isTransitioning = { value: false };
  private selectedId: TrackId | null = null;
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
    this.trackCards = [];
    this.keyCooldown = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_TOP, 0.2);

    this.add
      .text(width / 2, height * 0.07, 'CHOOSE YOUR TRACK', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const state = GameState.getState();
    const summary = `Racer: ${getCharacterDisplayName(state.selectedCharacter)} • Car: ${getCarDisplayName(state.selectedCar)}`;
    this.add
      .text(width / 2, height * 0.155, summary, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.SUBTITLE_FONT_SIZE}px`,
        color: '#4ecdc4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.resolveInitialSelection();
    this.createTrackCards(width, height);
    this.createButtons(width, height);
    this.setupKeyboardInput();
    this.updateContinueButton();
    fadeInScene(this);
  }

  shutdown(): void {
    this.trackCards.forEach((card) => card.destroy());
    this.backButton?.destroy();
    this.continueButton?.destroy();
    this.input.keyboard?.off('keydown-LEFT', this.onLeftKey, this);
    this.input.keyboard?.off('keydown-RIGHT', this.onRightKey, this);
    this.input.keyboard?.off('keydown-ENTER', this.onEnterKey, this);
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private resolveInitialSelection(): void {
    const stored = GameState.getState().selectedTrack;
    const parsed = parseTrackId(stored);

    if (parsed && GameState.isTrackUnlocked(parsed)) {
      this.selectedId = parsed;
    } else {
      this.selectedId = null;
      if (stored !== null) {
        GameState.setSelectedTrack(null);
      }
    }
  }

  private createTrackCards(width: number, height: number): void {
    const cardY = height * 0.48;
    const cardSpacing = 270;
    const startX = width / 2 - cardSpacing;

    TRACKS.forEach((track, index) => {
      const x = startX + index * cardSpacing;
      const locked = !GameState.isTrackUnlocked(track.id);
      const completed = GameState.isTrackCompleted(track.id);
      const status = locked ? 'locked' : completed ? 'complete' : 'unlocked';
      const bestTimeMs = GameState.getBestTime(track.id);

      const card = createTrackCard(this, {
        x,
        y: cardY,
        track,
        status,
        bestTimeMs,
        selected: this.selectedId === track.id,
        onSelect: (id) => this.selectTrack(id),
      });

      this.trackCards.push(card);
    });
  }

  private createButtons(width: number, height: number): void {
    const buttonY = height * 0.88;

    this.backButton = createTouchButton(this, {
      x: width / 2 - 180,
      y: buttonY,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.goBack(),
    });

    this.continueButton = createTouchButton(this, {
      x: width / 2 + 180,
      y: buttonY,
      label: 'CONTINUE',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      enabled: false,
      onPress: () => this.goContinue(),
    });
  }

  private getUnlockedTrackIds(): TrackId[] {
    return TRACKS.filter((track) => GameState.isTrackUnlocked(track.id)).map((track) => track.id);
  }

  private selectTrack(id: TrackId): void {
    if (this.isTransitioning.value || !GameState.isTrackUnlocked(id)) return;

    const saved = GameState.setSelectedTrack(id);
    if (!saved) return;

    this.selectedId = id;
    this.trackCards.forEach((card) => {
      card.setSelected(card.getTrackId() === id);
    });

    this.updateContinueButton();
    triggerSelectionVibration();
  }

  private selectAdjacentUnlocked(delta: number): void {
    const unlocked = this.getUnlockedTrackIds();
    if (unlocked.length === 0) return;

    const currentIndex = this.selectedId ? unlocked.indexOf(this.selectedId) : -1;
    let nextIndex = currentIndex + delta;

    if (nextIndex < 0) nextIndex = unlocked.length - 1;
    if (nextIndex >= unlocked.length) nextIndex = 0;

    this.selectTrack(unlocked[nextIndex]);
  }

  private updateContinueButton(): void {
    const valid =
      this.selectedId !== null && GameState.isTrackUnlocked(this.selectedId);
    this.continueButton.setEnabled(valid);
  }

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.CAR_SELECT, this.isTransitioning);
  }

  private goContinue(): void {
    if (!this.selectedId || !this.continueButton.isEnabled()) return;
    fadeToScene(this, SCENE_KEYS.RACE_LOADING, this.isTransitioning);
  }

  private setupKeyboardInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-LEFT', this.onLeftKey, this);
    this.input.keyboard.on('keydown-RIGHT', this.onRightKey, this);
    this.input.keyboard.on('keydown-ENTER', this.onEnterKey, this);
    this.input.keyboard.on('keydown-ESC', this.onEscapeKey, this);
  }

  private withKeyCooldown(action: () => void): void {
    if (this.keyCooldown || this.isTransitioning.value) return;
    this.keyCooldown = true;
    action();
    this.time.delayedCall(200, () => {
      this.keyCooldown = false;
    });
  }

  private readonly onLeftKey = (): void => {
    this.withKeyCooldown(() => this.selectAdjacentUnlocked(-1));
  };

  private readonly onRightKey = (): void => {
    this.withKeyCooldown(() => this.selectAdjacentUnlocked(1));
  };

  private readonly onEnterKey = (): void => {
    this.withKeyCooldown(() => {
      if (this.selectedId && this.continueButton.isEnabled()) {
        this.goContinue();
      }
    });
  };

  private readonly onEscapeKey = (): void => {
    this.withKeyCooldown(() => this.goBack());
  };
}

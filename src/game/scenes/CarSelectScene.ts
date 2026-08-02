import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { createCarCard, type CarCardHandle } from '../ui/CarCard';
import { CARS } from '../data/cars';
import { getCharacterDisplayName } from '../data/characters';
import { GameState } from '../state/GameState';
import type { CarId } from '../state/gameStateTypes';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { triggerSelectionVibration } from '../utils/vibration';
import { hasValidSelectedCharacter } from '../utils/flowRecovery';

/**
 * Car Select Scene — choose between Mango Car and Red Car.
 */
export class CarSelectScene extends Phaser.Scene {
  private carCards: CarCardHandle[] = [];
  private backButton!: TouchButtonHandle;
  private continueButton!: TouchButtonHandle;
  private readonly isTransitioning = { value: false };
  private selectedId: CarId | null = null;
  private keyCooldown = false;

  constructor() {
    super({ key: SCENE_KEYS.CAR_SELECT });
  }

  create(): void {
    if (!hasValidSelectedCharacter()) {
      fadeToScene(this, SCENE_KEYS.CHARACTER_SELECT, this.isTransitioning);
      return;
    }

    this.isTransitioning.value = false;
    this.carCards = [];
    this.keyCooldown = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_BOTTOM, 0.2);

    this.add
      .text(width / 2, height * 0.08, 'CHOOSE YOUR CAR', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const racerName = getCharacterDisplayName(GameState.getState().selectedCharacter);
    this.add
      .text(width / 2, height * 0.17, `Racer: ${racerName}`, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.SUBTITLE_FONT_SIZE}px`,
        color: '#4ecdc4',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.selectedId = GameState.getState().selectedCar;
    this.createCarCards(width, height);
    this.createButtons(width, height);
    this.setupKeyboardInput();
    this.updateContinueButton();
    fadeInScene(this);
  }

  shutdown(): void {
    this.carCards.forEach((card) => card.destroy());
    this.backButton?.destroy();
    this.continueButton?.destroy();
    this.input.keyboard?.off('keydown-LEFT', this.onLeftKey, this);
    this.input.keyboard?.off('keydown-RIGHT', this.onRightKey, this);
    this.input.keyboard?.off('keydown-ENTER', this.onEnterKey, this);
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private createCarCards(width: number, height: number): void {
    const cardY = height * 0.48;
    const cardSpacing = 340;
    const unlocked = GameState.getState().unlockedCars;

    CARS.forEach((car, index) => {
      const x = width / 2 + (index === 0 ? -cardSpacing / 2 : cardSpacing / 2);
      const locked = !unlocked.includes(car.id);

      const card = createCarCard(this, {
        x,
        y: cardY,
        car,
        locked,
        selected: this.selectedId === car.id,
        onSelect: (id) => this.selectCar(id),
      });

      this.carCards.push(card);
    });
  }

  private createButtons(width: number, height: number): void {
    const buttonY = height * 0.86;

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

  private selectCar(id: CarId): void {
    if (this.isTransitioning.value) return;

    const saved = GameState.setSelectedCar(id);
    if (!saved) return;

    this.selectedId = id;
    this.carCards.forEach((card) => {
      card.setSelected(card.getCarId() === id);
    });

    this.updateContinueButton();
    triggerSelectionVibration();
  }

  private updateContinueButton(): void {
    this.continueButton.setEnabled(this.selectedId !== null);
  }

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.CHARACTER_SELECT, this.isTransitioning);
  }

  private goContinue(): void {
    if (!this.selectedId || !this.continueButton.isEnabled()) return;
    fadeToScene(this, SCENE_KEYS.TRACK_SELECT, this.isTransitioning);
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
    this.withKeyCooldown(() => this.selectCar('mango-car'));
  };

  private readonly onRightKey = (): void => {
    this.withKeyCooldown(() => this.selectCar('red-car'));
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

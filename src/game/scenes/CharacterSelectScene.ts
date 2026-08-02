import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { createCharacterCard, type CharacterCardHandle } from '../ui/CharacterCard';
import { CHARACTERS } from '../data/characters';
import { GameState } from '../state/GameState';
import type { CharacterId } from '../state/gameStateTypes';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { triggerSelectionVibration } from '../utils/vibration';

/**
 * Character Select Scene — choose between Mango and Ruby.
 */
export class CharacterSelectScene extends Phaser.Scene {
  private characterCards: CharacterCardHandle[] = [];
  private backButton!: TouchButtonHandle;
  private continueButton!: TouchButtonHandle;
  private readonly isTransitioning = { value: false };
  private selectedId: CharacterId | null = null;
  private keyCooldown = false;

  constructor() {
    super({ key: SCENE_KEYS.CHARACTER_SELECT });
  }

  create(): void {
    this.isTransitioning.value = false;
    this.characterCards = [];
    this.keyCooldown = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_TOP, 0.25);

    this.add
      .text(width / 2, height * 0.1, 'CHOOSE YOUR RACER', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.selectedId = GameState.getState().selectedCharacter;
    this.createCharacterCards(width, height);
    this.createButtons(width, height);
    this.setupKeyboardInput();
    this.updateContinueButton();
    fadeInScene(this);
  }

  shutdown(): void {
    this.characterCards.forEach((card) => card.destroy());
    this.backButton.destroy();
    this.continueButton.destroy();
    this.input.keyboard?.off('keydown-LEFT', this.onLeftKey, this);
    this.input.keyboard?.off('keydown-RIGHT', this.onRightKey, this);
    this.input.keyboard?.off('keydown-ENTER', this.onEnterKey, this);
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private createCharacterCards(width: number, height: number): void {
    const cardY = height * 0.46;
    const cardSpacing = 340;
    const unlocked = GameState.getState().unlockedCharacters;

    CHARACTERS.forEach((character, index) => {
      const x = width / 2 + (index === 0 ? -cardSpacing / 2 : cardSpacing / 2);
      const locked = !unlocked.includes(character.id);

      const card = createCharacterCard(this, {
        x,
        y: cardY,
        character,
        locked,
        selected: this.selectedId === character.id,
        onSelect: (id) => this.selectCharacter(id),
      });

      this.characterCards.push(card);
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

  private selectCharacter(id: CharacterId): void {
    if (this.isTransitioning.value) return;

    this.selectedId = id;
    GameState.setSelectedCharacter(id);

    this.characterCards.forEach((card) => {
      card.setSelected(card.getCharacterId() === id);
    });

    this.updateContinueButton();
    triggerSelectionVibration();
  }

  private updateContinueButton(): void {
    this.continueButton.setEnabled(this.selectedId !== null);
  }

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.MAIN_MENU, this.isTransitioning);
  }

  private goContinue(): void {
    if (!this.selectedId || !this.continueButton.isEnabled()) return;
    fadeToScene(this, SCENE_KEYS.CAR_SELECT, this.isTransitioning);
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
    this.withKeyCooldown(() => this.selectCharacter('mango'));
  };

  private readonly onRightKey = (): void => {
    this.withKeyCooldown(() => this.selectCharacter('ruby'));
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

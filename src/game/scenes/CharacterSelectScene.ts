import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';

/**
 * Character Select Scene — Phase 1 placeholder.
 * Full character selection arrives in Phase 2.
 */
export class CharacterSelectScene extends Phaser.Scene {
  private backButton!: TouchButtonHandle;
  private isTransitioning = false;

  constructor() {
    super({ key: SCENE_KEYS.CHARACTER_SELECT });
  }

  create(): void {
    this.isTransitioning = false;
    const { width, height } = this.cameras.main;

    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);

    this.add
      .rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_TOP, 0.35);

    this.add
      .text(width / 2, height * 0.28, 'CHOOSE YOUR RACER', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.44, 'Character selection arrives in Phase 2', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.SUBTITLE_FONT_SIZE}px`,
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 600 },
      })
      .setOrigin(0.5);

    this.backButton = createTouchButton(this, {
      x: width / 2,
      y: height * 0.68,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.goBack(),
    });

    this.input.keyboard?.on('keydown-ESC', this.onEscapeKey, this);
  }

  shutdown(): void {
    this.backButton.destroy();
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private goBack(): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  private readonly onEscapeKey = (): void => {
    this.goBack();
  };
}

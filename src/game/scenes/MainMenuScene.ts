import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton } from '../ui/TouchButton';

/**
 * Main Menu Scene — temporary Phase 0 menu with title and START button.
 */
export class MainMenuScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.MAIN_MENU });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height * 0.3, 'Mango & Ruby Racing', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ff6b35',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.42, 'Project Setup Complete', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.SUBTITLE_FONT_SIZE}px`,
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(width / 2, height * 0.72, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '22px',
        color: '#e63946',
      })
      .setOrigin(0.5);

    this.startButton = createTouchButton(this, {
      x: width / 2,
      y: height * 0.58,
      label: 'START',
      width: UI.BUTTON_WIDTH,
      height: UI.BUTTON_HEIGHT,
      onPress: () => this.onStartPressed(),
    });

    this.setupKeyboardInput();
  }

  private setupKeyboardInput(): void {
    if (!this.input.keyboard) return;

    this.input.keyboard.on('keydown-ENTER', () => {
      this.onStartPressed();
    });
  }

  private onStartPressed(): void {
    this.statusText.setText('START pressed — ready for Phase 1!');

    const buttonBg = this.startButton.getAt(0) as Phaser.GameObjects.Rectangle;
    buttonBg.setFillStyle(COLORS.BUTTON_PRESSED);
  }
}

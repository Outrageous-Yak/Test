import Phaser from 'phaser';
import { COLORS, FONTS, GAME_HEIGHT, GAME_WIDTH, UI } from '../constants';
import { createTouchButton, type TouchButtonHandle } from './TouchButton';

export interface MenuPanelOptions {
  title: string;
  panelWidth?: number;
  panelHeight?: number;
  onClose: () => void;
}

/**
 * Reusable modal panel with dimmed overlay, title, content area, and BACK button.
 */
export class MenuPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly contentContainer: Phaser.GameObjects.Container;
  private readonly backButton: TouchButtonHandle;
  private readonly onClose: () => void;
  private open = false;

  constructor(scene: Phaser.Scene, options: MenuPanelOptions) {
    const {
      title,
      panelWidth = 720,
      panelHeight = 480,
      onClose,
    } = options;

    this.onClose = onClose;

    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT / 2;

    this.container = scene.add.container(0, 0).setDepth(100).setVisible(false);

    const overlay = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setInteractive();

    overlay.on('pointerdown', () => {
      // Consume clicks on the overlay so menu buttons underneath cannot fire
    });

    const panelBg = scene.add
      .rectangle(centerX, centerY, panelWidth, panelHeight, COLORS.PANEL_BG, 0.97)
      .setStrokeStyle(4, COLORS.SKY_BLUE, 0.8);

    const titleText = scene.add
      .text(centerX, centerY - panelHeight / 2 + 48, title, {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.PANEL_TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.contentContainer = scene.add.container(centerX, centerY - 20);

    this.backButton = createTouchButton(scene, {
      x: centerX,
      y: centerY + panelHeight / 2 - 52,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      fontSize: 28,
      onPress: () => this.close(),
    });

    this.container.add([
      overlay,
      panelBg,
      titleText,
      this.contentContainer,
      this.backButton.container,
    ]);
  }

  getContentContainer(): Phaser.GameObjects.Container {
    return this.contentContainer;
  }

  isOpen(): boolean {
    return this.open;
  }

  openPanel(): void {
    if (this.open) return;
    this.open = true;
    this.container.setVisible(true);
  }

  close(): void {
    if (!this.open) return;
    this.open = false;
    this.container.setVisible(false);
    this.onClose();
  }

  destroy(): void {
    this.backButton.destroy();
    this.container.destroy(true);
  }
}

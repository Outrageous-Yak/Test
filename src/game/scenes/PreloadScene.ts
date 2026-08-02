import Phaser from 'phaser';
import { SCENE_KEYS, COLORS } from '../constants';

/**
 * Preload Scene — loads game assets with placeholder loading locations.
 * Real assets will be added in future phases.
 */
export class PreloadScene extends Phaser.Scene {
  private loadingBar!: Phaser.GameObjects.Graphics;
  private loadingBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: SCENE_KEYS.PRELOAD });
  }

  preload(): void {
    this.createLoadingUI();
    this.setupLoadEvents();
    this.queuePlaceholderAssets();
  }

  create(): void {
    this.scene.start(SCENE_KEYS.MAIN_MENU);
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    this.loadingBox = this.add.graphics();
    this.loadingBox.fillStyle(0x222222, 0.8);
    this.loadingBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    this.loadingBar = this.add.graphics();

    this.loadingText = this.add
      .text(width / 2, height / 2 - 60, 'Loading...', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.percentText = this.add
      .text(width / 2, height / 2, '0%', {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        color: '#cccccc',
      })
      .setOrigin(0.5);
  }

  private setupLoadEvents(): void {
    this.load.on('progress', (value: number) => {
      this.percentText.setText(`${Math.round(value * 100)}%`);

      this.loadingBar.clear();
      this.loadingBar.fillStyle(COLORS.MANGO, 1);
      this.loadingBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 - 20,
        300 * value,
        30,
      );
    });

    this.load.on('complete', () => {
      this.loadingBar.destroy();
      this.loadingBox.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
    });
  }

  /**
   * Placeholder asset loading locations.
   * Uncomment and add real assets in future phases.
   */
  private queuePlaceholderAssets(): void {
    // ── Images (src/assets/images/) ─────────────────────────
    // this.load.image('car-mango', 'assets/images/car-mango.png');
    // this.load.image('car-ruby', 'assets/images/car-ruby.png');
    // this.load.image('track-01', 'assets/images/track-01.png');
    // this.load.spritesheet('explosion', 'assets/images/explosion.png', { frameWidth: 64, frameHeight: 64 });

    // ── Audio (src/assets/audio/) ───────────────────────────
    // this.load.audio('engine', 'assets/audio/engine.mp3');
    // this.load.audio('menu-music', 'assets/audio/menu-music.mp3');
    // this.load.audio('boost', 'assets/audio/boost.wav');

    // ── Fonts (src/assets/fonts/) ───────────────────────────
    // this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');

    // Phase 0: no assets to load — see ASSET_PATHS in constants.ts
  }
}

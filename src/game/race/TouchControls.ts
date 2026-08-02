import Phaser from 'phaser';
import { FONTS, GAME_HEIGHT, GAME_WIDTH, MIN_TOUCH_TARGET } from '../constants';

export interface RaceInput {
  steerLeft: boolean;
  steerRight: boolean;
  brake: boolean;
}

interface ControlButton {
  zone: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  active: boolean;
}

/**
 * On-screen race controls — LEFT / RIGHT (bottom-left), BRAKE (bottom-right).
 * Fixed to camera; supports hold-to-steer input.
 */
export class TouchControls {
  private readonly scene: Phaser.Scene;
  private readonly buttons: Record<'left' | 'right' | 'brake', ControlButton>;
  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard?.createCursorKeys();

    const btnW = 88;
    const btnH = Math.max(MIN_TOUCH_TARGET, 64);
    const margin = 36;
    const bottomY = GAME_HEIGHT - margin - btnH / 2;

    this.buttons = {
      left: this.createButton(margin + btnW / 2, bottomY, btnW, btnH, 'LEFT'),
      right: this.createButton(margin + btnW * 1.6, bottomY, btnW, btnH, 'RIGHT'),
      brake: this.createButton(GAME_WIDTH - margin - btnW / 2, bottomY, btnW, btnH, 'BRAKE'),
    };
  }

  getInput(): RaceInput {
    const keyboardLeft = this.cursors?.left.isDown ?? false;
    const keyboardRight = this.cursors?.right.isDown ?? false;
    const keyboardBrake = this.cursors?.down.isDown ?? false;

    return {
      steerLeft: this.buttons.left.active || keyboardLeft,
      steerRight: this.buttons.right.active || keyboardRight,
      brake: this.buttons.brake.active || keyboardBrake,
    };
  }

  setVisible(visible: boolean): void {
    Object.values(this.buttons).forEach((btn) => {
      btn.zone.setVisible(visible);
      btn.label.setVisible(visible);
    });
  }

  destroy(): void {
    Object.values(this.buttons).forEach((btn) => {
      btn.zone.destroy();
      btn.label.destroy();
    });
  }

  private createButton(
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
  ): ControlButton {
    const zone = this.scene.add
      .rectangle(x, y, w, h, 0x000000, 0.45)
      .setStrokeStyle(2, 0xffffff, 0.8)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: false });

    const label = this.scene.add
      .text(x, y, text, {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    const button: ControlButton = { zone, label, active: false };

    zone.on('pointerdown', () => {
      button.active = true;
      zone.setFillStyle(0xff6b35, 0.7);
    });

    const release = () => {
      button.active = false;
      zone.setFillStyle(0x000000, 0.45);
    };

    zone.on('pointerup', release);
    zone.on('pointerout', release);

    return button;
  }
}

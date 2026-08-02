import Phaser from 'phaser';
import { FONTS, GAME_HEIGHT, GAME_WIDTH, MIN_TOUCH_TARGET } from '../constants';
import { NudgePad } from './NudgePad';
import { HUD_INSETS } from './raceHudInsets';

export interface RaceInput {
  /** Analog steer -1 (left) to +1 (right). */
  steer: number;
  steerLeft: boolean;
  steerRight: boolean;
  brake: boolean;
}

/**
 * On-screen race controls — nudge pad (bottom-left), BRAKE (bottom-right).
 * Fixed to camera; supports hold-to-steer analog input plus keyboard fallback.
 */
export class TouchControls {
  private readonly scene: Phaser.Scene;
  private readonly nudgePad: NudgePad;
  private readonly brakeButton: {
    zone: Phaser.GameObjects.Rectangle;
    label: Phaser.GameObjects.Text;
    active: boolean;
  };
  private readonly cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private enabled = true;
  private dimmed = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard?.createCursorKeys();

    const padW = 168;
    const padH = 176;
    const btnW = 88;
    const btnH = Math.max(MIN_TOUCH_TARGET, 64);
    const margin = HUD_INSETS.LEFT;
    const bottomY = GAME_HEIGHT - HUD_INSETS.BOTTOM;

    this.nudgePad = new NudgePad(scene, {
      x: margin + padW / 2,
      y: bottomY - padH / 2,
      width: padW,
      height: padH,
      title: 'STEER',
    });

    const brakeY = bottomY - btnH / 2;
    this.brakeButton = this.createBrakeButton(
      GAME_WIDTH - margin - btnW / 2,
      brakeY,
      btnW,
      btnH,
    );
  }

  tick(deltaMs: number): void {
    this.nudgePad.tick(deltaMs);
  }

  getInput(): RaceInput {
    if (!this.enabled) {
      return { steer: 0, steerLeft: false, steerRight: false, brake: false };
    }

    const keyboardLeft = this.cursors?.left.isDown ?? false;
    const keyboardRight = this.cursors?.right.isDown ?? false;
    const keyboardBrake = this.cursors?.down.isDown ?? false;

    let steer = this.nudgePad.getSteer();
    if (keyboardLeft) steer = -1;
    if (keyboardRight) steer = 1;

    return {
      steer,
      steerLeft: steer < -0.05,
      steerRight: steer > 0.05,
      brake: this.brakeButton.active || keyboardBrake,
    };
  }

  setVisible(visible: boolean): void {
    this.nudgePad.setVisible(visible);
    this.brakeButton.zone.setVisible(visible);
    this.brakeButton.label.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearInput();
    }
    this.nudgePad.setEnabled(enabled);
    this.applyBrakeDimState();
  }

  setDimmed(dimmed: boolean): void {
    this.dimmed = dimmed;
    this.nudgePad.setDimmed(dimmed);
    this.applyBrakeDimState();
  }

  clearInput(): void {
    this.nudgePad.clearInput();
    this.brakeButton.active = false;
    this.brakeButton.zone.setFillStyle(0x000000, 0.45);
  }

  destroy(): void {
    this.nudgePad.destroy();
    this.brakeButton.zone.destroy();
    this.brakeButton.label.destroy();
  }

  private applyBrakeDimState(): void {
    const alpha = !this.enabled || this.dimmed ? 0.4 : 1;
    this.brakeButton.zone.setAlpha(alpha);
    this.brakeButton.label.setAlpha(alpha);
    if (!this.enabled) {
      this.brakeButton.zone.disableInteractive();
    } else {
      this.brakeButton.zone.setInteractive({ useHandCursor: false });
    }
  }

  private createBrakeButton(
    x: number,
    y: number,
    w: number,
    h: number,
  ): { zone: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text; active: boolean } {
    const zone = this.scene.add
      .rectangle(x, y, w, h, 0x000000, 0.45)
      .setStrokeStyle(2, 0xffffff, 0.8)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive({ useHandCursor: false });

    const label = this.scene.add
      .text(x, y, 'BRAKE', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);

    const button = { zone, label, active: false };

    zone.on('pointerdown', () => {
      if (!this.enabled) return;
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

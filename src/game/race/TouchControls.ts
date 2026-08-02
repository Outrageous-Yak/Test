import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { NudgePad } from './NudgePad';
import {
  buildRaceInputFromIntent,
  createReverseLatchState,
  type ReverseLatchState,
} from './nudgePadLogic';
import { buildKeyboardIntent, mergeDriveIntents } from './touchControlsLogic';
import type { DriveIntent, RaceInput } from './raceInput';
import { ZERO_DRIVE_INTENT, ZERO_RACE_INPUT } from './raceInput';
import { HUD_INSETS } from './raceHudInsets';

export type { RaceInput } from './raceInput';

const PAD_WIDTH = 176;
const PAD_HEIGHT = 188;

/**
 * Sole touch driving control — bottom-right nudge pad with WASD / arrow fallback.
 */
export class TouchControls {
  private readonly nudgePad: NudgePad;
  private readonly keys: {
    forward: Phaser.Input.Keyboard.Key;
    backward: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    upArrow: Phaser.Input.Keyboard.Key;
    downArrow: Phaser.Input.Keyboard.Key;
    leftArrow: Phaser.Input.Keyboard.Key;
    rightArrow: Phaser.Input.Keyboard.Key;
  };
  private enabled = true;
  private dimmed = false;
  private reverseLatch: ReverseLatchState = createReverseLatchState();

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('TouchControls requires a keyboard plugin for desktop fallback');
    }

    this.keys = {
      forward: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      backward: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      upArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      downArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      leftArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      rightArrow: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };

    const margin = HUD_INSETS.RIGHT;
    const bottom = GAME_HEIGHT - HUD_INSETS.BOTTOM;

    this.nudgePad = new NudgePad(scene, {
      x: GAME_WIDTH - margin - PAD_WIDTH / 2,
      y: bottom - PAD_HEIGHT / 2,
      width: PAD_WIDTH,
      height: PAD_HEIGHT,
      title: 'DRIVE',
    });
  }

  tick(signedSpeed: number): void {
    const intent = this.getDriveIntent();
    this.nudgePad.updateActionLabel(intent, signedSpeed, this.reverseLatch);
  }

  getInput(signedSpeed: number): RaceInput {
    if (!this.enabled) {
      return { ...ZERO_RACE_INPUT };
    }

    const intent = this.getDriveIntent();
    const built = buildRaceInputFromIntent(intent, signedSpeed, this.reverseLatch);
    this.reverseLatch = built.latch;
    return built.input;
  }

  getDriveIntent(): DriveIntent {
    if (!this.enabled) {
      return { ...ZERO_DRIVE_INTENT };
    }

    return mergeDriveIntents(this.nudgePad.getDriveIntent(), this.keyboardIntent());
  }

  setVisible(visible: boolean): void {
    this.nudgePad.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clearInput();
    }
    this.nudgePad.setEnabled(enabled);
    this.nudgePad.setDimmed(this.dimmed);
  }

  setDimmed(dimmed: boolean): void {
    this.dimmed = dimmed;
    this.nudgePad.setDimmed(dimmed);
  }

  clearInput(): void {
    this.nudgePad.clearInput();
    this.reverseLatch = createReverseLatchState();
  }

  destroy(): void {
    this.nudgePad.destroy();
  }

  private keyboardIntent(): DriveIntent {
    return buildKeyboardIntent({
      forward: this.keys.forward.isDown || this.keys.upArrow.isDown,
      backward: this.keys.backward.isDown || this.keys.downArrow.isDown,
      left: this.keys.left.isDown || this.keys.leftArrow.isDown,
      right: this.keys.right.isDown || this.keys.rightArrow.isDown,
    });
  }
}

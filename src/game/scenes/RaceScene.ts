import Phaser from 'phaser';
import { SCENE_KEYS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getCarById } from '../data/cars';
import { GameState } from '../state/GameState';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import {
  hasValidSelectedCharacter,
  hasValidSelectedCar,
  hasValidSelectedTrack,
} from '../utils/flowRecovery';
import { CameraController } from '../race/CameraController';
import { PlayerCar } from '../race/PlayerCar';
import { TouchControls } from '../race/TouchControls';
import { TrackRenderer } from '../race/TrackRenderer';

/**
 * Race Scene — first playable Mango Meadows prototype (Phase 5).
 */
export class RaceScene extends Phaser.Scene {
  private trackRenderer?: TrackRenderer;
  private player?: PlayerCar;
  private cameraController?: CameraController;
  private touchControls?: TouchControls;
  private pauseButton?: TouchButtonHandle;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private resumeButton?: TouchButtonHandle;
  private restartButton?: TouchButtonHandle;
  private mainMenuButton?: TouchButtonHandle;
  private debugText?: Phaser.GameObjects.Text;
  private debugEnabled = false;
  private paused = false;
  private readonly isTransitioning = { value: false };
  private debugKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({
      key: SCENE_KEYS.RACE,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    });
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

    if (!hasValidSelectedTrack()) {
      fadeToScene(this, SCENE_KEYS.TRACK_SELECT, this.isTransitioning);
      return;
    }

    this.isTransitioning.value = false;
    this.paused = false;
    this.debugEnabled = false;

    this.trackRenderer = new TrackRenderer(this);
    const track = this.trackRenderer.buildMangoMeadows();

    this.physics.world.setBounds(0, 0, track.worldWidth, track.worldHeight);

    const state = GameState.getState();
    const carDef = getCarById(state.selectedCar!);
    this.player = new PlayerCar(
      this,
      track.startX,
      track.startY,
      track.startAngle,
      carDef.primaryColor,
    );

    this.physics.add.collider(this.player.getGameObject(), track.barriers, () => {
      this.player?.onBarrierHit();
    });

    this.cameraController = new CameraController(this, this.player);
    this.touchControls = new TouchControls(this);

    this.createPauseUi();
    this.createDebugHud();

    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    fadeInScene(this);
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.touchControls || !this.cameraController) return;

    if (Phaser.Input.Keyboard.JustDown(this.debugKey!)) {
      this.toggleDebug();
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey!) && !this.paused) {
      this.setPaused(true);
    }

    if (this.paused) return;

    const input = this.touchControls.getInput();
    this.player.update(delta, input);
    this.cameraController.update();

    if (this.debugEnabled && this.debugText) {
      const fps = Math.round(this.game.loop.actualFps);
      const speed = Math.round(this.player.getSpeed());
      this.debugText.setText(`Speed: ${speed}\nFPS: ${fps}\nDebug: ON`);
    }
  }

  shutdown(): void {
    this.pauseButton?.destroy();
    this.resumeButton?.destroy();
    this.restartButton?.destroy();
    this.mainMenuButton?.destroy();
    this.pauseOverlay?.destroy();
    this.debugText?.destroy();
    this.touchControls?.destroy();
    this.player?.destroy();
    this.trackRenderer?.destroy();
    this.cameraController = undefined;
  }

  private createPauseUi(): void {
    const margin = 24;
    this.pauseButton = createTouchButton(this, {
      x: GAME_WIDTH - margin - 60,
      y: margin + 28,
      label: 'PAUSE',
      width: 120,
      height: 48,
      fontSize: 18,
      onPress: () => this.setPaused(true),
    });
    this.pauseButton.container.setScrollFactor(0).setDepth(2000);

    this.pauseOverlay = this.add.container(0, 0).setScrollFactor(0).setDepth(3000).setVisible(false);

    const backdrop = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65)
      .setScrollFactor(0);

    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'PAUSED', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '48px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.resumeButton = createTouchButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.46,
      label: 'RESUME',
      width: 280,
      height: 52,
      onPress: () => this.setPaused(false),
    });
    this.restartButton = createTouchButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.58,
      label: 'RESTART RACE',
      width: 280,
      height: 52,
      onPress: () => this.restartRace(),
    });
    this.mainMenuButton = createTouchButton(this, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.7,
      label: 'MAIN MENU',
      width: 280,
      height: 52,
      onPress: () => this.goMainMenu(),
    });

    [this.resumeButton, this.restartButton, this.mainMenuButton].forEach((btn) => {
      btn.container.setScrollFactor(0);
    });

    this.pauseOverlay.add([
      backdrop,
      title,
      this.resumeButton.container,
      this.restartButton.container,
      this.mainMenuButton.container,
    ]);
  }

  private createDebugHud(): void {
    this.debugText = this.add
      .text(16, 16, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1500)
      .setVisible(false);
  }

  private toggleDebug(): void {
    this.debugEnabled = !this.debugEnabled;
    this.debugText?.setVisible(this.debugEnabled);
  }

  private setPaused(value: boolean): void {
    this.paused = value;
    this.pauseOverlay?.setVisible(value);
    this.touchControls?.setVisible(!value);
    this.pauseButton?.container.setVisible(!value);

    if (value) {
      this.physics.pause();
    } else {
      this.physics.resume();
    }
  }

  private restartRace(): void {
    this.setPaused(false);
    this.player?.resetToSpawn();
    this.cameraController?.resetFollow();
  }

  private goMainMenu(): void {
    if (this.isTransitioning.value) return;
    fadeToScene(this, SCENE_KEYS.MAIN_MENU, this.isTransitioning);
  }
}

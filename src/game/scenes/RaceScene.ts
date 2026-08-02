import Phaser from 'phaser';
import { SCENE_KEYS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getCarById } from '../data/cars';
import { getCharacterDisplayName } from '../data/characters';
import { getTrackById, getTrackDisplayName } from '../data/tracks';
import { GameState } from '../state/GameState';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { CameraController } from '../race/CameraController';
import { CheckpointSystem } from '../race/CheckpointSystem';
import { CountdownController } from '../race/CountdownController';
import { PlayerCar } from '../race/PlayerCar';
import { RaceHud } from '../race/RaceHud';
import { RaceManager } from '../race/RaceManager';
import { RaceMessageController } from '../race/RaceMessageController';
import { RaceResultsPanel } from '../race/RaceResultsPanel';
import { TouchControls } from '../race/TouchControls';
import { TrackRenderer } from '../race/TrackRenderer';
import { HUD_INSETS } from '../race/raceHudInsets';
import { getRaceLaunchRedirectScene } from '../race/raceValidation';
import type { RacePhase } from '../race/raceTypes';

/**
 * Race Scene — Mango Meadows time-trial with countdown, checkpoints, laps, and finish state.
 */
export class RaceScene extends Phaser.Scene {
  private trackRenderer?: TrackRenderer;
  private player?: PlayerCar;
  private cameraController?: CameraController;
  private touchControls?: TouchControls;
  private checkpointSystem?: CheckpointSystem;
  private raceManager?: RaceManager;
  private countdown?: CountdownController;
  private raceHud?: RaceHud;
  private messages?: RaceMessageController;
  private resultsPanel?: RaceResultsPanel;
  private pauseButton?: TouchButtonHandle;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private resumeButton?: TouchButtonHandle;
  private restartButton?: TouchButtonHandle;
  private mainMenuButton?: TouchButtonHandle;
  private debugText?: Phaser.GameObjects.Text;
  private debugEnabled = false;
  private readonly isTransitioning = { value: false };
  private debugKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private visibilityHandler?: () => void;
  private totalLaps = 3;
  private finishDelayTimer?: Phaser.Time.TimerEvent;

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
    const redirect = getRaceLaunchRedirectScene();
    if (redirect) {
      fadeToScene(this, redirect, this.isTransitioning);
      return;
    }

    this.isTransitioning.value = false;
    this.debugEnabled = false;

    const state = GameState.getState();
    const trackDef = getTrackById(state.selectedTrack!);
    this.totalLaps = trackDef.lapCount;

    this.trackRenderer = new TrackRenderer(this);
    const track = this.trackRenderer.buildMangoMeadows();

    this.physics.world.setBounds(0, 0, track.worldWidth, track.worldHeight);

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

    this.raceManager = new RaceManager(this.totalLaps, track.checkpoints);
    this.raceManager.setSpawn(track.startX, track.startY);

    this.checkpointSystem = new CheckpointSystem(this);
    this.checkpointSystem.build(track.checkpoints);
    this.checkpointSystem.onEnter = (index) => this.onCheckpointEnter(index);
    this.checkpointSystem.onExit = (index) => this.raceManager?.handleCheckpointExit(index);

    this.cameraController = new CameraController(this, this.player);
    this.touchControls = new TouchControls(this);
    this.countdown = new CountdownController(this);
    this.raceHud = new RaceHud(this);
    this.messages = new RaceMessageController(this);
    this.resultsPanel = new RaceResultsPanel(this);
    this.resultsPanel.setCallbacks(
      () => this.restartRace(),
      () => this.goMainMenu(),
    );

    this.createPauseUi();
    this.createDebugHud();
    this.setupInput();
    this.setupVisibilityHandler();

    this.lockDriving();
    this.raceManager.beginCountdown();
    this.startCountdown();
    fadeInScene(this);
  }

  update(_time: number, delta: number): void {
    if (!this.player || !this.touchControls || !this.cameraController || !this.raceManager) return;

    if (Phaser.Input.Keyboard.JustDown(this.debugKey!)) {
      this.toggleDebug();
    }

    const phase = this.raceManager.getProgress().phase;

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey!) && phase !== 'countdown' && phase !== 'finished') {
      this.setPaused(true);
    }

    if (phase === 'paused') return;

    const carObj = this.player.getGameObject();
    const velocity = this.player.getVelocity();

    const managerUpdate = this.raceManager.update(
      delta,
      carObj.x,
      carObj.y,
      velocity.x,
      velocity.y,
      this.player.getRotation(),
    );

    this.checkpointSystem?.setEnabled(managerUpdate.canProcessCheckpoints);
    if (managerUpdate.canProcessCheckpoints) {
      this.checkpointSystem?.update(carObj.x, carObj.y);
    }

    this.updateWrongWayMessage(managerUpdate.wrongWay.active);

    const progress = this.raceManager.getProgress();
    this.updateHud(progress.phase, progress.currentLap, progress.totalLaps, progress.elapsedTimeMs);
    this.updateDebug(progress.phase);

    if (phase === 'countdown') {
      this.player.resetToSpawn();
      this.cameraController.resetFollow();
      return;
    }

    if (phase === 'finished') {
      this.player.coastToStop(delta);
      this.cameraController.update();
      return;
    }

    if (phase === 'racing') {
      const input = this.touchControls.getInput();
      this.player.update(delta, input);
      this.cameraController.update();
    }
  }

  shutdown(): void {
    this.finishDelayTimer?.remove();
    this.countdown?.cancel();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = undefined;
    }
    this.pauseButton?.destroy();
    this.resumeButton?.destroy();
    this.restartButton?.destroy();
    this.mainMenuButton?.destroy();
    this.pauseOverlay?.destroy();
    this.debugText?.destroy();
    this.resultsPanel?.destroy();
    this.messages?.destroy();
    this.raceHud?.destroy();
    this.countdown?.destroy();
    this.checkpointSystem?.destroy();
    this.touchControls?.destroy();
    this.player?.destroy();
    this.trackRenderer?.destroy();
    this.cameraController = undefined;
    this.raceManager = undefined;
  }

  private setupInput(): void {
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private setupVisibilityHandler(): void {
    this.visibilityHandler = () => {
      if (document.hidden) {
        const phase = this.raceManager?.getProgress().phase;
        if (phase === 'racing' || phase === 'countdown') {
          this.touchControls?.clearInput();
          if (phase === 'racing') {
            this.setPaused(true);
          } else {
            this.countdown?.cancel();
            this.lockDriving();
            this.startCountdown();
          }
        }
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private startCountdown(): void {
    this.countdown?.start({
      onStep: () => {
        this.lockDriving();
      },
      onGo: () => {
        this.unlockDriving();
        this.raceManager?.onGo();
      },
      onComplete: () => {
        // Countdown display handles GO visibility
      },
    });
  }

  private onCheckpointEnter(index: number): void {
    const event = this.raceManager?.handleCheckpointEnter(index);
    if (!event) return;

    if (event.type === 'missed_checkpoint' && this.raceManager?.consumeMissedMessage()) {
      this.messages?.show('checkpoint_missed');
    } else if (event.type === 'race_completed') {
      this.onRaceFinished();
    }
  }

  private onRaceFinished(): void {
    this.lockDriving();
    this.messages?.show('finish');
    this.touchControls?.setVisible(false);
    this.pauseButton?.container.setVisible(false);

    const progress = this.raceManager!.getProgress();
    const state = GameState.getState();

    this.finishDelayTimer?.remove();
    this.finishDelayTimer = this.time.delayedCall(1200, () => {
      this.resultsPanel?.show({
        trackName: getTrackDisplayName(state.selectedTrack),
        racerName: getCharacterDisplayName(state.selectedCharacter),
        carName: getCarById(state.selectedCar!).name,
        finalTimeMs: progress.finalTimeMs ?? progress.elapsedTimeMs,
        totalLaps: progress.totalLaps,
      });
    });
  }

  private updateWrongWayMessage(active: boolean): void {
    if (active) {
      this.messages?.show('wrong_way');
    } else if (this.messages?.isShowing('wrong_way')) {
      this.messages.hide('wrong_way');
    }
  }

  private updateHud(
    phase: RacePhase,
    currentLap: number,
    totalLaps: number,
    elapsedMs: number,
  ): void {
    const showHud = phase === 'racing' || phase === 'paused' || phase === 'finished';
    this.raceHud?.update(currentLap, totalLaps, elapsedMs, showHud);
    const dimmed = phase === 'paused' || phase === 'countdown' || phase === 'finished';
    this.raceHud?.setDimmed(dimmed);
  }

  private updateDebug(phase: RacePhase): void {
    if (!this.debugEnabled || !this.debugText || !this.raceManager || !this.player) return;

    const progress = this.raceManager.getProgress();
    const cp = this.raceManager.getCheckpointProgress();
    const fps = Math.round(this.game.loop.actualFps);
    const speed = Math.round(this.player.getSpeed());

    this.debugText.setText(
      [
        `Phase: ${phase}`,
        `Lap: ${progress.currentLap}/${progress.totalLaps}`,
        `Expected CP: ${cp.nextCheckpointIndex}`,
        `Time: ${progress.elapsedTimeMs.toFixed(0)}ms`,
        `Speed: ${speed}`,
        `FPS: ${fps}`,
        'Debug: ON',
      ].join('\n'),
    );
    this.checkpointSystem?.setDebugVisible(true);
  }

  private lockDriving(): void {
    this.player?.setInputEnabled(false);
    this.player?.stop();
    this.touchControls?.setEnabled(false);
    this.touchControls?.setDimmed(true);
    this.pauseButton?.setEnabled(false);
  }

  private unlockDriving(): void {
    this.player?.setInputEnabled(true);
    this.touchControls?.setEnabled(true);
    this.touchControls?.setDimmed(false);
    this.pauseButton?.setEnabled(true);
  }

  private createPauseUi(): void {
    this.pauseButton = createTouchButton(this, {
      x: GAME_WIDTH - HUD_INSETS.RIGHT - 60,
      y: HUD_INSETS.TOP + 28,
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
      .text(HUD_INSETS.LEFT, HUD_INSETS.TOP + 56, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '16px',
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
    if (!this.debugEnabled) {
      this.checkpointSystem?.setDebugVisible(false);
    }
  }

  private setPaused(value: boolean): void {
    const phase = this.raceManager?.getProgress().phase;
    if (phase === 'countdown' || phase === 'finished') return;

    if (value) {
      this.raceManager?.pause();
      this.touchControls?.clearInput();
      this.touchControls?.setEnabled(false);
      this.checkpointSystem?.setEnabled(false);
      this.pauseOverlay?.setVisible(true);
      this.pauseButton?.container.setVisible(false);
      this.physics.pause();
    } else {
      this.raceManager?.resume();
      this.touchControls?.setEnabled(true);
      this.checkpointSystem?.setEnabled(true);
      this.pauseOverlay?.setVisible(false);
      this.pauseButton?.container.setVisible(true);
      this.physics.resume();
    }
  }

  private restartRace(): void {
    this.finishDelayTimer?.remove();
    this.countdown?.cancel();
    this.messages?.reset();
    this.resultsPanel?.hide();
    this.pauseOverlay?.setVisible(false);
    this.pauseButton?.container.setVisible(true);
    this.touchControls?.setVisible(true);
    this.physics.resume();

    this.raceManager?.reset(this.totalLaps);
    this.raceManager?.beginCountdown();
    this.checkpointSystem?.reset();
    this.raceHud?.reset();

    this.player?.resetToSpawn();
    this.cameraController?.resetFollow();

    this.lockDriving();
    this.startCountdown();
  }

  private goMainMenu(): void {
    if (this.isTransitioning.value) return;
    this.countdown?.cancel();
    this.touchControls?.clearInput();
    fadeToScene(this, SCENE_KEYS.MAIN_MENU, this.isTransitioning);
  }
}

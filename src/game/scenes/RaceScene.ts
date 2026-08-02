import Phaser from 'phaser';
import { SCENE_KEYS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getCarById } from '../data/cars';
import { getTrackDisplayName } from '../data/tracks';
import { GameState } from '../state/GameState';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';
import { AiRacer } from '../race/AiRacer';
import { CameraController } from '../race/CameraController';
import { CheckpointSystem } from '../race/CheckpointSystem';
import { CountdownController } from '../race/CountdownController';
import { RaceHud } from '../race/RaceHud';
import { RaceMessageController } from '../race/RaceMessageController';
import { RaceParticipantManager } from '../race/RaceParticipantManager';
import { RaceResultsPanel } from '../race/RaceResultsPanel';
import { TouchControls } from '../race/TouchControls';
import { HUD_INSETS } from '../race/raceHudInsets';
import { getRaceLaunchRedirectScene } from '../race/raceValidation';
import { loadSelectedPlayableTrack } from '../race/tracks/TrackLoader';
import type { PlayableTrackDefinition, TrackBuildResult } from '../race/tracks/trackTypes';
import type { RacePhase, RacerId } from '../race/raceTypes';

const RACER_COUNT = 4;

/**
 * Race Scene — four-racer event loaded from the active playable track definition.
 */
export class RaceScene extends Phaser.Scene {
  private playableTrack?: PlayableTrackDefinition;
  private trackBuild?: TrackBuildResult;
  private participantManager?: RaceParticipantManager;
  private cameraController?: CameraController;
  private touchControls?: TouchControls;
  private checkpointSystem?: CheckpointSystem;
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
  private debugGraphics?: Phaser.GameObjects.Graphics;
  private debugEnabled = false;
  private readonly isTransitioning = { value: false };
  private debugKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;
  private visibilityHandler?: () => void;
  private totalLaps = 3;
  private resultsDelayTimer?: Phaser.Time.TimerEvent;
  private resultsShown = false;
  private carColliders: Phaser.Physics.Arcade.Collider[] = [];

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

    const loaded = loadSelectedPlayableTrack();
    if (!loaded) {
      fadeToScene(this, SCENE_KEYS.TRACK_SELECT, this.isTransitioning);
      return;
    }

    this.playableTrack = loaded.definition;
    const raceData = loaded.definition.raceData;
    this.totalLaps = loaded.definition.lapCount;
    const carDef = getCarById(GameState.getState().selectedCar!);

    this.trackBuild = loaded.definition.build(this);
    const track = this.trackBuild;

    this.physics.world.setBounds(0, 0, track.worldWidth, track.worldHeight);

    this.participantManager = new RaceParticipantManager(
      this,
      raceData,
      this.totalLaps,
      carDef.primaryColor,
    );

    const cars = this.participantManager.getAllCars();
    cars.forEach((car) => {
      this.physics.add.collider(car.getGameObject(), track.barriers, () => {
        car.onBarrierHit();
      });
    });

    for (let i = 0; i < cars.length; i += 1) {
      for (let j = i + 1; j < cars.length; j += 1) {
        const collider = this.physics.add.collider(
          cars[i].getGameObject(),
          cars[j].getGameObject(),
          undefined,
          undefined,
          this,
        );
        this.carColliders.push(collider);
      }
    }

    this.checkpointSystem = new CheckpointSystem(this);
    this.checkpointSystem.build(track.checkpoints);
    this.checkpointSystem.onEnter = (racerId, index) => this.onCheckpointEnter(racerId, index);
    this.checkpointSystem.onExit = (racerId, index) =>
      this.participantManager?.handleCheckpointExit(racerId, index);

    this.cameraController = new CameraController(
      this,
      this.participantManager.getPlayerCar(),
      track.worldWidth,
      track.worldHeight,
      loaded.definition.camera,
    );
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

    this.participantManager.lockAllDriving();
    this.participantManager.beginCountdown();
    this.startCountdown();
    fadeInScene(this);
  }

  update(_time: number, delta: number): void {
    if (!this.participantManager || !this.touchControls || !this.cameraController) return;

    if (Phaser.Input.Keyboard.JustDown(this.debugKey!)) {
      this.toggleDebug();
    }

    const phase = this.participantManager.getPhase();

    if (
      Phaser.Input.Keyboard.JustDown(this.pauseKey!) &&
      phase !== 'countdown' &&
      phase !== 'finished'
    ) {
      this.setPaused(true);
    }

    if (phase === 'paused') return;

    const player = this.participantManager.getPlayerParticipant();
    const input = this.touchControls.getInput();
    const updateResult = this.participantManager.update(delta, input);

    this.checkpointSystem?.setEnabled(updateResult.canProcessCheckpoints);
    if (updateResult.canProcessCheckpoints) {
      this.participantManager.getParticipants().forEach((p) => {
        this.checkpointSystem?.updateRacer(p.id, p.car.getX(), p.car.getY());
      });
    }

    this.updateWrongWayMessage(updateResult.playerWrongWay);
    this.updateHud(phase, player, updateResult.playerFinished);
    this.updateDebug(phase);

    if (this.participantManager.shouldShowResults() && !this.resultsShown) {
      this.showResultsIfNeeded();
    }

    if (phase === 'countdown') {
      this.participantManager.getParticipants().forEach((p) => {
        p.car.resetToPose(p.spawn.x, p.spawn.y, p.spawn.rotation);
      });
      this.cameraController.resetFollow();
      return;
    }

    if (phase === 'finished' || phase === 'post_player_finish') {
      this.cameraController.update();
      return;
    }

    if (phase === 'racing') {
      this.cameraController.update();
    }
  }

  shutdown(): void {
    this.resultsDelayTimer?.remove();
    this.countdown?.cancel();
    this.carColliders.forEach((c) => c.destroy());
    this.carColliders = [];
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
    this.debugGraphics?.destroy();
    this.resultsPanel?.destroy();
    this.messages?.destroy();
    this.raceHud?.destroy();
    this.countdown?.destroy();
    this.checkpointSystem?.destroy();
    this.touchControls?.destroy();
    this.participantManager?.destroy();
    this.trackBuild?.destroyGraphics?.();
    this.trackBuild?.barriers.clear(true, true);
    this.trackBuild = undefined;
    this.playableTrack = undefined;
    this.cameraController = undefined;
    this.participantManager = undefined;
  }

  private setupInput(): void {
    this.debugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.pauseKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  }

  private setupVisibilityHandler(): void {
    this.visibilityHandler = () => {
      if (!document.hidden) return;
      const phase = this.participantManager?.getPhase();
      if (phase === 'racing' || phase === 'post_player_finish') {
        this.touchControls?.clearInput();
        this.setPaused(true);
      } else if (phase === 'countdown') {
        this.countdown?.cancel();
        this.participantManager?.lockAllDriving();
        this.startCountdown();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private startCountdown(): void {
    this.countdown?.start({
      onStep: () => {
        this.participantManager?.lockAllDriving();
      },
      onGo: () => {
        GameState.recordRaceStarted();
        this.participantManager?.onGo();
      },
      onComplete: () => undefined,
    });
  }

  private onCheckpointEnter(racerId: RacerId, index: number): void {
    const event = this.participantManager?.handleCheckpointEnter(racerId, index);
    if (!event) return;

    if (event.type === 'missed_checkpoint' && racerId === 'player') {
      if (this.participantManager?.consumePlayerMissedMessage()) {
        this.messages?.show('checkpoint_missed');
      }
    }

    if (event.type === 'racer_finished' && racerId === 'player') {
      this.onPlayerFinished();
    }
  }

  private onPlayerFinished(): void {
    this.touchControls?.setEnabled(false);
    this.touchControls?.setDimmed(true);
    this.messages?.show('finish');
    this.pauseButton?.container.setVisible(false);
  }

  private showResultsIfNeeded(): void {
    if (!this.participantManager || this.resultsShown) return;
    const results = this.participantManager.getResults();
    if (results.length < RACER_COUNT) return;

    this.resultsShown = true;
    this.resultsDelayTimer?.remove();
    const phase = this.participantManager.getPhase();
    const delay = phase === 'post_player_finish' ? 800 : 1200;

    this.resultsDelayTimer = this.time.delayedCall(delay, () => {
      const state = GameState.getState();
      const playerResult = results.find((r) => r.isPlayer);
      let career;

      if (playerResult && state.selectedTrack) {
        const outcome = GameState.recordRaceResult({
          trackId: state.selectedTrack,
          playerPosition: playerResult.position,
          finishTimeMs: playerResult.finishTimeMs,
          fastestLapMs: this.participantManager?.getPlayerFastestLapMs() ?? null,
          didFinish: playerResult.status === 'finished',
        });

        career = {
          playerPosition: playerResult.position,
          finishTimeMs: playerResult.finishTimeMs,
          bestTimeMs: outcome.bestTimeMs,
          coinsEarned: outcome.coinsEarned,
          isNewRecord: outcome.isNewRecord,
          trackUnlocked: outcome.trackUnlocked,
          trackMarkedComplete: outcome.trackMarkedComplete,
          careerComplete: outcome.careerComplete,
          trackId: state.selectedTrack,
        };
      }

      this.resultsPanel?.show({
        trackName: getTrackDisplayName(state.selectedTrack),
        results,
        career,
      });
      this.touchControls?.setVisible(false);
      this.pauseButton?.container.setVisible(false);
    });
  }

  private updateWrongWayMessage(active: boolean): void {
    if (active) {
      this.messages?.show('wrong_way');
    } else if (this.messages?.isShowing('wrong_way')) {
      this.messages.hide('wrong_way');
    }
  }

  private updateHud(phase: RacePhase, player: { racerProgress: { currentLap: number; totalLaps: number } }, playerFinished: boolean): void {
    const showHud =
      phase === 'racing' || phase === 'paused' || phase === 'post_player_finish' || phase === 'finished';
    const elapsed = this.participantManager?.getElapsedMs() ?? 0;
    const position = this.participantManager?.getPlayerPosition() ?? 1;

    this.raceHud?.update(
      player.racerProgress.currentLap,
      player.racerProgress.totalLaps,
      elapsed,
      position,
      RACER_COUNT,
      showHud,
    );

    const dimmed =
      phase === 'paused' || phase === 'countdown' || phase === 'finished' || playerFinished;
    this.raceHud?.setDimmed(dimmed);
  }

  private updateDebug(phase: RacePhase): void {
    if (!this.debugEnabled || !this.debugText || !this.participantManager) return;

    const player = this.participantManager.getPlayerParticipant();
    const fps = Math.round(this.game.loop.actualFps);
    const lines = [
      `Track: ${this.playableTrack?.id ?? 'unknown'}`,
      `Phase: ${phase}`,
      `Position: ${this.participantManager.getPlayerPosition()}/4`,
      `Lap: ${player.racerProgress.currentLap}/${player.racerProgress.totalLaps}`,
      `Expected CP: ${player.checkpointProgress.nextCheckpointIndex}`,
      `Time: ${this.participantManager.getElapsedMs().toFixed(0)}ms`,
      `Speed: ${Math.round(player.car.getSpeed())}`,
      `FPS: ${fps}`,
    ];

    this.participantManager.getParticipants().forEach((p) => {
      if (p.kind === 'ai' && p.aiState) {
        lines.push(
          `${p.displayName}: lap ${p.racerProgress.currentLap} cp ${p.checkpointProgress.nextCheckpointIndex} spd ${Math.round(p.car.getSpeed())} rb ${p.aiState.rubberBandMultiplier.toFixed(2)}`,
        );
      }
    });

    lines.push('Debug: ON');
    this.debugText.setText(lines.join('\n'));
    this.checkpointSystem?.setDebugVisible(true);
    this.drawDebugPath();
  }

  private drawDebugPath(): void {
    const raceData = this.participantManager?.getTrackData();
    if (!raceData) return;

    if (!this.debugGraphics) {
      this.debugGraphics = this.add.graphics().setDepth(4);
    }

    this.debugGraphics.clear();
    this.debugGraphics.lineStyle(2, 0xff00ff, 0.5);
    const path = raceData.aiPath;
    for (let i = 0; i < path.length; i += 1) {
      const a = path[i];
      const b = path[(i + 1) % path.length];
      this.debugGraphics.lineBetween(a.x, a.y, b.x, b.y);
    }
    path.forEach((p) => {
      this.debugGraphics!.fillStyle(0xff00ff, 0.6);
      this.debugGraphics!.fillCircle(p.x, p.y, 4);
    });
  }

  private toggleDebug(): void {
    this.debugEnabled = !this.debugEnabled;
    this.debugText?.setVisible(this.debugEnabled);
    if (!this.debugEnabled) {
      this.checkpointSystem?.setDebugVisible(false);
      this.debugGraphics?.clear();
    }
  }

  private setPaused(value: boolean): void {
    const phase = this.participantManager?.getPhase();
    if (phase === 'countdown' || phase === 'finished') return;

    if (value) {
      this.participantManager?.pause();
      this.touchControls?.clearInput();
      this.touchControls?.setEnabled(false);
      this.checkpointSystem?.setEnabled(false);
      this.pauseOverlay?.setVisible(true);
      this.pauseButton?.container.setVisible(false);
      this.physics.pause();
    } else {
      this.participantManager?.resume();
      if (!this.participantManager?.getPlayerParticipant().racerProgress.finished) {
        this.touchControls?.setEnabled(true);
      }
      this.checkpointSystem?.setEnabled(true);
      this.pauseOverlay?.setVisible(false);
      this.pauseButton?.container.setVisible(true);
      this.physics.resume();
    }
  }

  private restartRace(): void {
    this.resultsDelayTimer?.remove();
    this.countdown?.cancel();
    this.messages?.reset();
    this.resultsPanel?.hide();
    this.pauseOverlay?.setVisible(false);
    this.pauseButton?.container.setVisible(true);
    this.touchControls?.setVisible(true);
    this.touchControls?.setEnabled(false);
    this.touchControls?.setDimmed(true);
    this.physics.resume();

    this.resultsShown = false;
    this.participantManager?.reset(this.totalLaps);
    this.participantManager?.beginCountdown();
    this.checkpointSystem?.reset();
    this.raceHud?.reset();

    this.participantManager?.getParticipants().forEach((p) => {
      p.car.resetToPose(p.spawn.x, p.spawn.y, p.spawn.rotation);
      if (p.kind === 'ai') {
        (p.car as AiRacer).setCollisionEnabled(true);
      }
    });
    this.cameraController?.resetFollow();

    this.participantManager?.lockAllDriving();
    this.startCountdown();
  }

  private goMainMenu(): void {
    if (this.isTransitioning.value) return;
    this.countdown?.cancel();
    this.touchControls?.clearInput();
    fadeToScene(this, SCENE_KEYS.MAIN_MENU, this.isTransitioning);
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
      .text(HUD_INSETS.LEFT, HUD_INSETS.TOP + 72, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(1500)
      .setVisible(false);
  }
}

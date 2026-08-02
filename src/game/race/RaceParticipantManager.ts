import Phaser from 'phaser';
import { getCharacterDisplayName } from '../data/characters';
import { GameState } from '../state/GameState';
import { AI_CONFIG, getAiProfile } from './aiConfig';
import { AiRacer } from './AiRacer';
import {
  applyRecoveryPose,
  computeAiInput,
  createAiFollowerState,
  updateAiStuckState,
  type AiFollowerState,
} from './AiPathFollower';
import { PlayerCar } from './PlayerCar';
import type { RaceCarController } from './RaceCarController';
import {
  calculateRacePositions,
  computeRaceProgressScore,
  computeRubberBandMultiplier,
  getPlayerPosition,
  rankUnfinishedByProgress,
  type PositionInput,
} from './RacePositionSystem';
import { RaceTimer } from './RaceTimer';
import type { RacerResult } from './RaceResultsTypes';
import {
  createCheckpointProgress,
  createRacerRaceProgress,
  processCheckpointExit,
  processRacerCheckpointEntry,
  resetRacerState,
  updateStartZone,
} from './checkpointLogic';
import type { GridPose, TrackRaceData } from './tracks/trackTypes';
import type {
  CheckpointDefinition,
  CheckpointProgress,
  RacePhase,
  RacerCheckpointEvent,
  RacerId,
  RacerKind,
  RacerRaceProgress,
} from './raceTypes';
import { isWrongWayTravel } from './wrongWayDetection';
import type { RaceInput } from './raceInput';

const WRONG_WAY_THRESHOLD_MS = 1200;
const WRONG_WAY_MIN_SPEED = 60;

export interface RaceParticipant {
  id: RacerId;
  displayName: string;
  kind: RacerKind;
  car: RaceCarController;
  checkpointProgress: CheckpointProgress;
  racerProgress: RacerRaceProgress;
  spawn: GridPose;
  aiState?: AiFollowerState;
  missedMessagePending: boolean;
  wrongWayMs: number;
}

/**
 * Manages all race participants, session timing, positions, and finish order.
 */
export class RaceParticipantManager {
  private readonly scene: Phaser.Scene;
  private readonly trackData: TrackRaceData;
  private readonly definitions: readonly CheckpointDefinition[];
  private readonly participants: RaceParticipant[] = [];
  private readonly timer = new RaceTimer();
  private phase: RacePhase = 'countdown';
  private nextFinishPosition = 1;
  private postPlayerFinishMs = 0;
  private playerFinished = false;
  private resultsResolved = false;
  private positionUpdateAccumulator = 0;
  private playerPosition = 1;
  private playerLapStartMs = 0;
  private playerFastestLapMs: number | null = null;
  private readonly positions = new Map<RacerId, number>();
  private readonly results: RacerResult[] = [];
  private readonly totalLaps: number;

  constructor(
    scene: Phaser.Scene,
    trackData: TrackRaceData,
    totalLaps: number,
    playerColor: number,
  ) {
    this.scene = scene;
    this.trackData = trackData;
    this.definitions = trackData.checkpoints;
    this.totalLaps = totalLaps;

    const state = GameState.getState();
    const playerName = getCharacterDisplayName(state.selectedCharacter).toUpperCase();
    const grid = trackData.gridPoses;

    const player = new PlayerCar(scene, grid[0].x, grid[0].y, grid[0].rotation, playerColor);
    this.participants.push(
      this.createParticipant('player', playerName, 'player', player, grid[0]),
    );

    const aiSlots: Array<{ id: RacerId; gridIndex: number }> = [
      { id: 'ai-citrus', gridIndex: 1 },
      { id: 'ai-pepper', gridIndex: 2 },
      { id: 'ai-berry', gridIndex: 3 },
    ];

    aiSlots.forEach(({ id, gridIndex }) => {
      const profile = getAiProfile(id);
      const pose = grid[gridIndex];
      const aiCar = new AiRacer(scene, pose.x, pose.y, pose.rotation, profile.color);
      this.participants.push(
        this.createParticipant(id, profile.displayName.toUpperCase(), 'ai', aiCar, pose, profile.pathLookAhead),
      );
    });
  }

  getPhase(): RacePhase {
    return this.phase;
  }

  getPlayerCar(): PlayerCar {
    return this.participants[0].car as PlayerCar;
  }

  getParticipants(): readonly RaceParticipant[] {
    return this.participants;
  }

  getAllCars(): RaceCarController[] {
    return this.participants.map((p) => p.car);
  }

  getElapsedMs(): number {
    return this.timer.getElapsedMs();
  }

  getPlayerPosition(): number {
    return this.playerPosition;
  }

  getPlayerFastestLapMs(): number | null {
    return this.playerFastestLapMs;
  }

  getPlayerParticipant(): RaceParticipant {
    return this.participants[0];
  }

  getDefinitions(): readonly CheckpointDefinition[] {
    return this.definitions;
  }

  getTrackData(): TrackRaceData {
    return this.trackData;
  }

  getResults(): readonly RacerResult[] {
    return this.results;
  }

  shouldShowResults(): boolean {
    return this.resultsResolved;
  }

  beginCountdown(): void {
    this.phase = 'countdown';
    this.timer.reset();
  }

  onGo(): void {
    this.phase = 'racing';
    this.timer.start();
    this.playerLapStartMs = 0;
    this.playerFastestLapMs = null;
    this.unlockAllDriving();
  }

  pause(): void {
    if (this.phase === 'finished' || this.phase === 'paused') return;
    this.phase = 'paused';
    this.timer.pause();
  }

  resume(): void {
    if (this.phase !== 'paused') return;
    this.phase = this.playerFinished && !this.resultsResolved ? 'post_player_finish' : 'racing';
    this.timer.resume();
  }

  reset(totalLaps: number): void {
    this.phase = 'countdown';
    this.timer.reset();
    this.nextFinishPosition = 1;
    this.postPlayerFinishMs = 0;
    this.playerFinished = false;
    this.resultsResolved = false;
    this.positionUpdateAccumulator = 0;
    this.playerPosition = 1;
    this.playerLapStartMs = 0;
    this.playerFastestLapMs = null;
    this.positions.clear();
    this.results.length = 0;

    this.participants.forEach((p, index) => {
      const reset = resetRacerState(totalLaps);
      p.checkpointProgress = reset.checkpointProgress;
      p.racerProgress = reset.racerProgress;
      p.missedMessagePending = false;
      p.wrongWayMs = 0;
      p.aiState = p.kind === 'ai' ? createAiFollowerState(index * 2) : undefined;
      p.car.resetToPose(p.spawn.x, p.spawn.y, p.spawn.rotation);
      p.car.setInputEnabled(false);
      if (p.kind === 'ai') {
        (p.car as AiRacer).setCollisionEnabled(true);
      }
    });
  }

  lockAllDriving(): void {
    this.participants.forEach((p) => {
      p.car.setInputEnabled(false);
      p.car.stop();
    });
  }

  unlockAllDriving(): void {
    this.participants.forEach((p) => {
      if (!p.racerProgress.finished) {
        p.car.setInputEnabled(true);
      }
    });
  }

  update(deltaMs: number, playerInput: RaceInput): {
    playerWrongWay: boolean;
    canProcessCheckpoints: boolean;
    playerMissedCheckpoint: boolean;
    playerFinished: boolean;
  } {
    let playerWrongWay = false;
    let playerMissedCheckpoint = false;
    const canProcess =
      this.phase === 'racing' || this.phase === 'post_player_finish';

    if (this.phase === 'racing' || this.phase === 'post_player_finish') {
      this.timer.update(deltaMs);
    }

    if (this.phase === 'post_player_finish') {
      this.postPlayerFinishMs += deltaMs;
      if (
        this.postPlayerFinishMs >= AI_CONFIG.postPlayerFinishTimeoutMs ||
        this.allRacersAccountedFor()
      ) {
        this.resolveRemainingResults();
      }
    }

    if (canProcess) {
      this.participants.forEach((p) => {
        if (p.racerProgress.finished) {
          p.car.coastToStop(deltaMs);
          return;
        }

        if (p.kind === 'player') {
          p.car.update(deltaMs, playerInput);
          playerWrongWay = this.updateWrongWay(p, deltaMs);
        } else {
          this.updateAi(p, deltaMs);
        }

        const car = p.car;
        const dist = Math.hypot(car.getX() - p.spawn.x, car.getY() - p.spawn.y);
        p.checkpointProgress = updateStartZone(
          p.checkpointProgress,
          dist,
          this.trackData.startLeaveDistance,
        );
      });

      this.positionUpdateAccumulator += deltaMs;
      if (this.positionUpdateAccumulator >= AI_CONFIG.positionUpdateIntervalMs) {
        this.positionUpdateAccumulator = 0;
        this.updatePositions();
      }
    }

    if (this.allRacersAccountedFor() && !this.resultsResolved) {
      this.resolveRemainingResults();
    }

    return {
      playerWrongWay,
      canProcessCheckpoints: canProcess,
      playerMissedCheckpoint: playerMissedCheckpoint,
      playerFinished: this.playerFinished,
    };
  }

  handleCheckpointEnter(racerId: RacerId, index: number): RacerCheckpointEvent {
    const participant = this.participants.find((p) => p.id === racerId);
    if (!participant) return { type: 'ignored' };
    if (this.phase !== 'racing' && this.phase !== 'post_player_finish') {
      return { type: 'ignored' };
    }
    if (participant.racerProgress.finished) return { type: 'ignored' };

    const result = processRacerCheckpointEntry(
      participant.checkpointProgress,
      participant.racerProgress,
      index,
      this.definitions,
      this.timer.getElapsedMs(),
    );

    participant.checkpointProgress = result.checkpointProgress;
    participant.racerProgress = result.racerProgress;

    if (result.event.type === 'missed_checkpoint' && racerId === 'player') {
      participant.missedMessagePending = true;
    }

    if (result.event.type === 'racer_finished') {
      if (racerId === 'player') {
        this.recordPlayerLapTime(this.timer.getElapsedMs());
      }
      this.onRacerFinished(participant);
    }

    if (result.event.type === 'lap_completed' && racerId === 'player') {
      this.recordPlayerLapTime(this.timer.getElapsedMs());
    }

    return result.event;
  }

  handleCheckpointExit(racerId: RacerId, index: number): void {
    const participant = this.participants.find((p) => p.id === racerId);
    if (!participant) return;
    participant.checkpointProgress = processCheckpointExit(participant.checkpointProgress, index);
  }

  consumePlayerMissedMessage(): boolean {
    const player = this.participants[0];
    if (!player.missedMessagePending) return false;
    player.missedMessagePending = false;
    return true;
  }

  private recordPlayerLapTime(elapsedMs: number): void {
    const lapTime = elapsedMs - this.playerLapStartMs;
    this.playerLapStartMs = elapsedMs;
    if (lapTime > 0 && (this.playerFastestLapMs === null || lapTime < this.playerFastestLapMs)) {
      this.playerFastestLapMs = lapTime;
    }
  }

  private createParticipant(
    id: RacerId,
    displayName: string,
    kind: RacerKind,
    car: RaceCarController,
    spawn: GridPose,
    pathLookAhead = 0,
  ): RaceParticipant {
    return {
      id,
      displayName,
      kind,
      car,
      spawn,
      checkpointProgress: createCheckpointProgress(),
      racerProgress: createRacerRaceProgress(this.totalLaps),
      aiState: kind === 'ai' ? createAiFollowerState(pathLookAhead) : undefined,
      missedMessagePending: false,
      wrongWayMs: 0,
    };
  }

  private updateAi(participant: RaceParticipant, deltaMs: number): void {
    if (!participant.aiState) return;
    const profile = getAiProfile(participant.id);
    const car = participant.car as AiRacer;

    const player = this.participants[0];
    const playerScore = computeRaceProgressScore(
      player.racerProgress,
      player.car.getX(),
      player.car.getY(),
      this.definitions,
    );
    const aiScore = computeRaceProgressScore(
      participant.racerProgress,
      car.getX(),
      car.getY(),
      this.definitions,
    );

    const targetRubber = computeRubberBandMultiplier(
      aiScore,
      playerScore,
      profile.rubberBandStrength,
      AI_CONFIG.rubberBandMinMultiplier,
      AI_CONFIG.rubberBandMaxMultiplier,
      AI_CONFIG.rubberBandBehindThreshold,
      AI_CONFIG.rubberBandAheadThreshold,
    );
    participant.aiState.rubberBandMultiplier +=
      (targetRubber - participant.aiState.rubberBandMultiplier) * AI_CONFIG.rubberBandSmoothing;

    let aiState = updateAiStuckState(
      participant.aiState,
      car.getSpeed(),
      car.getX(),
      car.getY(),
      this.trackData.aiPath,
      deltaMs,
      this.trackData.aiTuning,
    );

    const recoveryState = aiState as AiFollowerState & { needsRecovery?: boolean };
    if (recoveryState.needsRecovery) {
      const pose = applyRecoveryPose(this.trackData.aiPath, aiState.pathIndex);
      car.resetToPose(pose.x, pose.y, pose.rotation);
      delete recoveryState.needsRecovery;
    }

    const { input, state } = computeAiInput(
      car.getX(),
      car.getY(),
      car.getRotation(),
      car.getSpeed(),
      this.trackData.aiPath,
      aiState,
      profile,
      aiState.rubberBandMultiplier,
      this.trackData.aiTuning,
    );
    participant.aiState = state;
    car.update(deltaMs, input);
  }

  private updateWrongWay(participant: RaceParticipant, deltaMs: number): boolean {
    const car = participant.car;
    const speed = car.getSpeed();
    if (speed < WRONG_WAY_MIN_SPEED) {
      participant.wrongWayMs = 0;
      return false;
    }

    const expected =
      this.definitions.find((cp) => cp.index === participant.checkpointProgress.nextCheckpointIndex)
        ?.expectedDirection ?? car.getRotation();

    const wrong = isWrongWayTravel(
      car.getVelocityX(),
      car.getVelocityY(),
      expected,
      WRONG_WAY_MIN_SPEED,
    );

    if (wrong) {
      participant.wrongWayMs += deltaMs;
    } else {
      participant.wrongWayMs = 0;
    }

    return participant.wrongWayMs >= WRONG_WAY_THRESHOLD_MS;
  }

  private updatePositions(): void {
    const inputs: PositionInput[] = this.participants.map((p) => ({
      racerId: p.id,
      progress: p.racerProgress,
      x: p.car.getX(),
      y: p.car.getY(),
    }));

    inputs.forEach((input) => {
      const p = this.participants.find((r) => r.id === input.racerId)!;
      const score = computeRaceProgressScore(input.progress, input.x, input.y, this.definitions);
      p.racerProgress.totalRaceProgress = score;
    });

    const positions = calculateRacePositions(inputs, this.definitions);
    positions.forEach((pos, id) => this.positions.set(id, pos));
    this.playerPosition = getPlayerPosition(positions);
  }

  private onRacerFinished(participant: RaceParticipant): void {
    if (participant.racerProgress.finishPosition !== null) return;

    const position = this.nextFinishPosition;
    this.nextFinishPosition += 1;

    participant.racerProgress.finishPosition = position;
    participant.racerProgress.finishTimeMs = this.timer.getElapsedMs();
    participant.car.setInputEnabled(false);

    this.results.push({
      racerId: participant.id,
      displayName: participant.displayName,
      position,
      finishTimeMs: participant.racerProgress.finishTimeMs,
      status: 'finished',
      isPlayer: participant.kind === 'player',
    });

    this.results.sort((a, b) => a.position - b.position);

    if (participant.kind === 'player') {
      this.playerFinished = true;
      this.phase = 'post_player_finish';
      this.postPlayerFinishMs = 0;
      participant.car.setInputEnabled(false);
    }

    if (participant.kind === 'ai') {
      this.scene.time.delayedCall(AI_CONFIG.finishCoastGraceMs, () => {
        (participant.car as AiRacer).setCollisionEnabled(false);
      });
    }

    this.updatePositions();
  }

  private allRacersAccountedFor(): boolean {
    return this.results.length >= this.participants.length;
  }

  private resolveRemainingResults(): void {
    if (this.resultsResolved) return;

    const inputs: PositionInput[] = this.participants
      .filter((p) => !p.racerProgress.finished)
      .map((p) => ({
        racerId: p.id,
        progress: p.racerProgress,
        x: p.car.getX(),
        y: p.car.getY(),
      }));

    const ranked = rankUnfinishedByProgress(inputs, this.definitions);
    ranked.forEach((racerId) => {
      const participant = this.participants.find((p) => p.id === racerId);
      if (!participant || participant.racerProgress.finished) return;

      const position = this.nextFinishPosition;
      this.nextFinishPosition += 1;
      participant.racerProgress.finishPosition = position;
      participant.racerProgress.finished = true;
      participant.car.setInputEnabled(false);
      participant.car.stop();

      this.results.push({
        racerId,
        displayName: participant.displayName,
        position,
        finishTimeMs: null,
        status: 'dnf',
        isPlayer: false,
      });
    });

    this.results.sort((a, b) => a.position - b.position);
    this.resultsResolved = true;
    this.phase = 'finished';
    this.timer.stop();
    this.lockAllDriving();
  }

  destroy(): void {
    this.participants.forEach((p) => p.car.destroy());
    this.participants.length = 0;
  }
}

// Re-export for legacy tests
export { setRacePhase } from './checkpointLogic';

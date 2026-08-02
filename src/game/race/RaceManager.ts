import type { CheckpointDefinition, CheckpointEvent, RaceProgress } from './raceTypes';
import {
  createCheckpointProgress,
  createRaceProgress,
  processCheckpointEntry,
  processCheckpointExit,
  resetRaceProgress,
  setRacePhase,
  updateStartZone,
} from './checkpointLogic';
import { RaceTimer } from './RaceTimer';
import { MANGO_MEADOWS_START_LEAVE_DISTANCE } from './mangoMeadowsCheckpoints';

const WRONG_WAY_THRESHOLD_MS = 1200;
const WRONG_WAY_MIN_SPEED = 60;
const MISSED_MESSAGE_COOLDOWN_MS = 2500;

export interface WrongWayState {
  active: boolean;
  accumulatedMs: number;
}

/**
 * Coordinates race phase, timer, checkpoint progression, and wrong-way detection.
 */
export class RaceManager {
  private raceProgress: RaceProgress;
  private checkpointProgress = createCheckpointProgress();
  private readonly timer = new RaceTimer();
  private readonly definitions: readonly CheckpointDefinition[];
  private wrongWayMs = 0;
  private missedCooldownMs = 0;
  private showMissedMessage = false;
  private spawnX = 0;
  private spawnY = 0;
  private lastCheckpointEvent: CheckpointEvent | null = null;

  constructor(totalLaps: number, definitions: readonly CheckpointDefinition[]) {
    this.definitions = definitions;
    this.raceProgress = createRaceProgress(totalLaps);
  }

  getProgress(): Readonly<RaceProgress> {
    return this.raceProgress;
  }

  getCheckpointProgress() {
    return this.checkpointProgress;
  }

  getTimer(): RaceTimer {
    return this.timer;
  }

  getDefinitions(): readonly CheckpointDefinition[] {
    return this.definitions;
  }

  setSpawn(x: number, y: number): void {
    this.spawnX = x;
    this.spawnY = y;
  }

  beginCountdown(): void {
    this.raceProgress = setRacePhase(this.raceProgress, 'countdown');
    this.timer.reset();
  }

  onGo(): void {
    this.raceProgress = setRacePhase(this.raceProgress, 'racing');
    this.timer.start();
  }

  pause(): void {
    if (this.raceProgress.phase === 'finished') return;
    if (this.raceProgress.phase === 'paused') return;
    this.raceProgress = setRacePhase(this.raceProgress, 'paused');
    this.timer.pause();
  }

  resume(): void {
    if (this.raceProgress.phase !== 'paused') return;
    this.raceProgress = setRacePhase(this.raceProgress, 'racing');
    this.timer.resume();
  }

  reset(totalLaps: number): void {
    const reset = resetRaceProgress(totalLaps);
    this.raceProgress = reset.raceProgress;
    this.checkpointProgress = reset.checkpointProgress;
    this.timer.reset();
    this.wrongWayMs = 0;
    this.missedCooldownMs = 0;
    this.showMissedMessage = false;
    this.lastCheckpointEvent = null;
  }

  update(
    deltaMs: number,
    playerX: number,
    playerY: number,
    velocityX: number,
    velocityY: number,
    carRotation: number,
  ): { wrongWay: WrongWayState; checkpointEvent: CheckpointEvent | null; canProcessCheckpoints: boolean } {
    this.lastCheckpointEvent = null;

    if (this.raceProgress.phase === 'racing') {
      this.timer.update(deltaMs);
      this.raceProgress = {
        ...this.raceProgress,
        elapsedTimeMs: this.timer.getElapsedMs(),
      };
    }

    if (this.missedCooldownMs > 0) {
      this.missedCooldownMs = Math.max(0, this.missedCooldownMs - deltaMs);
    }

    const distance = Math.hypot(playerX - this.spawnX, playerY - this.spawnY);
    this.checkpointProgress = updateStartZone(
      this.checkpointProgress,
      distance,
      MANGO_MEADOWS_START_LEAVE_DISTANCE,
    );

    const wrongWay = this.updateWrongWay(deltaMs, velocityX, velocityY, carRotation);

    const canProcessCheckpoints = this.raceProgress.phase === 'racing';

    return { wrongWay, checkpointEvent: this.lastCheckpointEvent, canProcessCheckpoints };
  }

  handleCheckpointEnter(index: number): CheckpointEvent {
    if (this.raceProgress.phase !== 'racing') {
      return { type: 'ignored' };
    }

    const result = processCheckpointEntry(
      this.checkpointProgress,
      this.raceProgress,
      index,
      this.definitions,
    );

    this.checkpointProgress = result.checkpointProgress;
    this.raceProgress = result.raceProgress;

    if (result.event.type === 'race_completed') {
      this.timer.stop();
      this.raceProgress = {
        ...this.raceProgress,
        finalTimeMs: this.timer.getElapsedMs(),
      };
    }

    if (result.event.type === 'missed_checkpoint' && this.missedCooldownMs <= 0) {
      this.missedCooldownMs = MISSED_MESSAGE_COOLDOWN_MS;
      this.showMissedMessage = true;
    }

    this.lastCheckpointEvent = result.event;
    return result.event;
  }

  handleCheckpointExit(index: number): void {
    this.checkpointProgress = processCheckpointExit(this.checkpointProgress, index);
  }

  consumeMissedMessage(): boolean {
    if (!this.showMissedMessage) return false;
    this.showMissedMessage = false;
    return true;
  }

  shouldShowMissedMessage(event: CheckpointEvent): boolean {
    return event.type === 'missed_checkpoint';
  }

  private updateWrongWay(
    deltaMs: number,
    velocityX: number,
    velocityY: number,
    carRotation: number,
  ): WrongWayState {
    if (this.raceProgress.phase !== 'racing') {
      this.wrongWayMs = 0;
      return { active: false, accumulatedMs: 0 };
    }

    const speed = Math.hypot(velocityX, velocityY);
    if (speed < WRONG_WAY_MIN_SPEED) {
      this.wrongWayMs = 0;
      return { active: false, accumulatedMs: 0 };
    }

    const nextIndex = this.checkpointProgress.nextCheckpointIndex;
    const expected =
      this.definitions.find((cp) => cp.index === nextIndex)?.expectedDirection ?? carRotation;

    const travelDir = Math.atan2(velocityY, velocityX);
    let diff = Math.abs(travelDir - expected);
    if (diff > Math.PI) diff = Math.PI * 2 - diff;

    const isWrong = diff > Math.PI * 0.55;

    if (isWrong) {
      this.wrongWayMs += deltaMs;
    } else {
      this.wrongWayMs = 0;
    }

    const active = this.wrongWayMs >= WRONG_WAY_THRESHOLD_MS;
    return { active, accumulatedMs: this.wrongWayMs };
  }
}

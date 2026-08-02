import Phaser from 'phaser';
import type { RaceInput } from './raceInput';

/** Shared minimal interface for player and AI race cars */
export interface RaceCarController {
  getGameObject(): Phaser.GameObjects.Rectangle;
  getX(): number;
  getY(): number;
  getRotation(): number;
  getSpeed(): number;
  getSignedSpeed(): number;
  getVelocityX(): number;
  getVelocityY(): number;
  setInputEnabled(enabled: boolean): void;
  resetToPose(x: number, y: number, rotation: number): void;
  stop(): void;
  coastToStop(deltaMs: number): void;
  onBarrierHit(): void;
  update(deltaMs: number, input: RaceInput): void;
  destroy(): void;
}

import Phaser from 'phaser';

/** Shared minimal interface for player and AI race cars */
export interface RaceCarController {
  getGameObject(): Phaser.GameObjects.Rectangle;
  getX(): number;
  getY(): number;
  getRotation(): number;
  getSpeed(): number;
  getVelocityX(): number;
  getVelocityY(): number;
  setInputEnabled(enabled: boolean): void;
  resetToPose(x: number, y: number, rotation: number): void;
  stop(): void;
  coastToStop(deltaMs: number): void;
  onBarrierHit(): void;
  update(deltaMs: number, input: import('./TouchControls').RaceInput): void;
  destroy(): void;
}

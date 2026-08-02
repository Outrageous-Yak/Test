import Phaser from 'phaser';
import { DRIVING } from './raceConstants';
import type { RaceCarController } from './RaceCarController';
import type { RaceInput } from './TouchControls';

/**
 * AI-controlled vehicle using the same arcade driving model as the player.
 */
export class AiRacer implements RaceCarController {
  private readonly sprite: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;
  private speed = 0;
  private inputEnabled = false;

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, color: number) {

    this.sprite = scene.add.rectangle(x, y, DRIVING.CAR_WIDTH, DRIVING.CAR_HEIGHT, color);
    this.sprite.setRotation(angle);
    this.sprite.setDepth(9);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.05, 0.05);
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(DRIVING.MAX_SPEED, DRIVING.MAX_SPEED);
    this.body.setMass(1);
  }

  getGameObject(): Phaser.GameObjects.Rectangle {
    return this.sprite;
  }

  getX(): number {
    return this.sprite.x;
  }

  getY(): number {
    return this.sprite.y;
  }

  getRotation(): number {
    return this.sprite.rotation;
  }

  getSpeed(): number {
    return Math.abs(this.speed);
  }

  getVelocityX(): number {
    return this.body.velocity.x;
  }

  getVelocityY(): number {
    return this.body.velocity.y;
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (!enabled) {
      this.body.setVelocity(0, 0);
    }
  }

  setCollisionEnabled(enabled: boolean): void {
    this.body.enable = enabled;
  }

  resetToPose(x: number, y: number, rotation: number): void {
    this.sprite.setPosition(x, y);
    this.sprite.setRotation(rotation);
    this.speed = 0;
    this.body.setVelocity(0, 0);
    this.body.reset(x, y);
  }

  stop(): void {
    this.speed = 0;
    this.body.setVelocity(0, 0);
  }

  coastToStop(deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.speed = Math.max(0, this.speed - DRIVING.BRAKE_FORCE * dt * 0.6);
    const vx = Math.cos(this.sprite.rotation) * this.speed;
    const vy = Math.sin(this.sprite.rotation) * this.speed;
    this.body.setVelocity(vx, vy);
  }

  onBarrierHit(): void {
    this.speed *= 0.55;
    if (Math.abs(this.speed) < 20) {
      this.speed = 0;
    }
  }

  update(deltaMs: number, input: RaceInput): void {
    if (!this.inputEnabled) {
      this.body.setVelocity(0, 0);
      return;
    }

    const dt = deltaMs / 1000;

    if (input.brake) {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - DRIVING.BRAKE_FORCE * dt);
      }
    } else {
      this.speed = Math.min(DRIVING.MAX_SPEED, this.speed + DRIVING.ACCELERATION * dt);
    }

    if (!input.brake && this.speed > 0) {
      this.speed = Math.max(0, this.speed - DRIVING.FRICTION * dt * 0.25);
    }

    const speedFactor = Math.max(DRIVING.MIN_TURN_SPEED, Math.abs(this.speed) / DRIVING.MAX_SPEED);
    let turn = 0;
    if (input.steerLeft) turn -= DRIVING.TURN_RATE * speedFactor * dt;
    if (input.steerRight) turn += DRIVING.TURN_RATE * speedFactor * dt;

    this.sprite.rotation += turn;

    const vx = Math.cos(this.sprite.rotation) * this.speed;
    const vy = Math.sin(this.sprite.rotation) * this.speed;
    this.body.setVelocity(vx, vy);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

import Phaser from 'phaser';
import { DRIVING, RACE_COLORS } from './raceConstants';
import type { RaceCarController } from './RaceCarController';
import type { RaceInput } from './TouchControls';

/**
 * Player vehicle — temporary rectangle shape with arcade-style driving.
 */
export class PlayerCar implements RaceCarController {
  private readonly sprite: Phaser.GameObjects.Rectangle;
  private readonly body: Phaser.Physics.Arcade.Body;
  private speed = 0;
  private spawnX: number;
  private spawnY: number;
  private spawnAngle: number;
  private inputEnabled = true;
  private readonly forwardVector = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number, angle: number, color: number = RACE_COLORS.CAR_DEFAULT) {
    this.spawnX = x;
    this.spawnY = y;
    this.spawnAngle = angle;

    this.sprite = scene.add.rectangle(x, y, DRIVING.CAR_WIDTH, DRIVING.CAR_HEIGHT, color);
    this.sprite.setRotation(angle);
    this.sprite.setDepth(10);

    scene.physics.add.existing(this.sprite);
    this.body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(0.1, 0.1);
    this.body.setDrag(0, 0);
    this.body.setMaxVelocity(DRIVING.MAX_SPEED, DRIVING.MAX_SPEED);
  }

  getX(): number {
    return this.sprite.x;
  }

  getY(): number {
    return this.sprite.y;
  }

  getVelocityX(): number {
    return this.body.velocity.x;
  }

  getVelocityY(): number {
    return this.body.velocity.y;
  }

  resetToPose(x: number, y: number, rotation: number): void {
    this.spawnX = x;
    this.spawnY = y;
    this.spawnAngle = rotation;
    this.sprite.setPosition(x, y);
    this.sprite.setRotation(rotation);
    this.speed = 0;
    this.inputEnabled = true;
    this.body.setVelocity(0, 0);
    this.body.reset(x, y);
  }

  getGameObject(): Phaser.GameObjects.Rectangle {
    return this.sprite;
  }

  getSpeed(): number {
    return Math.abs(this.speed);
  }

  getForwardVector(): Phaser.Math.Vector2 {
    this.forwardVector.set(Math.cos(this.sprite.rotation), Math.sin(this.sprite.rotation));
    return this.forwardVector;
  }

  getRotation(): number {
    return this.sprite.rotation;
  }

  getVelocity(): { x: number; y: number } {
    return { x: this.body.velocity.x, y: this.body.velocity.y };
  }

  setInputEnabled(enabled: boolean): void {
    this.inputEnabled = enabled;
    if (!enabled) {
      this.body.setVelocity(0, 0);
    }
  }

  stop(): void {
    this.speed = 0;
    this.body.setVelocity(0, 0);
  }

  /** Gradually decelerate after race finish */
  coastToStop(deltaMs: number): void {
    const dt = deltaMs / 1000;
    this.speed = Math.max(0, this.speed - DRIVING.BRAKE_FORCE * dt * 0.6);
    const vx = Math.cos(this.sprite.rotation) * this.speed;
    const vy = Math.sin(this.sprite.rotation) * this.speed;
    this.body.setVelocity(vx, vy);
  }

  /** Reduce speed after barrier collision so bounce feels responsive. */
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
      } else {
        this.speed = Math.min(0, this.speed + DRIVING.BRAKE_FORCE * dt);
      }
    } else {
      this.speed = Math.min(DRIVING.MAX_SPEED, this.speed + DRIVING.ACCELERATION * dt);
    }

    if (!input.brake && this.speed > 0) {
      this.speed = Math.max(0, this.speed - DRIVING.FRICTION * dt * 0.25);
    }

    const speedFactor = Math.max(DRIVING.MIN_TURN_SPEED, Math.abs(this.speed) / DRIVING.MAX_SPEED);
    let turn = input.steer * DRIVING.TURN_RATE * speedFactor * dt;
    if (input.steer === 0) {
      if (input.steerLeft) turn -= DRIVING.TURN_RATE * speedFactor * dt;
      if (input.steerRight) turn += DRIVING.TURN_RATE * speedFactor * dt;
    }

    this.sprite.rotation += turn;

    const vx = Math.cos(this.sprite.rotation) * this.speed;
    const vy = Math.sin(this.sprite.rotation) * this.speed;
    this.body.setVelocity(vx, vy);
  }

  resetToSpawn(): void {
    this.resetToPose(this.spawnX, this.spawnY, this.spawnAngle);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

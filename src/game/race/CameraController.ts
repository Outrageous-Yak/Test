import Phaser from 'phaser';
import { PlayerCar } from './PlayerCar';
import type { TrackCameraConfig } from './tracks/trackTypes';

/**
 * Smooth camera follow with zoom and world bounds clamping.
 */
export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly player: PlayerCar;

  constructor(
    scene: Phaser.Scene,
    player: PlayerCar,
    worldWidth: number,
    worldHeight: number,
    config: TrackCameraConfig,
  ) {
    this.camera = scene.cameras.main;
    this.player = player;

    this.camera.setBounds(0, 0, worldWidth, worldHeight);
    this.camera.startFollow(player.getGameObject(), true, config.lerpX, config.lerpY);
    this.camera.setZoom(config.zoom);
  }

  update(): void {
    // startFollow handles smooth lerped tracking; bounds clamp via setBounds.
  }

  resetFollow(): void {
    const car = this.player.getGameObject();
    this.camera.centerOn(car.x, car.y);
  }
}

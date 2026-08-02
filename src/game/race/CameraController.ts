import Phaser from 'phaser';
import { PlayerCar } from './PlayerCar';
import { CAMERA, RACE_WORLD } from './raceConstants';

/**
 * Smooth camera follow with zoom and world bounds clamping.
 */
export class CameraController {
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly player: PlayerCar;

  constructor(scene: Phaser.Scene, player: PlayerCar) {
    this.camera = scene.cameras.main;
    this.player = player;

    this.camera.setBounds(0, 0, RACE_WORLD.WIDTH, RACE_WORLD.HEIGHT);
    this.camera.startFollow(player.getGameObject(), true, CAMERA.FOLLOW_LERP, CAMERA.FOLLOW_LERP);
    this.camera.setZoom(CAMERA.ZOOM);
  }

  update(): void {
    // startFollow handles smooth lerped tracking; bounds clamp via setBounds.
  }

  resetFollow(): void {
    const car = this.player.getGameObject();
    this.camera.centerOn(car.x, car.y);
  }
}

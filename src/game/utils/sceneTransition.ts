import Phaser from 'phaser';

const DEFAULT_FADE_MS = 200;

/**
 * Fade out the current scene camera, then start the target scene.
 * Prevents duplicate transitions when `isTransitioning` is already true.
 */
export function fadeToScene(
  scene: Phaser.Scene,
  targetSceneKey: string,
  isTransitioning: { value: boolean },
  durationMs = DEFAULT_FADE_MS,
): void {
  if (isTransitioning.value) return;
  isTransitioning.value = true;

  const camera = scene.cameras.main;
  camera.fadeOut(durationMs, 0, 0, 0);
  camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(targetSceneKey);
  });
}

/** Fade in when a scene is created */
export function fadeInScene(scene: Phaser.Scene, durationMs = DEFAULT_FADE_MS): void {
  const camera = scene.cameras.main;
  camera.fadeIn(durationMs, 0, 0, 0);
}

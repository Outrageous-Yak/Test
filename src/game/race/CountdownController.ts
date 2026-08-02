import Phaser from 'phaser';
import { FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export type CountdownStep = '3' | '2' | '1' | 'GO';

export interface CountdownCallbacks {
  onStep: (step: CountdownStep) => void;
  onGo: () => void;
  onComplete: () => void;
}

const STEP_MS: Record<CountdownStep, number> = {
  '3': 1000,
  '2': 1000,
  '1': 1000,
  GO: 700,
};

const STEPS: CountdownStep[] = ['3', '2', '1', 'GO'];

/**
 * Pre-race 3-2-1-GO countdown with cancellable timers.
 */
export class CountdownController {
  private readonly scene: Phaser.Scene;
  private readonly text: Phaser.GameObjects.Text;
  private timers: Phaser.Time.TimerEvent[] = [];
  private running = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.text = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '120px',
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2700)
      .setVisible(false);
  }

  start(callbacks: CountdownCallbacks): void {
    this.cancel();
    this.running = true;
    let delay = 0;

    STEPS.forEach((step) => {
      const timer = this.scene.time.delayedCall(delay, () => {
        if (!this.running) return;
        this.text.setText(step === 'GO' ? 'GO!' : step);
        this.text.setVisible(true);
        this.text.setScale(0.7);
        this.scene.tweens.add({
          targets: this.text,
          scale: 1,
          duration: 200,
          ease: 'Back.easeOut',
        });
        callbacks.onStep(step);

        if (step === 'GO') {
          callbacks.onGo();
          this.scene.time.delayedCall(STEP_MS.GO, () => {
            if (!this.running) return;
            this.text.setVisible(false);
            callbacks.onComplete();
            this.running = false;
          });
        }
      });
      this.timers.push(timer);
      delay += STEP_MS[step];
    });
  }

  cancel(): void {
    this.running = false;
    this.timers.forEach((t) => t.remove());
    this.timers = [];
    this.text.setVisible(false);
    this.scene.tweens.killTweensOf(this.text);
  }

  isRunning(): boolean {
    return this.running;
  }

  destroy(): void {
    this.cancel();
    this.text.destroy();
  }
}

import Phaser from 'phaser';
import { FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

export type RaceMessageKind = 'go' | 'wrong_way' | 'checkpoint_missed' | 'finish';

const PRIORITY: Record<RaceMessageKind, number> = {
  finish: 4,
  wrong_way: 3,
  checkpoint_missed: 2,
  go: 1,
};

const DISPLAY_MS: Record<RaceMessageKind, number> = {
  go: 700,
  wrong_way: 0,
  checkpoint_missed: 2000,
  finish: 1500,
};

const MESSAGE_TEXT: Record<RaceMessageKind, string> = {
  go: 'GO!',
  wrong_way: 'WRONG WAY',
  checkpoint_missed: 'CHECKPOINT MISSED',
  finish: 'FINISH!',
};

/**
 * Reuses a single centre-screen text object for temporary race messages.
 */
export class RaceMessageController {
  private readonly scene: Phaser.Scene;
  private readonly text: Phaser.GameObjects.Text;
  private activeKind: RaceMessageKind | null = null;
  private activePriority = 0;
  private timer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.text = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.22, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '52px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(2600)
      .setVisible(false);
  }

  show(kind: RaceMessageKind, options?: { fontSize?: string; color?: string }): void {
    const priority = PRIORITY[kind];
    if (this.activeKind !== null && priority < this.activePriority) return;

    this.clearTimer();
    this.activeKind = kind;
    this.activePriority = priority;
    this.text.setText(MESSAGE_TEXT[kind]);
    this.text.setFontSize(options?.fontSize ?? (kind === 'go' ? '96px' : '52px'));
    this.text.setColor(options?.color ?? '#ffffff');
    this.text.setVisible(true);
    this.text.setScale(0.85);
    this.scene.tweens.add({
      targets: this.text,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    const duration = DISPLAY_MS[kind];
    if (duration > 0) {
      this.timer = this.scene.time.delayedCall(duration, () => {
        if (this.activeKind === kind) {
          this.hide();
        }
      });
    }
  }

  hide(kind?: RaceMessageKind): void {
    if (kind && this.activeKind !== kind) return;
    this.clearTimer();
    this.activeKind = null;
    this.activePriority = 0;
    this.text.setVisible(false);
  }

  isShowing(kind: RaceMessageKind): boolean {
    return this.activeKind === kind;
  }

  reset(): void {
    this.hide();
  }

  destroy(): void {
    this.clearTimer();
    this.text.destroy();
  }

  private clearTimer(): void {
    this.timer?.remove();
    this.timer = undefined;
  }
}

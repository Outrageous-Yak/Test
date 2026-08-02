import Phaser from 'phaser';
import { FONTS, GAME_WIDTH } from '../constants';
import { formatRaceTime } from './formatRaceTime';
import { HUD_INSETS } from './raceHudInsets';

/**
 * Race HUD — lap counter and elapsed timer fixed to camera.
 */
export class RaceHud {
  private readonly lapText: Phaser.GameObjects.Text;
  private readonly timeText: Phaser.GameObjects.Text;
  private lastLapDisplay = '';
  private lastTimeDisplay = '';

  constructor(scene: Phaser.Scene) {
    const plateStyle = {
      fontFamily: FONTS.PRIMARY,
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold' as const,
      backgroundColor: '#000000aa',
      padding: { x: 10, y: 6 },
    };

    this.lapText = scene.add
      .text(HUD_INSETS.LEFT, HUD_INSETS.TOP, '', plateStyle)
      .setScrollFactor(0)
      .setDepth(1800);

    this.timeText = scene.add
      .text(GAME_WIDTH / 2, HUD_INSETS.TOP, '', {
        ...plateStyle,
        align: 'center',
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1800);
  }

  update(currentLap: number, totalLaps: number, elapsedMs: number, visible: boolean): void {
    this.lapText.setVisible(visible);
    this.timeText.setVisible(visible);
    if (!visible) return;

    const lapDisplay = `LAP ${currentLap} / ${totalLaps}`;
    if (lapDisplay !== this.lastLapDisplay) {
      this.lastLapDisplay = lapDisplay;
      this.lapText.setText(lapDisplay);
    }

    const timeDisplay = `TIME ${formatRaceTime(elapsedMs)}`;
    if (timeDisplay !== this.lastTimeDisplay) {
      this.lastTimeDisplay = timeDisplay;
      this.timeText.setText(timeDisplay);
    }
  }

  setDimmed(dimmed: boolean): void {
    const alpha = dimmed ? 0.45 : 1;
    this.lapText.setAlpha(alpha);
    this.timeText.setAlpha(alpha);
  }

  reset(): void {
    this.lastLapDisplay = '';
    this.lastTimeDisplay = '';
  }

  destroy(): void {
    this.lapText.destroy();
    this.timeText.destroy();
  }
}

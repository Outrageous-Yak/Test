import Phaser from 'phaser';
import { FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { getTrackDisplayName } from '../data/tracks';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { formatRaceTime } from './formatRaceTime';
import type { RaceResultsPayload } from './RaceResultsTypes';

/**
 * Post-race results overlay with full four-racer finishing order.
 */
export class RaceResultsPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly summaryText: Phaser.GameObjects.Text;
  private raceAgainButton?: TouchButtonHandle;
  private mainMenuButton?: TouchButtonHandle;
  private onRaceAgain?: () => void;
  private onMainMenu?: () => void;

  constructor(scene: Phaser.Scene) {
    this.container = scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(3500)
      .setVisible(false);

    const backdrop = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setScrollFactor(0);

    const title = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.1, 'RACE COMPLETE', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '42px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.summaryText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.36, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.raceAgainButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.74,
      label: 'RACE AGAIN',
      width: 300,
      height: 52,
      onPress: () => this.onRaceAgain?.(),
    });
    this.mainMenuButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.86,
      label: 'MAIN MENU',
      width: 300,
      height: 52,
      onPress: () => this.onMainMenu?.(),
    });

    this.raceAgainButton.container.setScrollFactor(0);
    this.mainMenuButton.container.setScrollFactor(0);

    this.container.add([
      backdrop,
      title,
      this.summaryText,
      this.raceAgainButton.container,
      this.mainMenuButton.container,
    ]);
  }

  setCallbacks(onRaceAgain: () => void, onMainMenu: () => void): void {
    this.onRaceAgain = onRaceAgain;
    this.onMainMenu = onMainMenu;
  }

  show(data: RaceResultsPayload): void {
    const lines = [data.trackName.toUpperCase(), ''];
    data.results.forEach((result) => {
      const you = result.isPlayer ? ' (YOU)' : '';
      const time =
        result.status === 'finished' && result.finishTimeMs !== null
          ? formatRaceTime(result.finishTimeMs)
          : 'DNF';
      const name = result.displayName.padEnd(8, ' ');
      lines.push(`${result.position}. ${name}${you}  ${time}`);
    });

    const career = data.career;
    if (career) {
      lines.push('');
      lines.push(`${career.playerPosition}. YOU`);

      if (career.finishTimeMs !== null) {
        lines.push(`Time: ${formatRaceTime(career.finishTimeMs)}`);
      } else {
        lines.push('Time: DNF');
      }

      if (career.bestTimeMs !== null) {
        lines.push(`Best Time: ${formatRaceTime(career.bestTimeMs)}`);
      }

      if (career.coinsEarned > 0) {
        lines.push(`+${career.coinsEarned} Coins`);
      }

      if (career.isNewRecord) {
        lines.push('');
        lines.push('NEW RECORD!');
      }

      if (career.trackUnlocked) {
        lines.push('');
        lines.push(`${getTrackDisplayName(career.trackUnlocked).toUpperCase()} UNLOCKED!`);
      }

      if (career.trackMarkedComplete && career.trackId === 'volcano-rush') {
        lines.push('');
        lines.push('VOLCANO RUSH COMPLETE!');
      }

      if (career.careerComplete) {
        lines.push('');
        lines.push('ALL TRACKS COMPLETE!');
        lines.push('CAREER COMPLETE!');
      }
    }

    this.summaryText.setText(lines.join('\n'));
    this.container.setVisible(true);
  }

  hide(): void {
    this.container.setVisible(false);
  }

  destroy(): void {
    this.raceAgainButton?.destroy();
    this.mainMenuButton?.destroy();
    this.container.destroy();
  }
}

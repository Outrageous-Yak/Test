import Phaser from 'phaser';
import { FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
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
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.12, 'RACE COMPLETE', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '42px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.summaryText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.34, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.raceAgainButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.72,
      label: 'RACE AGAIN',
      width: 300,
      height: 52,
      onPress: () => this.onRaceAgain?.(),
    });
    this.mainMenuButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.84,
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

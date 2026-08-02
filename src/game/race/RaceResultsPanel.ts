import Phaser from 'phaser';
import { FONTS, GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { formatRaceTime } from './formatRaceTime';

export interface RaceResultsData {
  trackName: string;
  racerName: string;
  carName: string;
  finalTimeMs: number;
  totalLaps: number;
}

/**
 * Post-race results overlay with RACE AGAIN and MAIN MENU actions.
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
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.18, 'RACE COMPLETE', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '48px',
        color: '#ffd700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.summaryText = scene.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.38, '', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '24px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 12,
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.raceAgainButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.68,
      label: 'RACE AGAIN',
      width: 300,
      height: 56,
      onPress: () => this.onRaceAgain?.(),
    });
    this.mainMenuButton = createTouchButton(scene, {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT * 0.8,
      label: 'MAIN MENU',
      width: 300,
      height: 56,
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

  show(data: RaceResultsData): void {
    this.summaryText.setText(
      [
        data.trackName.toUpperCase(),
        `TIME ${formatRaceTime(data.finalTimeMs)}`,
        `LAPS ${data.totalLaps} / ${data.totalLaps}`,
        '',
        `Racer: ${data.racerName}`,
        `Car: ${data.carName}`,
      ].join('\n'),
    );
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

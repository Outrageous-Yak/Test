import Phaser from 'phaser';
import { SCENE_KEYS, COLORS, UI, FONTS } from '../constants';
import { createTouchButton, type TouchButtonHandle } from '../ui/TouchButton';
import { TRACKS, getTrackDisplayName } from '../data/tracks';
import { formatRaceTime } from '../race/formatRaceTime';
import { GameState } from '../state/GameState';
import { fadeInScene, fadeToScene } from '../utils/sceneTransition';

/**
 * Career screen — persistent progression summary.
 */
export class CareerScene extends Phaser.Scene {
  private backButton!: TouchButtonHandle;
  private readonly isTransitioning = { value: false };

  constructor() {
    super({ key: SCENE_KEYS.CAREER });
  }

  create(): void {
    this.isTransitioning.value = false;

    const { width, height } = this.cameras.main;
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND);
    this.add.rectangle(width / 2, height / 2, width, height, COLORS.BACKGROUND_TOP, 0.2);

    this.add
      .text(width / 2, height * 0.07, 'CAREER', {
        fontFamily: FONTS.PRIMARY,
        fontSize: `${UI.TITLE_FONT_SIZE}px`,
        color: '#ffd700',
        fontStyle: 'bold',
        stroke: '#e63946',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const state = GameState.getState();
    const stats = state.careerStatistics;

    const bestTimeLines = TRACKS.map((track) => {
      const best = state.bestTimes[track.id];
      const time = best !== undefined ? formatRaceTime(best) : '—';
      return `${track.name}: ${time}`;
    }).join('\n');

    const unlockedLines = state.unlockedTracks
      .map((id) => getTrackDisplayName(id))
      .join(', ');

    const completedLines =
      state.completedTracks.length > 0
        ? state.completedTracks.map((id) => getTrackDisplayName(id)).join(', ')
        : 'None yet';

    const fastestLap =
      stats.fastestLapMs !== null ? formatRaceTime(stats.fastestLapMs) : '—';

    const body = [
      `Coins: ${state.coins}`,
      `Wins: ${stats.wins}`,
      `Races: ${stats.racesFinished} / ${stats.racesStarted} finished`,
      '',
      'Best Times',
      bestTimeLines,
      '',
      `Unlocked Tracks: ${unlockedLines}`,
      `Completed Tracks: ${completedLines}`,
      `Fastest Lap: ${fastestLap}`,
    ].join('\n');

    this.add
      .text(width / 2, height * 0.48, body, {
        fontFamily: FONTS.PRIMARY,
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    this.backButton = createTouchButton(this, {
      x: width / 2,
      y: height * 0.9,
      label: 'BACK',
      width: UI.MENU_BUTTON_WIDTH,
      height: UI.MENU_BUTTON_HEIGHT,
      onPress: () => this.goBack(),
    });

    this.input.keyboard?.on('keydown-ESC', this.onEscapeKey, this);
    fadeInScene(this);
  }

  shutdown(): void {
    this.backButton?.destroy();
    this.input.keyboard?.off('keydown-ESC', this.onEscapeKey, this);
  }

  private readonly onEscapeKey = (): void => {
    this.goBack();
  };

  private goBack(): void {
    fadeToScene(this, SCENE_KEYS.MAIN_MENU, this.isTransitioning);
  }
}

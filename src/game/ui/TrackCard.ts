import Phaser from 'phaser';
import { FONTS } from '../constants';
import { formatRaceTime } from '../race/formatRaceTime';
import {
  getDifficultyLabel,
  getDifficultyMarkers,
  type TrackDefinition,
} from '../data/tracks';

export type TrackCardStatus = 'locked' | 'unlocked' | 'complete';

export interface TrackCardOptions {
  x: number;
  y: number;
  track: TrackDefinition;
  status?: TrackCardStatus;
  bestTimeMs?: number | null;
  selected?: boolean;
  width?: number;
  height?: number;
  onSelect: (trackId: TrackDefinition['id']) => void;
}

export interface TrackCardHandle {
  container: Phaser.GameObjects.Container;
  setSelected: (selected: boolean) => void;
  setStatus: (status: TrackCardStatus, bestTimeMs?: number | null) => void;
  getTrackId: () => TrackDefinition['id'];
  destroy: () => void;
}

const CARD_WIDTH = 250;
const CARD_HEIGHT = 360;

function createMeadowsPreview(scene: Phaser.Scene, track: TrackDefinition, alpha: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, -20);
  c.add(scene.add.rectangle(0, 20, 180, 50, 0xfff5e6, alpha));
  c.add(scene.add.ellipse(0, 10, 140, 30, track.secondaryColor, alpha));
  c.add(scene.add.circle(-60, -30, 18, track.accentColor, alpha));
  c.add(scene.add.circle(50, -10, 14, track.secondaryColor, alpha));
  c.add(scene.add.rectangle(50, 2, 6, 18, 0x5d4037, alpha));
  c.add(scene.add.circle(80, -5, 16, track.secondaryColor, alpha));
  c.add(scene.add.rectangle(80, 8, 6, 20, 0x5d4037, alpha));
  return c;
}

function createCoastPreview(scene: Phaser.Scene, track: TrackDefinition, alpha: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, -20);
  c.add(scene.add.rectangle(0, 30, 190, 40, track.accentColor, alpha));
  c.add(scene.add.rectangle(0, 0, 190, 50, track.secondaryColor, alpha * 0.9));
  c.add(scene.add.ellipse(-30, 15, 50, 12, 0xffffff, alpha * 0.5));
  c.add(scene.add.ellipse(20, 20, 40, 10, 0xffffff, alpha * 0.4));
  c.add(scene.add.circle(70, -25, 10, track.primaryColor, alpha));
  return c;
}

function createVolcanoPreview(scene: Phaser.Scene, track: TrackDefinition, alpha: number): Phaser.GameObjects.Container {
  const c = scene.add.container(0, -20);
  c.add(scene.add.rectangle(0, 25, 180, 45, track.secondaryColor, alpha));
  c.add(scene.add.triangle(0, -15, 0, -45, 50, 20, -50, 20, track.secondaryColor, alpha));
  c.add(scene.add.rectangle(0, 10, 100, 12, track.primaryColor, alpha));
  c.add(scene.add.circle(-40, 15, 8, track.primaryColor, alpha));
  c.add(scene.add.circle(30, 18, 6, track.accentColor, alpha));
  return c;
}

function createTrackPreview(
  scene: Phaser.Scene,
  track: TrackDefinition,
  locked: boolean,
): Phaser.GameObjects.Container {
  const alpha = locked ? 0.35 : 1;
  switch (track.id) {
    case 'mango-meadows':
      return createMeadowsPreview(scene, track, alpha);
    case 'ruby-coast':
      return createCoastPreview(scene, track, alpha);
    case 'volcano-rush':
      return createVolcanoPreview(scene, track, alpha);
  }
}

function getStatusLabel(status: TrackCardStatus): string {
  switch (status) {
    case 'locked':
      return 'LOCKED';
    case 'unlocked':
      return 'UNLOCKED';
    case 'complete':
      return '✓ COMPLETE';
  }
}

function getStatusColor(status: TrackCardStatus): string {
  switch (status) {
    case 'locked':
      return '#ffaaaa';
    case 'unlocked':
      return '#aaffaa';
    case 'complete':
      return '#ffd700';
  }
}

/**
 * Reusable track selection card.
 * Reports selection via callback — does not mutate GameState directly.
 */
export function createTrackCard(scene: Phaser.Scene, options: TrackCardOptions): TrackCardHandle {
  const {
    x,
    y,
    track,
    status: initialStatus = 'unlocked',
    bestTimeMs: initialBestTime = null,
    selected = false,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    onSelect,
  } = options;

  const container = scene.add.container(x, y);

  const background = scene.add
    .rectangle(0, 0, width, height, track.primaryColor, initialStatus === 'locked' ? 0.3 : 0.85)
    .setStrokeStyle(3, track.accentColor, 0.6);

  const previewContainer = createTrackPreview(scene, track, initialStatus === 'locked');

  const labelText = scene.add
    .text(0, -height * 0.28, track.previewLabel, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const nameText = scene.add
    .text(0, height * 0.02, track.name.toUpperCase(), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 20 },
    })
    .setOrigin(0.5);

  const difficultyText = scene.add
    .text(0, height * 0.12, getDifficultyLabel(track.difficulty), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const difficultyMarkers = scene.add
    .text(0, height * 0.18, getDifficultyMarkers(track.difficulty), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '14px',
      color: '#fff5e6',
    })
    .setOrigin(0.5);

  const bestTimeText = scene.add
    .text(0, height * 0.24, '', {
      fontFamily: FONTS.PRIMARY,
      fontSize: '14px',
      color: '#e0e0e0',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const statusText = scene.add
    .text(0, height * 0.3, getStatusLabel(initialStatus), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '14px',
      color: getStatusColor(initialStatus),
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const lockHint = scene.add
    .text(0, height * 0.4, initialStatus === 'locked' ? track.unlockHint : track.subtitle, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '13px',
      color: '#f0f0f0',
      align: 'center',
      wordWrap: { width: width - 24 },
    })
    .setOrigin(0.5, 0);

  const lockIcon = scene.add
    .text(0, -height * 0.1, '🔒', {
      fontFamily: FONTS.PRIMARY,
      fontSize: '28px',
    })
    .setOrigin(0.5)
    .setVisible(initialStatus === 'locked');

  const selectionRing = scene.add
    .rectangle(0, 0, width + 10, height + 10)
    .setStrokeStyle(4, 0xffffff, 1)
    .setFillStyle(0xffffff, 0)
    .setVisible(selected);

  container.add([
    selectionRing,
    background,
    previewContainer,
    lockIcon,
    labelText,
    nameText,
    difficultyText,
    difficultyMarkers,
    bestTimeText,
    statusText,
    lockHint,
  ]);

  let cardStatus = initialStatus;
  let isSelected = selected;
  let isPressed = false;

  const updateBestTimeDisplay = (bestTime: number | null): void => {
    if (cardStatus === 'locked') {
      bestTimeText.setText('');
      return;
    }
    if (bestTime !== null && bestTime > 0) {
      bestTimeText.setText(`Best: ${formatRaceTime(bestTime)}`);
    } else {
      bestTimeText.setText('Best: —');
    }
  };

  updateBestTimeDisplay(initialBestTime);

  const applySelectedVisual = (): void => {
    const locked = cardStatus === 'locked';
    selectionRing.setVisible(isSelected && !locked);
    background.setStrokeStyle(3, track.accentColor, isSelected ? 1 : 0.6);
    container.setScale(isSelected && !locked ? 1.03 : 1);
  };

  const setSelected = (value: boolean): void => {
    isSelected = value;
    applySelectedVisual();
  };

  const setStatus = (status: TrackCardStatus, bestTimeMs: number | null = null): void => {
    cardStatus = status;
    const locked = status === 'locked';
    background.setAlpha(locked ? 0.3 : 0.85);
    lockIcon.setVisible(locked);
    statusText.setText(getStatusLabel(status));
    statusText.setColor(getStatusColor(status));
    lockHint.setText(locked ? track.unlockHint : track.subtitle);
    updateBestTimeDisplay(bestTimeMs);
    previewContainer.setAlpha(locked ? 0.35 : 1);

    if (locked) {
      background.disableInteractive();
      setSelected(false);
    } else {
      background.setInteractive({ useHandCursor: true });
    }
    applySelectedVisual();
  };

  const onPointerOver = (): void => {
    if (cardStatus === 'locked') return;
    background.setAlpha(1);
  };

  const onPointerOut = (): void => {
    if (cardStatus === 'locked') return;
    isPressed = false;
    background.setAlpha(0.85);
  };

  const onPointerDown = (): void => {
    if (cardStatus === 'locked') return;
    isPressed = true;
    container.setScale(0.98);
  };

  const onPointerUp = (): void => {
    if (cardStatus === 'locked' || !isPressed) return;
    isPressed = false;
    container.setScale(isSelected ? 1.03 : 1);
    onSelect(track.id);
  };

  if (initialStatus !== 'locked') {
    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', onPointerOver);
    background.on('pointerout', onPointerOut);
    background.on('pointerdown', onPointerDown);
    background.on('pointerup', onPointerUp);
  }

  applySelectedVisual();

  return {
    container,
    setSelected,
    setStatus,
    getTrackId: () => track.id,
    destroy: () => {
      background.off('pointerover', onPointerOver);
      background.off('pointerout', onPointerOut);
      background.off('pointerdown', onPointerDown);
      background.off('pointerup', onPointerUp);
      container.destroy(true);
    },
  };
}

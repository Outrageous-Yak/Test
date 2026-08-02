import Phaser from 'phaser';
import { FONTS } from '../constants';
import {
  getDifficultyLabel,
  getDifficultyMarkers,
  type TrackDefinition,
} from '../data/tracks';

export interface TrackCardOptions {
  x: number;
  y: number;
  track: TrackDefinition;
  locked?: boolean;
  selected?: boolean;
  width?: number;
  height?: number;
  onSelect: (trackId: TrackDefinition['id']) => void;
}

export interface TrackCardHandle {
  container: Phaser.GameObjects.Container;
  setSelected: (selected: boolean) => void;
  setLocked: (locked: boolean) => void;
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

/**
 * Reusable track selection card.
 * Reports selection via callback — does not mutate GameState directly.
 */
export function createTrackCard(scene: Phaser.Scene, options: TrackCardOptions): TrackCardHandle {
  const {
    x,
    y,
    track,
    locked = false,
    selected = false,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    onSelect,
  } = options;

  const container = scene.add.container(x, y);

  const background = scene.add
    .rectangle(0, 0, width, height, track.primaryColor, locked ? 0.3 : 0.85)
    .setStrokeStyle(3, track.accentColor, 0.6);

  const previewContainer = createTrackPreview(scene, track, locked);

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
    .text(0, height * 0.14, getDifficultyLabel(track.difficulty), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const difficultyMarkers = scene.add
    .text(0, height * 0.2, getDifficultyMarkers(track.difficulty), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '14px',
      color: '#fff5e6',
    })
    .setOrigin(0.5);

  const statusText = scene.add
    .text(0, height * 0.3, locked ? 'LOCKED' : 'UNLOCKED', {
      fontFamily: FONTS.PRIMARY,
      fontSize: '14px',
      color: locked ? '#ffaaaa' : '#aaffaa',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const lockHint = scene.add
    .text(0, height * 0.4, locked ? track.unlockHint : track.subtitle, {
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
    .setVisible(locked);

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
    statusText,
    lockHint,
  ]);

  let isLocked = locked;
  let isSelected = selected;
  let isPressed = false;

  const applySelectedVisual = (): void => {
    selectionRing.setVisible(isSelected && !isLocked);
    background.setStrokeStyle(3, track.accentColor, isSelected ? 1 : 0.6);
    container.setScale(isSelected && !isLocked ? 1.03 : 1);
  };

  const setSelected = (value: boolean): void => {
    isSelected = value;
    applySelectedVisual();
  };

  const setLocked = (value: boolean): void => {
    isLocked = value;
    background.setAlpha(value ? 0.3 : 0.85);
    lockIcon.setVisible(value);
    statusText.setText(value ? 'LOCKED' : 'UNLOCKED');
    statusText.setColor(value ? '#ffaaaa' : '#aaffaa');
    lockHint.setText(value ? track.unlockHint : track.subtitle);
    if (value) {
      background.disableInteractive();
      setSelected(false);
    } else {
      background.setInteractive({ useHandCursor: true });
    }
    applySelectedVisual();
  };

  const onPointerOver = (): void => {
    if (isLocked) return;
    background.setAlpha(1);
  };

  const onPointerOut = (): void => {
    if (isLocked) return;
    isPressed = false;
    background.setAlpha(0.85);
  };

  const onPointerDown = (): void => {
    if (isLocked) return;
    isPressed = true;
    container.setScale(0.98);
  };

  const onPointerUp = (): void => {
    if (isLocked || !isPressed) return;
    isPressed = false;
    container.setScale(isSelected ? 1.03 : 1);
    onSelect(track.id);
  };

  if (!locked) {
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
    setLocked,
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

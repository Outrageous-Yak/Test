import Phaser from 'phaser';
import { FONTS } from '../constants';
import type { CharacterDefinition } from '../data/characters';

export interface CharacterCardOptions {
  x: number;
  y: number;
  character: CharacterDefinition;
  locked?: boolean;
  selected?: boolean;
  width?: number;
  height?: number;
  onSelect: (characterId: CharacterDefinition['id']) => void;
}

export interface CharacterCardHandle {
  container: Phaser.GameObjects.Container;
  setSelected: (selected: boolean) => void;
  setLocked: (locked: boolean) => void;
  getCharacterId: () => CharacterDefinition['id'];
  destroy: () => void;
}

const CARD_WIDTH = 300;
const CARD_HEIGHT = 340;
const PORTRAIT_SIZE = 110;

/**
 * Reusable character selection card.
 * Reports selection via callback — does not mutate GameState directly.
 */
export function createCharacterCard(
  scene: Phaser.Scene,
  options: CharacterCardOptions,
): CharacterCardHandle {
  const {
    x,
    y,
    character,
    locked = false,
    selected = false,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    onSelect,
  } = options;

  const container = scene.add.container(x, y);

  const background = scene.add
    .rectangle(0, 0, width, height, character.color, locked ? 0.35 : 0.9)
    .setStrokeStyle(4, character.accentColor, 0.5);

  const portraitContainer = scene.add.container(0, -height * 0.18);
  const portraitBg = scene.add.circle(0, 0, PORTRAIT_SIZE / 2, character.portraitColor, locked ? 0.4 : 1);
  const portraitInitial = scene.add
    .text(0, 0, character.initial, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '56px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);
  portraitContainer.add([portraitBg, portraitInitial]);

  const nameText = scene.add
    .text(0, height * 0.08, character.name.toUpperCase(), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const titleText = scene.add
    .text(0, height * 0.2, character.title, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '18px',
      color: '#ffffff',
    })
    .setOrigin(0.5);

  const descriptionText = scene.add
    .text(0, height * 0.34, character.description, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '16px',
      color: '#f5f5f5',
      align: 'center',
      wordWrap: { width: width - 40 },
    })
    .setOrigin(0.5, 0);

  const lockIcon = scene.add
    .text(0, -height * 0.18, '🔒', {
      fontFamily: FONTS.PRIMARY,
      fontSize: '36px',
    })
    .setOrigin(0.5)
    .setVisible(locked);

  const selectionRing = scene.add
    .rectangle(0, 0, width + 12, height + 12)
    .setStrokeStyle(5, 0xffffff, 1)
    .setFillStyle(0xffffff, 0)
    .setVisible(selected);

  container.add([
    selectionRing,
    background,
    portraitContainer,
    lockIcon,
    nameText,
    titleText,
    descriptionText,
  ]);

  let isLocked = locked;
  let isSelected = selected;
  let isPressed = false;

  const applySelectedVisual = (): void => {
    selectionRing.setVisible(isSelected && !isLocked);
    background.setStrokeStyle(4, character.accentColor, isSelected ? 1 : 0.5);
    container.setScale(isSelected && !isLocked ? 1.04 : 1);
  };

  const setSelected = (value: boolean): void => {
    isSelected = value;
    applySelectedVisual();
  };

  const setLocked = (value: boolean): void => {
    isLocked = value;
    background.setAlpha(value ? 0.35 : 0.9);
    portraitBg.setAlpha(value ? 0.4 : 1);
    lockIcon.setVisible(value);
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
    background.setAlpha(0.9);
  };

  const onPointerDown = (): void => {
    if (isLocked) return;
    isPressed = true;
    container.setScale(0.98);
  };

  const onPointerUp = (): void => {
    if (isLocked || !isPressed) return;
    isPressed = false;
    container.setScale(isSelected ? 1.04 : 1);
    onSelect(character.id);
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
    getCharacterId: () => character.id,
    destroy: () => {
      background.off('pointerover', onPointerOver);
      background.off('pointerout', onPointerOut);
      background.off('pointerdown', onPointerDown);
      background.off('pointerup', onPointerUp);
      container.destroy(true);
    },
  };
}

import Phaser from 'phaser';
import { FONTS, UI } from '../constants';
import type { CarDefinition } from '../data/cars';

export interface CarCardOptions {
  x: number;
  y: number;
  car: CarDefinition;
  locked?: boolean;
  selected?: boolean;
  width?: number;
  height?: number;
  onSelect: (carId: CarDefinition['id']) => void;
}

export interface CarCardHandle {
  container: Phaser.GameObjects.Container;
  setSelected: (selected: boolean) => void;
  setLocked: (locked: boolean) => void;
  getCarId: () => CarDefinition['id'];
  destroy: () => void;
}

const CARD_WIDTH = 300;
const CARD_HEIGHT = 340;

/** Placeholder side-profile car made from simple shapes — replace with sprite later */
function createCarPlaceholderVisual(
  scene: Phaser.Scene,
  car: CarDefinition,
  locked: boolean,
): Phaser.GameObjects.Container {
  const visualContainer = scene.add.container(0, -CARD_HEIGHT * 0.14);
  const alpha = locked ? 0.4 : 1;

  const body = scene.add
    .rectangle(0, 4, 130, 42, car.primaryColor, alpha)
    .setStrokeStyle(2, car.accentColor, alpha);

  const roof = scene.add
    .rectangle(8, -16, 72, 26, car.secondaryColor, alpha)
    .setStrokeStyle(2, car.accentColor, alpha * 0.8);

  const stripe = scene.add.rectangle(0, 0, 110, 8, car.accentColor, alpha);

  const wheelColor = 0x2b2b2b;
  const wheelLeft = scene.add.circle(-38, 22, 13, wheelColor, alpha);
  const wheelRight = scene.add.circle(38, 22, 13, wheelColor, alpha);

  visualContainer.add([body, roof, stripe, wheelLeft, wheelRight]);
  return visualContainer;
}

/**
 * Reusable car selection card.
 * Reports selection via callback — does not mutate GameState directly.
 */
export function createCarCard(scene: Phaser.Scene, options: CarCardOptions): CarCardHandle {
  const {
    x,
    y,
    car,
    locked = false,
    selected = false,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    onSelect,
  } = options;

  const container = scene.add.container(x, y);

  const background = scene.add
    .rectangle(0, 0, width, height, car.primaryColor, locked ? 0.35 : 0.85)
    .setStrokeStyle(4, car.accentColor, 0.5);

  const visualContainer = createCarPlaceholderVisual(scene, car, locked);

  const nameText = scene.add
    .text(0, height * 0.1, car.name.toUpperCase(), {
      fontFamily: FONTS.PRIMARY,
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);

  const subtitleText = scene.add
    .text(0, height * 0.22, car.subtitle, {
      fontFamily: FONTS.PRIMARY,
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: width - 36 },
    })
    .setOrigin(0.5);

  const descriptionText = scene.add
    .text(0, height * 0.36, car.description, {
      fontFamily: FONTS.PRIMARY,
      fontSize: `${UI.PANEL_BODY_FONT_SIZE - 2}px`,
      color: '#f5f5f5',
      align: 'center',
      wordWrap: { width: width - 40 },
    })
    .setOrigin(0.5, 0);

  const lockIcon = scene.add
    .text(0, -height * 0.14, '🔒', {
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
    visualContainer,
    lockIcon,
    nameText,
    subtitleText,
    descriptionText,
  ]);

  let isLocked = locked;
  let isSelected = selected;
  let isPressed = false;

  const applySelectedVisual = (): void => {
    selectionRing.setVisible(isSelected && !isLocked);
    background.setStrokeStyle(4, car.accentColor, isSelected ? 1 : 0.5);
    container.setScale(isSelected && !isLocked ? 1.04 : 1);
  };

  const setSelected = (value: boolean): void => {
    isSelected = value;
    applySelectedVisual();
  };

  const setLocked = (value: boolean): void => {
    isLocked = value;
    background.setAlpha(value ? 0.35 : 0.85);
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
    container.setScale(isSelected ? 1.04 : 1);
    onSelect(car.id);
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
    getCarId: () => car.id,
    destroy: () => {
      background.off('pointerover', onPointerOver);
      background.off('pointerout', onPointerOut);
      background.off('pointerdown', onPointerDown);
      background.off('pointerup', onPointerUp);
      container.destroy(true);
    },
  };
}

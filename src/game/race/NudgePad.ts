import Phaser from 'phaser';
import { FONTS } from '../constants';
import {
  computePadGeometry,
  controlsFromNudgeVector,
  getNudgeActionLabel,
  isPointerInsidePanel,
  knobRadius,
  pointerToPanelCoords,
  vectorFromTouch,
  type NudgeVector,
  type PadGeometry,
  type ReverseLatchState,
} from './nudgePadLogic';
import type { DriveIntent } from './raceInput';
import { ZERO_DRIVE_INTENT } from './raceInput';

/** Default on-screen pad size (logical px) — tuned for iPhone landscape thumbs. */
export const NUDGE_PAD_WIDTH = 240;
export const NUDGE_PAD_HEIGHT = 256;

const NUDGE_PAD_DEPTH = 2100;

const NUDGE_PAD_COLORS = {
  BACKGROUND: 0x141821,
  RIM: 0x384253,
  RING: 0x5da6f4,
  CROSSHAIR: 0x5da6f4,
  KNOB_FILL: 0xe8e9ee,
  KNOB_ACTIVE: 0x5da6f4,
  KNOB_IDLE: 0xaeb3bf,
  TITLE: '#f2f2f2',
  SPEED: '#d0d2d8',
} as const;

const RING_FRACTIONS: ReadonlyArray<{ fraction: number; alpha: number }> = [
  { fraction: 1.0, alpha: 0.3 },
  { fraction: 0.8, alpha: 0.24 },
  { fraction: 0.6, alpha: 0.2 },
  { fraction: 0.4, alpha: 0.16 },
  { fraction: 0.2, alpha: 0.12 },
];

export interface NudgePadOptions {
  x: number;
  y: number;
  width?: number;
  height?: number;
  title?: string;
  depth?: number;
}

/**
 * Continuous 360-degree driving pad.
 * Uses scene-level pointer routing (not container hit tests) for reliable mobile touch.
 */
export class NudgePad {
  private readonly scene: Phaser.Scene;
  private readonly centerX: number;
  private readonly centerY: number;
  private readonly panelWidth: number;
  private readonly panelHeight: number;
  private readonly depth: number;
  private readonly root: Phaser.GameObjects.Container;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly titleLabel: Phaser.GameObjects.Text;
  private readonly speedLabel: Phaser.GameObjects.Text;

  private active = false;
  private vector: NudgeVector = { x: 0, y: 0 };
  private enabled = true;
  private dimmed = false;
  private pointerId: number | null = null;
  private dragListenersAttached = false;

  constructor(scene: Phaser.Scene, options: NudgePadOptions) {
    this.scene = scene;
    this.centerX = options.x;
    this.centerY = options.y;
    this.panelWidth = options.width ?? NUDGE_PAD_WIDTH;
    this.panelHeight = options.height ?? NUDGE_PAD_HEIGHT;
    this.depth = options.depth ?? NUDGE_PAD_DEPTH;
    const title = options.title ?? 'DRIVE';

    this.root = scene.add
      .container(this.centerX, this.centerY)
      .setScrollFactor(0)
      .setDepth(this.depth);

    const background = scene.add
      .rectangle(0, 0, this.panelWidth, this.panelHeight, NUDGE_PAD_COLORS.BACKGROUND, 1)
      .setOrigin(0.5);

    this.graphics = scene.add.graphics();
    this.titleLabel = scene.add
      .text(0, -this.panelHeight / 2 + 20, title, {
        fontFamily: FONTS.PRIMARY,
        fontSize: '17px',
        color: NUDGE_PAD_COLORS.TITLE,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.speedLabel = scene.add
      .text(0, this.panelHeight / 2 - 18, 'COAST', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '12px',
        color: NUDGE_PAD_COLORS.SPEED,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.root.add([background, this.graphics, this.titleLabel, this.speedLabel]);

    this.scene.input.on('pointerdown', this.onGlobalPointerDown, this);
    this.redraw();
  }

  updateActionLabel(intent: DriveIntent, signedSpeed: number, latch: ReverseLatchState): void {
    this.speedLabel.setText(getNudgeActionLabel(intent, signedSpeed, latch));
  }

  getDriveIntent(): DriveIntent {
    if (!this.enabled || !this.active) {
      return { ...ZERO_DRIVE_INTENT };
    }
    return controlsFromNudgeVector(this.vector);
  }

  getVector(): Readonly<NudgeVector> {
    return this.vector;
  }

  isActive(): boolean {
    return this.active;
  }

  setVisible(visible: boolean): void {
    this.root.setVisible(visible);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.resetPad();
    }
    this.applyDimState();
  }

  setDimmed(dimmed: boolean): void {
    this.dimmed = dimmed;
    this.applyDimState();
  }

  clearInput(): void {
    this.resetPad();
  }

  destroy(): void {
    this.resetPad();
    this.scene.input.off('pointerdown', this.onGlobalPointerDown, this);
    this.root.destroy(true);
  }

  private applyDimState(): void {
    const alpha = !this.enabled || this.dimmed ? 0.4 : 1;
    this.root.setAlpha(alpha);
  }

  private onGlobalPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.root.visible) return;
    if (this.active && this.pointerId !== pointer.id) return;
    if (!this.containsPointer(pointer)) return;

    pointer.event?.stopPropagation();
    this.beginPointer(pointer);
  }

  private beginPointer(pointer: Phaser.Input.Pointer): void {
    this.active = true;
    this.pointerId = pointer.id;
    this.attachDragListeners();
    this.updateFromPointer(pointer);
  }

  private onDragPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.active || this.pointerId !== pointer.id) return;
    this.updateFromPointer(pointer);
  }

  private onDragPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null && pointer.id !== this.pointerId) return;
    this.resetPad();
  }

  private attachDragListeners(): void {
    if (this.dragListenersAttached) return;
    this.dragListenersAttached = true;
    this.scene.input.on('pointermove', this.onDragPointerMove, this);
    this.scene.input.on('pointerup', this.onDragPointerUp, this);
    this.scene.input.on('pointerupoutside', this.onDragPointerUp, this);
    this.scene.input.on('pointercancel', this.onDragPointerUp, this);
  }

  private detachDragListeners(): void {
    if (!this.dragListenersAttached) return;
    this.dragListenersAttached = false;
    this.scene.input.off('pointermove', this.onDragPointerMove, this);
    this.scene.input.off('pointerup', this.onDragPointerUp, this);
    this.scene.input.off('pointerupoutside', this.onDragPointerUp, this);
    this.scene.input.off('pointercancel', this.onDragPointerUp, this);
  }

  private resetPad(): void {
    this.active = false;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.speedLabel.setText('COAST');
    this.detachDragListeners();
    this.redraw();
  }

  private containsPointer(pointer: Phaser.Input.Pointer): boolean {
    return isPointerInsidePanel(
      pointer.x,
      pointer.y,
      this.centerX,
      this.centerY,
      this.panelWidth,
      this.panelHeight,
    );
  }

  private updateFromPointer(pointer: Phaser.Input.Pointer): void {
    const panel = pointerToPanelCoords(
      pointer.x,
      pointer.y,
      this.centerX,
      this.centerY,
      this.panelWidth,
      this.panelHeight,
    );
    const geometry = this.localPadGeometry();
    this.vector = vectorFromTouch(panel.x, panel.y, geometry);
    this.redraw();
  }

  private localPadGeometry(): PadGeometry {
    return computePadGeometry(this.panelWidth, this.panelHeight);
  }

  private redraw(): void {
    const geometry = this.localPadGeometry();
    const { cx, cy, radius } = geometry;
    const knobR = knobRadius(radius);
    const knobX = cx + this.vector.x * radius;
    const knobY = cy + this.vector.y * radius;

    const g = this.graphics;
    g.clear();

    const panelLeft = -this.panelWidth / 2;
    const panelTop = -this.panelHeight / 2;

    g.lineStyle(1.2, NUDGE_PAD_COLORS.RIM, 1);
    g.strokeRoundedRect(panelLeft + 0.5, panelTop + 0.5, this.panelWidth - 1, this.panelHeight - 1, 18);

    const drawX = panelLeft + cx;
    const drawY = panelTop + cy;

    for (const { fraction, alpha } of RING_FRACTIONS) {
      const r = radius * fraction;
      g.lineStyle(1, NUDGE_PAD_COLORS.RING, alpha);
      g.strokeCircle(drawX, drawY, r);
    }

    g.lineStyle(1, NUDGE_PAD_COLORS.CROSSHAIR, 0.34);
    g.beginPath();
    g.moveTo(drawX - radius, drawY);
    g.lineTo(drawX + radius, drawY);
    g.strokePath();
    g.beginPath();
    g.moveTo(drawX, drawY - radius);
    g.lineTo(drawX, drawY + radius);
    g.strokePath();

    g.fillStyle(0x000000, 0.35);
    g.fillCircle(knobX + panelLeft - 1, knobY + panelTop + 2, knobR + 1);

    g.fillStyle(NUDGE_PAD_COLORS.KNOB_FILL, 1);
    g.fillCircle(knobX + panelLeft, knobY + panelTop, knobR);

    g.lineStyle(2, this.active ? NUDGE_PAD_COLORS.KNOB_ACTIVE : NUDGE_PAD_COLORS.KNOB_IDLE, 1);
    g.strokeCircle(knobX + panelLeft, knobY + panelTop, knobR);
  }
}

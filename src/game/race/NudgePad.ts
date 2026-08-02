import Phaser from 'phaser';
import { FONTS } from '../constants';
import {
  computePadGeometry,
  knobRadius,
  speedForMagnitude,
  steerFromNudgeVector,
  vectorFromTouch,
  vectorMagnitude,
  type NudgeVector,
  type PadGeometry,
} from './nudgePadLogic';

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
  width: number;
  height: number;
  title?: string;
  depth?: number;
}

/**
 * Continuous 360-degree steering pad — Phaser reimplementation of the reference
 * nudge pad visual and touch behaviour (analog vector + magnitude tiers).
 */
export class NudgePad {
  private readonly container: Phaser.GameObjects.Container;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly titleLabel: Phaser.GameObjects.Text;
  private readonly speedLabel: Phaser.GameObjects.Text;
  private readonly hitZone: Phaser.GameObjects.Rectangle;
  private readonly panelWidth: number;
  private readonly panelHeight: number;
  private readonly title: string;

  private active = false;
  private vector: NudgeVector = { x: 0, y: 0 };
  private enabled = true;
  private dimmed = false;
  private pointerId: number | null = null;

  constructor(scene: Phaser.Scene, options: NudgePadOptions) {
    this.panelWidth = options.width;
    this.panelHeight = options.height;
    this.title = options.title ?? 'STEER';

    const depth = options.depth ?? 1000;

    this.container = scene.add.container(options.x, options.y).setScrollFactor(0).setDepth(depth);

    const background = scene.add
      .rectangle(0, 0, this.panelWidth, this.panelHeight, NUDGE_PAD_COLORS.BACKGROUND, 1)
      .setOrigin(0.5);

    this.graphics = scene.add.graphics();
    this.titleLabel = scene.add
      .text(0, -this.panelHeight / 2 + 17, this.title, {
        fontFamily: FONTS.PRIMARY,
        fontSize: '15px',
        color: NUDGE_PAD_COLORS.TITLE,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.speedLabel = scene.add
      .text(0, this.panelHeight / 2 - 16, 'STOP', {
        fontFamily: FONTS.PRIMARY,
        fontSize: '10px',
        color: NUDGE_PAD_COLORS.SPEED,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    this.hitZone = scene.add
      .rectangle(0, 0, this.panelWidth, this.panelHeight, 0xffffff, 0.001)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: false });

    this.container.add([background, this.graphics, this.titleLabel, this.speedLabel, this.hitZone]);

    this.hitZone.on('pointerdown', this.onPointerDown, this);
    this.hitZone.on('pointermove', this.onPointerMove, this);
    this.hitZone.on('pointerup', this.onPointerUp, this);
    this.hitZone.on('pointerupoutside', this.onPointerUp, this);

    this.redraw();
  }

  tick(_deltaMs: number): void {
    if (!this.active) return;

    const tier = speedForMagnitude(vectorMagnitude(this.vector));
    this.speedLabel.setText(tier.label);
  }

  getSteer(): number {
    if (!this.enabled) return 0;
    return steerFromNudgeVector(this.vector);
  }

  getVector(): Readonly<NudgeVector> {
    return this.vector;
  }

  isActive(): boolean {
    return this.active;
  }

  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
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
    this.hitZone.off('pointerdown', this.onPointerDown, this);
    this.hitZone.off('pointermove', this.onPointerMove, this);
    this.hitZone.off('pointerup', this.onPointerUp, this);
    this.hitZone.off('pointerupoutside', this.onPointerUp, this);
    this.container.destroy(true);
  }

  private applyDimState(): void {
    const alpha = !this.enabled || this.dimmed ? 0.4 : 1;
    this.container.setAlpha(alpha);
    if (!this.enabled) {
      this.hitZone.disableInteractive();
    } else {
      this.hitZone.setInteractive({ useHandCursor: false });
    }
  }

  private localPadGeometry(): PadGeometry {
    return computePadGeometry(this.panelWidth, this.panelHeight);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;
    this.active = true;
    this.pointerId = pointer.id;
    this.updateFromPointer(pointer);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled || !this.active || this.pointerId !== pointer.id) return;
    this.updateFromPointer(pointer);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer): void {
    if (this.pointerId !== null && pointer.id !== this.pointerId) return;
    this.resetPad();
  }

  private resetPad(): void {
    this.active = false;
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.speedLabel.setText('STOP');
    this.redraw();
  }

  private updateFromPointer(pointer: Phaser.Input.Pointer): void {
    const geometry = this.localPadGeometry();
    const localX = pointer.x - this.container.x + this.panelWidth / 2;
    const localY = pointer.y - this.container.y + this.panelHeight / 2;

    this.vector = vectorFromTouch(localX, localY, geometry);
    this.redraw();
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

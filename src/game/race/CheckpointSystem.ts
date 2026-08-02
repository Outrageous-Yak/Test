import Phaser from 'phaser';
import type { CheckpointDefinition } from './raceTypes';

export interface CheckpointZone {
  definition: CheckpointDefinition;
  debugGraphic: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

function isInsideRotatedRect(
  px: number,
  py: number,
  cx: number,
  cy: number,
  width: number,
  height: number,
  rotation: number,
): boolean {
  const cos = Math.cos(-rotation);
  const sin = Math.sin(-rotation);
  const dx = px - cx;
  const dy = py - cy;
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
}

/**
 * Invisible checkpoint trigger zones with optional debug overlays.
 * Entry/exit is evaluated once per update — no per-frame object creation.
 */
export class CheckpointSystem {
  private readonly scene: Phaser.Scene;
  private readonly zones: CheckpointZone[] = [];
  private readonly insideIndices = new Set<number>();
  private enabled = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(definitions: readonly CheckpointDefinition[]): void {
    this.destroyZones();

    definitions.forEach((definition) => {
      const debugGraphic = this.scene.add
        .rectangle(definition.x, definition.y, definition.width, definition.height, 0x00ffff, 0.25)
        .setRotation(definition.rotation)
        .setStrokeStyle(2, 0x00ffff, 0.9)
        .setDepth(6)
        .setVisible(false);

      const label = this.scene.add
        .text(definition.x, definition.y - 18, String(definition.index), {
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '14px',
          color: '#00ffff',
          backgroundColor: '#000000aa',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5)
        .setDepth(7)
        .setVisible(false);

      this.zones.push({ definition, debugGraphic, label });
    });
  }

  onEnter?: (index: number) => void;
  onExit?: (index: number) => void;

  update(playerX: number, playerY: number): void {
    if (!this.enabled) return;

    this.zones.forEach((zone) => {
      const { definition } = zone;
      const inside = isInsideRotatedRect(
        playerX,
        playerY,
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        definition.rotation,
      );
      const wasInside = this.insideIndices.has(definition.index);

      if (inside && !wasInside) {
        this.insideIndices.add(definition.index);
        this.onEnter?.(definition.index);
      } else if (!inside && wasInside) {
        this.insideIndices.delete(definition.index);
        this.onExit?.(definition.index);
      }
    });
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.insideIndices.clear();
    }
  }

  reset(): void {
    this.insideIndices.clear();
  }

  setDebugVisible(visible: boolean): void {
    this.zones.forEach((zone) => {
      zone.debugGraphic.setVisible(visible);
      zone.label.setVisible(visible);
    });
  }

  destroy(): void {
    this.destroyZones();
  }

  private destroyZones(): void {
    this.zones.forEach((zone) => {
      zone.debugGraphic.destroy();
      zone.label.destroy();
    });
    this.zones.length = 0;
    this.insideIndices.clear();
  }
}

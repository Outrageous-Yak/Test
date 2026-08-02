import Phaser from 'phaser';
import type { CheckpointDefinition } from './raceTypes';
import type { RacerId } from './raceTypes';

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
 * Shared checkpoint zones with per-racer inside tracking.
 */
export class CheckpointSystem {
  private readonly scene: Phaser.Scene;
  private readonly zones: CheckpointZone[] = [];
  private readonly insideByRacer = new Map<RacerId, Set<number>>();
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

  onEnter?: (racerId: RacerId, index: number) => void;
  onExit?: (racerId: RacerId, index: number) => void;

  updateRacer(racerId: RacerId, x: number, y: number): void {
    if (!this.enabled) return;

    let insideSet = this.insideByRacer.get(racerId);
    if (!insideSet) {
      insideSet = new Set();
      this.insideByRacer.set(racerId, insideSet);
    }

    this.zones.forEach((zone) => {
      const { definition } = zone;
      const inside = isInsideRotatedRect(
        x,
        y,
        definition.x,
        definition.y,
        definition.width,
        definition.height,
        definition.rotation,
      );
      const wasInside = insideSet!.has(definition.index);

      if (inside && !wasInside) {
        insideSet!.add(definition.index);
        this.onEnter?.(racerId, definition.index);
      } else if (!inside && wasInside) {
        insideSet!.delete(definition.index);
        this.onExit?.(racerId, definition.index);
      }
    });
  }

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (!value) {
      this.insideByRacer.clear();
    }
  }

  reset(): void {
    this.insideByRacer.clear();
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
    this.insideByRacer.clear();
  }
}

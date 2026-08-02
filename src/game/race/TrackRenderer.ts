import Phaser from 'phaser';
import { RACE_WORLD, RACE_COLORS, BARRIER } from './raceConstants';
import { getMangoMeadowsCheckpoints } from './mangoMeadowsCheckpoints';
import type { CheckpointDefinition } from './raceTypes';

export interface TrackBuildResult {
  worldWidth: number;
  worldHeight: number;
  startX: number;
  startY: number;
  startAngle: number;
  barriers: Phaser.Physics.Arcade.StaticGroup;
  checkpoints: readonly CheckpointDefinition[];
}

/**
 * Procedural Mango Meadows track — grass, road ring, start line, barrier colliders.
 * Artwork can replace graphics layers in a future phase.
 */
export class TrackRenderer {
  private readonly scene: Phaser.Scene;
  private graphics?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  buildMangoMeadows(): TrackBuildResult {
    const {
      WIDTH,
      HEIGHT,
      CENTER_X,
      CENTER_Y,
      ROAD_OUTER_A,
      ROAD_OUTER_B,
      ROAD_INNER_A,
      ROAD_INNER_B,
    } = RACE_WORLD;

    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(0);

    this.graphics.fillStyle(RACE_COLORS.GRASS, 1);
    this.graphics.fillRect(0, 0, WIDTH, HEIGHT);

    this.graphics.fillStyle(RACE_COLORS.ROAD, 1);
    this.graphics.fillEllipse(CENTER_X, CENTER_Y, ROAD_OUTER_A * 2, ROAD_OUTER_B * 2);

    this.graphics.fillStyle(RACE_COLORS.GRASS, 1);
    this.graphics.fillEllipse(CENTER_X, CENTER_Y, ROAD_INNER_A * 2, ROAD_INNER_B * 2);

    const startAngle = Math.PI / 2;
    const midA = (ROAD_OUTER_A + ROAD_INNER_A) / 2;
    const midB = (ROAD_OUTER_B + ROAD_INNER_B) / 2;
    const startX = CENTER_X + Math.cos(startAngle) * midA;
    const startY = CENTER_Y + Math.sin(startAngle) * midB;
    const tangent = startAngle + Math.PI / 2;

    this.drawStartLine(startX, startY, tangent, ROAD_OUTER_A - ROAD_INNER_A);

    const barriers = this.scene.physics.add.staticGroup();
    this.addBarrierRing(barriers, ROAD_OUTER_A, ROAD_OUTER_B, true);
    this.addBarrierRing(barriers, ROAD_INNER_A, ROAD_INNER_B, false);

    return {
      worldWidth: WIDTH,
      worldHeight: HEIGHT,
      startX,
      startY,
      startAngle: tangent,
      barriers,
      checkpoints: getMangoMeadowsCheckpoints(),
    };
  }

  destroy(): void {
    this.graphics?.destroy();
  }

  private drawStartLine(x: number, y: number, angle: number, roadWidth: number): void {
    if (!this.graphics) return;

    const perpX = Math.cos(angle);
    const perpY = Math.sin(angle);
    const half = roadWidth / 2;

    this.graphics.fillStyle(RACE_COLORS.START_LINE, 1);
    for (let i = -2; i <= 2; i += 1) {
      const offset = i * 14;
      const cx = x + perpX * offset;
      const cy = y + perpY * offset;
      const nx = -Math.sin(angle);
      const ny = Math.cos(angle);
      this.graphics.fillRect(
        cx + nx * half - 4,
        cy + ny * half - 4,
        8,
        8,
      );
    }
  }

  private addBarrierRing(
    group: Phaser.Physics.Arcade.StaticGroup,
    radiusA: number,
    radiusB: number,
    outward: boolean,
  ): void {
    const { CENTER_X, CENTER_Y } = RACE_WORLD;
    const segments = BARRIER.SEGMENTS;
    const thickness = BARRIER.THICKNESS;

    for (let i = 0; i < segments; i += 1) {
      const t0 = (i / segments) * Math.PI * 2;
      const t1 = ((i + 1) / segments) * Math.PI * 2;
      const tMid = (t0 + t1) / 2;

      const mx = CENTER_X + Math.cos(tMid) * radiusA;
      const my = CENTER_Y + Math.sin(tMid) * radiusB;

      const nx = Math.cos(tMid) * radiusA;
      const ny = Math.sin(tMid) * radiusB;
      const len = Math.hypot(nx, ny) || 1;
      const normalX = (nx / len) * (outward ? 1 : -1);
      const normalY = (ny / len) * (outward ? 1 : -1);

      const tangentX = -Math.sin(tMid);
      const tangentY = Math.cos(tMid);
      const segLen =
        Math.hypot(
          Math.cos(t1) * radiusA - Math.cos(t0) * radiusA,
          Math.sin(t1) * radiusB - Math.sin(t0) * radiusB,
        ) + thickness;

      const barrier = this.scene.add.rectangle(
        mx + normalX * (thickness / 2),
        my + normalY * (thickness / 2),
        segLen,
        thickness,
        RACE_COLORS.BARRIER,
        0.9,
      );
      barrier.setRotation(Math.atan2(tangentY * radiusB, tangentX * radiusA));
      this.scene.physics.add.existing(barrier, true);
      group.add(barrier);
    }
  }
}

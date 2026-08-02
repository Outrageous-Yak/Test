import Phaser from 'phaser';
import {
  MANGO_MEADOWS_BARRIER,
  MANGO_MEADOWS_COLORS,
  MANGO_MEADOWS_WORLD,
  getMangoMeadowsCheckpoints,
} from './mangoMeadowsCheckpoints';
import type { TrackBuildResult } from '../trackTypes';

/**
 * Procedural Mango Meadows track — grass, road ring, start line, barrier colliders.
 */
export function buildMangoMeadowsTrack(scene: Phaser.Scene): TrackBuildResult {
  const {
    WIDTH,
    HEIGHT,
    CENTER_X,
    CENTER_Y,
    ROAD_OUTER_A,
    ROAD_OUTER_B,
    ROAD_INNER_A,
    ROAD_INNER_B,
  } = MANGO_MEADOWS_WORLD;

  const graphics = scene.add.graphics();
  graphics.setDepth(0);

  graphics.fillStyle(MANGO_MEADOWS_COLORS.GRASS, 1);
  graphics.fillRect(0, 0, WIDTH, HEIGHT);

  graphics.fillStyle(MANGO_MEADOWS_COLORS.ROAD, 1);
  graphics.fillEllipse(CENTER_X, CENTER_Y, ROAD_OUTER_A * 2, ROAD_OUTER_B * 2);

  graphics.fillStyle(MANGO_MEADOWS_COLORS.GRASS, 1);
  graphics.fillEllipse(CENTER_X, CENTER_Y, ROAD_INNER_A * 2, ROAD_INNER_B * 2);

  const startAngle = Math.PI / 2;
  const midA = (ROAD_OUTER_A + ROAD_INNER_A) / 2;
  const midB = (ROAD_OUTER_B + ROAD_INNER_B) / 2;
  const startX = CENTER_X + Math.cos(startAngle) * midA;
  const startY = CENTER_Y + Math.sin(startAngle) * midB;
  const tangent = startAngle + Math.PI / 2;

  drawStartLine(graphics, startX, startY, tangent, ROAD_OUTER_A - ROAD_INNER_A);

  const barriers = scene.physics.add.staticGroup();
  addBarrierRing(scene, barriers, ROAD_OUTER_A, ROAD_OUTER_B, true);
  addBarrierRing(scene, barriers, ROAD_INNER_A, ROAD_INNER_B, false);

  return {
    worldWidth: WIDTH,
    worldHeight: HEIGHT,
    startX,
    startY,
    startAngle: tangent,
    barriers,
    checkpoints: getMangoMeadowsCheckpoints(),
    destroyGraphics: () => graphics.destroy(),
  };
}

function drawStartLine(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  angle: number,
  roadWidth: number,
): void {
  const perpX = Math.cos(angle);
  const perpY = Math.sin(angle);
  const half = roadWidth / 2;

  graphics.fillStyle(MANGO_MEADOWS_COLORS.START_LINE, 1);
  for (let i = -2; i <= 2; i += 1) {
    const offset = i * 14;
    const cx = x + perpX * offset;
    const cy = y + perpY * offset;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    graphics.fillRect(cx + nx * half - 4, cy + ny * half - 4, 8, 8);
  }
}

function addBarrierRing(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.StaticGroup,
  radiusA: number,
  radiusB: number,
  outward: boolean,
): void {
  const { CENTER_X, CENTER_Y } = MANGO_MEADOWS_WORLD;
  const segments = MANGO_MEADOWS_BARRIER.SEGMENTS;
  const thickness = MANGO_MEADOWS_BARRIER.THICKNESS;

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

    const barrier = scene.add.rectangle(
      mx + normalX * (thickness / 2),
      my + normalY * (thickness / 2),
      segLen,
      thickness,
      MANGO_MEADOWS_COLORS.BARRIER,
      0.9,
    );
    barrier.setRotation(Math.atan2(tangentY * radiusB, tangentX * radiusA));
    scene.physics.add.existing(barrier, true);
    group.add(barrier);
  }
}

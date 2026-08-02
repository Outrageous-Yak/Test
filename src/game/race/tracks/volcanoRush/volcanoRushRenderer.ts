import Phaser from 'phaser';
import type { PathPoint, TrackBuildResult } from '../trackTypes';
import {
  buildBarriersAlongPathWithWidths,
  tangentAt,
} from '../trackPathUtils';
import {
  VOLCANO_RUSH_COLORS,
  VOLCANO_RUSH_ROAD,
  VOLCANO_RUSH_WORLD,
  getVolcanoRoadHalfWidth,
} from './volcanoRushConstants';
import { getVolcanoRushCenterline, getVolcanoRushCheckpoints } from './volcanoRushCheckpoints';

/**
 * Procedural Volcano Rush — lava, rock, volcanic road, bridge, and barrier colliders.
 */
export function buildVolcanoRushTrack(scene: Phaser.Scene): TrackBuildResult {
  const { WIDTH, HEIGHT } = VOLCANO_RUSH_WORLD;
  const path = getVolcanoRushCenterline();
  const startPoint = path[0];
  const startAngle = tangentAt(path, path.length - 1);

  const graphics = scene.add.graphics();
  graphics.setDepth(0);

  drawGround(graphics, WIDTH, HEIGHT);
  drawLavaPools(graphics);
  drawCraterShapes(graphics);
  drawRoad(graphics, path);
  drawLavaBridge(graphics, path);
  drawStartLine(graphics, startPoint.x, startPoint.y, startAngle);
  drawAshAccents(graphics, path);

  const barriers = buildBarriersAlongPathWithWidths(
    scene,
    path,
    getVolcanoRoadHalfWidth,
    VOLCANO_RUSH_ROAD.BARRIER_THICKNESS,
    VOLCANO_RUSH_COLORS.BARRIER,
  );

  return {
    worldWidth: WIDTH,
    worldHeight: HEIGHT,
    startX: startPoint.x,
    startY: startPoint.y,
    startAngle,
    barriers,
    checkpoints: getVolcanoRushCheckpoints(),
    destroyGraphics: () => graphics.destroy(),
  };
}

function drawGround(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
  graphics.fillStyle(VOLCANO_RUSH_COLORS.GROUND, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(VOLCANO_RUSH_COLORS.GROUND_CRACK, 0.4);
  graphics.fillEllipse(width * 0.5, height * 0.45, width * 0.7, height * 0.55);
}

function drawLavaPools(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillStyle(VOLCANO_RUSH_COLORS.LAVA_DEEP, 0.9);
  graphics.fillEllipse(400, 1800, 500, 700);
  graphics.fillEllipse(3800, 2400, 600, 500);
  graphics.fillStyle(VOLCANO_RUSH_COLORS.LAVA, 0.75);
  graphics.fillEllipse(420, 1820, 380, 520);
  graphics.fillStyle(VOLCANO_RUSH_COLORS.LAVA_GLOW, 0.35);
  graphics.fillEllipse(400, 1750, 280, 380);
}

function drawCraterShapes(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillStyle(VOLCANO_RUSH_COLORS.ROCK, 0.85);
  graphics.fillEllipse(3600, 1600, 900, 700);
  graphics.fillStyle(VOLCANO_RUSH_COLORS.ROCK_DARK, 0.7);
  graphics.fillTriangle(3000, 900, 4100, 700, 4200, 1400);
  graphics.fillStyle(VOLCANO_RUSH_COLORS.ASH, 0.35);
  graphics.fillEllipse(3200, 1100, 400, 200);
  graphics.fillEllipse(3500, 1300, 300, 150);
}

function drawRoad(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  for (let i = 0; i < path.length; i += 1) {
    const current = path[i];
    const next = path[(i + 1) % path.length];
    const angle = Math.atan2(next.y - current.y, next.x - current.x);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const length = Math.hypot(next.x - current.x, next.y - current.y);
    const half = getVolcanoRoadHalfWidth(i);

    graphics.fillStyle(VOLCANO_RUSH_COLORS.ROAD, 1);
    graphics.fillRect(
      (current.x + next.x) / 2 - length / 2,
      (current.y + next.y) / 2 - half,
      length,
      half * 2,
    );
    graphics.lineStyle(3, VOLCANO_RUSH_COLORS.ROAD_EDGE, 0.85);
    graphics.lineBetween(
      current.x + nx * half,
      current.y + ny * half,
      next.x + nx * half,
      next.y + ny * half,
    );
    graphics.lineBetween(
      current.x - nx * half,
      current.y - ny * half,
      next.x - nx * half,
      next.y - ny * half,
    );

    if (i % 5 === 0) {
      graphics.fillStyle(VOLCANO_RUSH_COLORS.ROAD_DASH, 0.5);
      graphics.fillCircle((current.x + next.x) / 2, (current.y + next.y) / 2, 4);
    }
  }
}

function drawLavaBridge(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  for (let i = 17; i <= 20; i += 1) {
    const current = path[i % path.length];
    const next = path[(i + 1) % path.length];
    const length = Math.hypot(next.x - current.x, next.y - current.y);
    const angle = Math.atan2(next.y - current.y, next.x - current.x);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const half = getVolcanoRoadHalfWidth(i);

    graphics.lineStyle(4, VOLCANO_RUSH_COLORS.BRIDGE_RAIL, 0.9);
    graphics.lineBetween(
      current.x + nx * (half + 6),
      current.y + ny * (half + 6),
      next.x + nx * (half + 6),
      next.y + ny * (half + 6),
    );
    graphics.lineBetween(
      current.x - nx * (half + 6),
      current.y - ny * (half + 6),
      next.x - nx * (half + 6),
      next.y - ny * (half + 6),
    );

    graphics.fillStyle(VOLCANO_RUSH_COLORS.LAVA_GLOW, 0.25);
    graphics.fillRect(
      (current.x + next.x) / 2 - length / 2,
      (current.y + next.y) / 2 - half - 30,
      length,
      half * 2 + 60,
    );
    void angle;
  }
}

function drawStartLine(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  angle: number,
): void {
  const perpX = Math.cos(angle);
  const perpY = Math.sin(angle);
  const half = VOLCANO_RUSH_ROAD.HALF_WIDTH;

  for (let i = -2; i <= 2; i += 1) {
    const offset = i * 14;
    const cx = x + perpX * offset;
    const cy = y + perpY * offset;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    graphics.fillStyle(VOLCANO_RUSH_COLORS.START_LINE, 1);
    graphics.fillRect(cx + nx * half - 4, cy + ny * half - 4, 8, 8);
  }
}

function drawAshAccents(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  const decorIndices = [3, 9, 13, 22];
  decorIndices.forEach((index) => {
    const p = path[index % path.length];
    const angle = tangentAt(path, index);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    graphics.fillStyle(VOLCANO_RUSH_COLORS.EMBER, 0.4);
    graphics.fillCircle(p.x + nx * 100, p.y + ny * 100, 10);
    graphics.fillStyle(VOLCANO_RUSH_COLORS.ASH, 0.5);
    graphics.fillEllipse(p.x + nx * 130, p.y + ny * 130, 40, 20);
  });
}

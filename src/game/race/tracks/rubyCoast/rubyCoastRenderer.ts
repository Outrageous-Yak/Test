import Phaser from 'phaser';
import type { PathPoint, TrackBuildResult } from '../trackTypes';
import { buildBarriersAlongPath, tangentAt } from '../trackPathUtils';
import {
  RUBY_COAST_COLORS,
  RUBY_COAST_ROAD,
  RUBY_COAST_WORLD,
} from './rubyCoastConstants';
import { getRubyCoastCenterline, getRubyCoastCheckpoints } from './rubyCoastCheckpoints';

/**
 * Procedural Ruby Coast — ocean, sand, coastal road, boardwalk, and barrier colliders.
 */
export function buildRubyCoastTrack(scene: Phaser.Scene): TrackBuildResult {
  const { WIDTH, HEIGHT } = RUBY_COAST_WORLD;
  const path = getRubyCoastCenterline();
  const startIndex = path.length - 1;
  const startPoint = path[0];
  const startAngle = tangentAt(path, startIndex);

  const graphics = scene.add.graphics();
  graphics.setDepth(0);

  drawOcean(graphics, WIDTH, HEIGHT);
  drawSandZones(graphics);
  drawCliffZones(graphics);
  drawRoad(graphics, path);
  drawBoardwalk(graphics, path);
  drawStartLine(graphics, startPoint.x, startPoint.y, startAngle);
  drawCoastalDecor(graphics, path);

  const barriers = buildBarriersAlongPath(
    scene,
    path,
    RUBY_COAST_ROAD.HALF_WIDTH,
    RUBY_COAST_ROAD.BARRIER_THICKNESS,
    RUBY_COAST_COLORS.BARRIER,
  );

  return {
    worldWidth: WIDTH,
    worldHeight: HEIGHT,
    startX: startPoint.x,
    startY: startPoint.y,
    startAngle,
    barriers,
    checkpoints: getRubyCoastCheckpoints(),
    destroyGraphics: () => graphics.destroy(),
  };
}

function drawOcean(graphics: Phaser.GameObjects.Graphics, width: number, height: number): void {
  graphics.fillStyle(RUBY_COAST_COLORS.OCEAN, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(RUBY_COAST_COLORS.OCEAN_DEEP, 0.35);
  graphics.fillEllipse(width * 0.78, height * 0.35, width * 0.55, height * 0.7);
}

function drawSandZones(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillStyle(RUBY_COAST_COLORS.SAND, 1);
  graphics.fillEllipse(1200, 2300, 2200, 900);
  graphics.fillStyle(RUBY_COAST_COLORS.SAND_DARK, 0.5);
  graphics.fillEllipse(900, 2100, 1400, 500);
}

function drawCliffZones(graphics: Phaser.GameObjects.Graphics): void {
  graphics.fillStyle(RUBY_COAST_COLORS.CLIFF, 0.85);
  graphics.fillTriangle(3000, 900, 3800, 600, 3800, 2800);
  graphics.fillStyle(RUBY_COAST_COLORS.ROCK, 0.7);
  graphics.fillEllipse(3300, 1700, 500, 700);
  graphics.fillEllipse(3500, 1200, 350, 400);
}

function drawRoad(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  const half = RUBY_COAST_ROAD.HALF_WIDTH;

  for (let i = 0; i < path.length; i += 1) {
    const current = path[i];
    const next = path[(i + 1) % path.length];
    const angle = Math.atan2(next.y - current.y, next.x - current.x);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const length = Math.hypot(next.x - current.x, next.y - current.y);

    graphics.fillStyle(RUBY_COAST_COLORS.ROAD, 1);
    graphics.fillRect(
      (current.x + next.x) / 2 - length / 2,
      (current.y + next.y) / 2 - half,
      length,
      half * 2,
    );
    graphics.lineStyle(3, RUBY_COAST_COLORS.ROAD_EDGE, 0.8);
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

    if (i % 6 === 0) {
      graphics.fillStyle(RUBY_COAST_COLORS.ROAD_ACCENT, 0.35);
      graphics.fillCircle(current.x, current.y, 6);
    }
  }
}

function drawBoardwalk(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  for (let i = 10; i <= 12; i += 1) {
    const current = path[i % path.length];
    const next = path[(i + 1) % path.length];
    const angle = Math.atan2(next.y - current.y, next.x - current.x);
    const length = Math.hypot(next.x - current.x, next.y - current.y);
    graphics.fillStyle(RUBY_COAST_COLORS.BOARDWALK, 0.9);
    graphics.fillRect(
      (current.x + next.x) / 2 - length / 2,
      (current.y + next.y) / 2 - 20,
      length,
      40,
    );
    graphics.lineStyle(2, 0x5d4037, 0.6);
    graphics.strokeRect(
      (current.x + next.x) / 2 - length / 2,
      (current.y + next.y) / 2 - 20,
      length,
      40,
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
  const half = RUBY_COAST_ROAD.HALF_WIDTH;

  for (let i = -2; i <= 2; i += 1) {
    const offset = i * 14;
    const cx = x + perpX * offset;
    const cy = y + perpY * offset;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    graphics.fillStyle(RUBY_COAST_COLORS.START_LINE, 1);
    graphics.fillRect(cx + nx * half - 4, cy + ny * half - 4, 8, 8);
  }
}

function drawCoastalDecor(graphics: Phaser.GameObjects.Graphics, path: readonly PathPoint[]): void {
  const palmIndices = [2, 7, 11, 15];
  palmIndices.forEach((index) => {
    const p = path[index % path.length];
    const angle = tangentAt(path, index);
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const px = p.x + nx * 120;
    const py = p.y + ny * 120;
    graphics.fillStyle(RUBY_COAST_COLORS.PALM_TRUNK, 1);
    graphics.fillRect(px - 4, py - 20, 8, 24);
    graphics.fillStyle(RUBY_COAST_COLORS.PALM_LEAF, 0.9);
    graphics.fillCircle(px, py - 24, 14);
  });
}

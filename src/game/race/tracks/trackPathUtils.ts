import type Phaser from 'phaser';
import type { PathPoint } from './trackTypes';

/** Linearly sample a closed polyline into evenly spaced points */
export function sampleClosedPath(controlPoints: readonly PathPoint[], sampleCount: number): PathPoint[] {
  if (controlPoints.length < 2 || sampleCount < 2) return [...controlPoints];

  const segments: Array<{ from: PathPoint; to: PathPoint; length: number }> = [];
  let totalLength = 0;

  for (let i = 0; i < controlPoints.length; i += 1) {
    const from = controlPoints[i];
    const to = controlPoints[(i + 1) % controlPoints.length];
    const length = Math.hypot(to.x - from.x, to.y - from.y);
    segments.push({ from, to, length });
    totalLength += length;
  }

  const step = totalLength / sampleCount;
  const points: PathPoint[] = [];
  let segIndex = 0;
  let segOffset = 0;

  for (let i = 0; i < sampleCount; i += 1) {
    const target = i * step;
    while (segOffset + segments[segIndex].length < target && i < sampleCount - 1) {
      segOffset += segments[segIndex].length;
      segIndex = (segIndex + 1) % segments.length;
    }

    const seg = segments[segIndex];
    const t = seg.length > 0 ? (target - segOffset) / seg.length : 0;
    points.push({
      x: seg.from.x + (seg.to.x - seg.from.x) * t,
      y: seg.from.y + (seg.to.y - seg.from.y) * t,
    });
  }

  return dedupeConsecutivePoints(points);
}

export function dedupeConsecutivePoints(points: readonly PathPoint[]): PathPoint[] {
  if (points.length === 0) return [];
  const result: PathPoint[] = [points[0]];
  for (let i = 1; i < points.length; i += 1) {
    const prev = result[result.length - 1];
    const cur = points[i];
    if (Math.hypot(cur.x - prev.x, cur.y - prev.y) > 0.5) {
      result.push(cur);
    }
  }
  return result;
}

export function tangentAt(path: readonly PathPoint[], index: number): number {
  const next = path[(index + 1) % path.length];
  const current = path[index];
  return Math.atan2(next.y - current.y, next.x - current.x);
}

export function pointAhead(path: readonly PathPoint[], index: number, distance: number): PathPoint {
  const total = path.length;
  let remaining = distance;
  let i = index;

  while (remaining > 0) {
    const next = path[(i + 1) % total];
    const current = path[i];
    const segLen = Math.hypot(next.x - current.x, next.y - current.y);
    if (segLen <= remaining) {
      remaining -= segLen;
      i = (i + 1) % total;
    } else {
      const t = remaining / segLen;
      return {
        x: current.x + (next.x - current.x) * t,
        y: current.y + (next.y - current.y) * t,
      };
    }
  }

  return path[i];
}

export function allPointsWithinBounds(
  points: readonly PathPoint[],
  width: number,
  height: number,
  margin = 0,
): boolean {
  return points.every(
    (p) => p.x >= margin && p.y >= margin && p.x <= width - margin && p.y <= height - margin,
  );
}

export function buildBarriersAlongPath(
  scene: Phaser.Scene,
  path: readonly PathPoint[],
  halfWidth: number,
  thickness: number,
  color: number,
): Phaser.Physics.Arcade.StaticGroup {
  const group = scene.physics.add.staticGroup();
  const count = path.length;

  for (let i = 0; i < count; i += 1) {
    const current = path[i];
    const next = path[(i + 1) % count];
    const angle = Math.atan2(next.y - current.y, next.x - current.x);
    const segLen = Math.hypot(next.x - current.x, next.y - current.y) + thickness;
    const nx = -Math.sin(angle);
    const ny = Math.cos(angle);
    const midX = (current.x + next.x) / 2;
    const midY = (current.y + next.y) / 2;

    for (const side of [-1, 1]) {
      const bx = midX + nx * halfWidth * side;
      const by = midY + ny * halfWidth * side;
      const barrier = scene.add.rectangle(bx, by, segLen, thickness, color, 0.95);
      barrier.setRotation(angle);
      scene.physics.add.existing(barrier, true);
      group.add(barrier);
    }
  }

  return group;
}

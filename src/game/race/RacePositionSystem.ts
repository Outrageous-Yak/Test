import type { CheckpointDefinition, RacerId, RacerRaceProgress } from './raceTypes';
import type { PathPoint } from './tracks/trackTypes';

export interface PositionInput {
  racerId: RacerId;
  progress: RacerRaceProgress;
  x: number;
  y: number;
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

function checkpointFraction(
  x: number,
  y: number,
  prev: CheckpointDefinition,
  next: CheckpointDefinition,
): number {
  const segLen = distance(prev.x, prev.y, next.x, next.y) || 1;
  const toRacer = distance(prev.x, prev.y, x, y);
  return Math.max(0, Math.min(1, toRacer / segLen));
}

/**
 * Computes total race progress score for position ranking.
 */
export function computeRaceProgressScore(
  progress: RacerRaceProgress,
  x: number,
  y: number,
  checkpoints: readonly CheckpointDefinition[],
): number {
  if (progress.finished && progress.finishPosition !== null) {
    return 1000 - progress.finishPosition;
  }

  const finishIndex = checkpoints.find((cp) => cp.isFinishLine)?.index ?? checkpoints.length - 1;
  const checkpointCount = checkpoints.length;
  const prevIndex =
    progress.nextCheckpointIndex === 0
      ? finishIndex
      : progress.nextCheckpointIndex - 1;
  const nextIndex = progress.nextCheckpointIndex;

  const prev = checkpoints.find((cp) => cp.index === prevIndex);
  const next = checkpoints.find((cp) => cp.index === nextIndex);
  let fraction = 0;
  if (prev && next) {
    fraction = checkpointFraction(x, y, prev, next);
  }

  const lapScore = (progress.currentLap - 1) * checkpointCount;
  const checkpointScore = progress.completedCheckpoints;
  return lapScore + checkpointScore + fraction;
}

/**
 * Returns racer IDs sorted by race position (1st = index 0).
 */
export function calculateRacePositions(
  racers: readonly PositionInput[],
  checkpoints: readonly CheckpointDefinition[],
): Map<RacerId, number> {
  const scored = racers
    .map((racer) => ({
      racerId: racer.racerId,
      finished: racer.progress.finished,
      finishPosition: racer.progress.finishPosition,
      score: computeRaceProgressScore(racer.progress, racer.x, racer.y, checkpoints),
    }))
    .sort((a, b) => {
      const aFinished = a.finished && a.finishPosition !== null;
      const bFinished = b.finished && b.finishPosition !== null;
      if (aFinished && bFinished) return a.finishPosition! - b.finishPosition!;
      if (aFinished) return -1;
      if (bFinished) return 1;
      if (b.score !== a.score) return b.score - a.score;
      return a.racerId.localeCompare(b.racerId);
    });

  const positions = new Map<RacerId, number>();
  scored.forEach((entry, index) => {
    positions.set(entry.racerId, index + 1);
  });
  return positions;
}

export function getPlayerPosition(
  positions: ReadonlyMap<RacerId, number>,
): number {
  return positions.get('player') ?? 4;
}

/**
 * Rank unfinished racers by progress for DNF classification.
 */
export function rankUnfinishedByProgress(
  racers: readonly PositionInput[],
  checkpoints: readonly CheckpointDefinition[],
): RacerId[] {
  return racers
    .filter((r) => !r.progress.finished)
    .map((r) => ({
      racerId: r.racerId,
      score: computeRaceProgressScore(r.progress, r.x, r.y, checkpoints),
    }))
    .sort((a, b) => b.score - a.score)
    .map((r) => r.racerId);
}

export function validatePathPoints(
  points: readonly PathPoint[],
  worldWidth: number,
  worldHeight: number,
): boolean {
  if (points.length < 16) return false;
  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return false;
    if (p.x < 0 || p.y < 0 || p.x > worldWidth || p.y > worldHeight) return false;
    const next = points[(i + 1) % points.length];
    if (p.x === next.x && p.y === next.y) return false;
  }
  return true;
}

export function computeRubberBandMultiplier(
  aiProgressScore: number,
  playerProgressScore: number,
  strength: number,
  minMultiplier: number,
  maxMultiplier: number,
  behindThreshold: number,
  aheadThreshold: number,
): number {
  const gap = playerProgressScore - aiProgressScore;
  let target = 1;
  if (gap > behindThreshold) {
    target = 1 + Math.min(0.12, gap * 0.08) * strength;
  } else if (gap < -aheadThreshold) {
    target = 1 - Math.min(0.08, Math.abs(gap) * 0.06) * strength;
  }
  return Math.max(minMultiplier, Math.min(maxMultiplier, target));
}

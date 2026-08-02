import type { PathPoint } from './tracks/mangoMeadowsRaceData';
import { AI_CONFIG } from './aiConfig';
import type { RaceInput } from './TouchControls';

export interface AiFollowerState {
  pathIndex: number;
  rubberBandMultiplier: number;
  stuckMs: number;
  recoveryCooldownMs: number;
  lastCheckMs: number;
}

export function createAiFollowerState(startIndex = 0): AiFollowerState {
  return {
    pathIndex: startIndex,
    rubberBandMultiplier: 1,
    stuckMs: 0,
    recoveryCooldownMs: 0,
    lastCheckMs: 0,
  };
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= Math.PI * 2;
  while (angle < -Math.PI) angle += Math.PI * 2;
  return angle;
}

function nearestPathIndex(x: number, y: number, path: readonly PathPoint[]): number {
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < path.length; i += 1) {
    const d = (path[i].x - x) ** 2 + (path[i].y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * Pure AI steering input toward path waypoints.
 */
export function computeAiInput(
  x: number,
  y: number,
  rotation: number,
  speed: number,
  path: readonly PathPoint[],
  state: AiFollowerState,
  profile: {
    targetSpeedMultiplier: number;
    cornerCaution: number;
    steeringResponsiveness: number;
    pathLookAhead: number;
  },
  rubberBandMultiplier: number,
): { input: RaceInput; state: AiFollowerState } {
  const nextState = { ...state };
  const targetIndex = (state.pathIndex + profile.pathLookAhead) % path.length;
  const target = path[targetIndex];
  const dx = target.x - x;
  const dy = target.y - y;
  const dist = Math.hypot(dx, dy);

  if (dist < AI_CONFIG.pathReachDistance) {
    nextState.pathIndex = (state.pathIndex + 1) % path.length;
  }

  const desiredAngle = Math.atan2(dy, dx);
  const angleDiff = normalizeAngle(desiredAngle - rotation);
  const steerThreshold = 0.08 / profile.steeringResponsiveness;
  const steerLeft = angleDiff < -steerThreshold;
  const steerRight = angleDiff > steerThreshold;

  const targetSpeed = 280 * profile.targetSpeedMultiplier * rubberBandMultiplier;
  const brake = speed > targetSpeed * profile.cornerCaution || Math.abs(angleDiff) > 0.9;

  return {
    input: { steerLeft, steerRight, brake },
    state: nextState,
  };
}

export function updateAiStuckState(
  state: AiFollowerState,
  speed: number,
  x: number,
  y: number,
  path: readonly PathPoint[],
  deltaMs: number,
): AiFollowerState {
  const next = { ...state };
  next.recoveryCooldownMs = Math.max(0, next.recoveryCooldownMs - deltaMs);

  if (speed < AI_CONFIG.stuckSpeedThreshold) {
    next.stuckMs += deltaMs;
  } else {
    next.stuckMs = 0;
  }

  next.lastCheckMs += deltaMs;
  if (next.lastCheckMs < AI_CONFIG.stuckCheckIntervalMs) {
    return next;
  }
  next.lastCheckMs = 0;

  const nearest = nearestPathIndex(x, y, path);
  const pathPoint = path[nearest];
  const distFromPath = Math.hypot(pathPoint.x - x, pathPoint.y - y);

  if (
    next.recoveryCooldownMs <= 0 &&
    (next.stuckMs >= AI_CONFIG.stuckTimeThresholdMs ||
      distFromPath > AI_CONFIG.maxRecoveryDistance)
  ) {
    next.pathIndex = nearest;
    next.stuckMs = 0;
    next.recoveryCooldownMs = 2000;
    return { ...next, needsRecovery: true } as AiFollowerState & { needsRecovery?: boolean };
  }

  return next;
}

export function applyRecoveryPose(
  path: readonly PathPoint[],
  pathIndex: number,
): { x: number; y: number; rotation: number } {
  const point = path[pathIndex];
  const next = path[(pathIndex + 1) % path.length];
  const rotation = Math.atan2(next.y - point.y, next.x - point.x);
  return { x: point.x, y: point.y, rotation };
}

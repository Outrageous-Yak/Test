import type { CheckpointDefinition } from '../../raceTypes';
import type { GridPose, PathPoint } from '../trackTypes';
import { sampleClosedPath, tangentAt } from '../trackPathUtils';
import {
  RUBY_COAST_CONTROL_POINTS,
  RUBY_COAST_START_LEAVE_DISTANCE,
  RUBY_COAST_WORLD,
} from './rubyCoastConstants';

const TRIGGER_WIDTH = 120;
const TRIGGER_HEIGHT = 26;
const AI_PATH_SAMPLES = 48;

/** Checkpoint indices along the sampled path (finish at index 0) */
const CHECKPOINT_PATH_INDICES = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 0];

export function getRubyCoastCenterline(sampleCount = AI_PATH_SAMPLES): PathPoint[] {
  return sampleClosedPath(RUBY_COAST_CONTROL_POINTS, sampleCount);
}

function buildCheckpoint(index: number, pathIndex: number, path: readonly PathPoint[], isFinishLine: boolean): CheckpointDefinition {
  const point = path[pathIndex];
  const rotation = tangentAt(path, pathIndex);
  return {
    id: isFinishLine ? 'finish' : `cp-${index}`,
    index,
    x: point.x,
    y: point.y,
    width: TRIGGER_WIDTH,
    height: TRIGGER_HEIGHT,
    rotation,
    isFinishLine,
    expectedDirection: rotation,
  };
}

export function getRubyCoastCheckpoints(): readonly CheckpointDefinition[] {
  const path = getRubyCoastCenterline();
  const checkpoints: CheckpointDefinition[] = [];

  for (let i = 0; i < CHECKPOINT_PATH_INDICES.length - 1; i += 1) {
    checkpoints.push(buildCheckpoint(i, CHECKPOINT_PATH_INDICES[i], path, false));
  }

  checkpoints.push(
    buildCheckpoint(checkpoints.length, CHECKPOINT_PATH_INDICES[CHECKPOINT_PATH_INDICES.length - 1], path, true),
  );

  return checkpoints;
}

const ROW_GAP = 52;
const COL_GAP = 58;

export function buildRubyCoastStartingGrid(): GridPose[] {
  const path = getRubyCoastCenterline();
  const startIndex = CHECKPOINT_PATH_INDICES[CHECKPOINT_PATH_INDICES.length - 1];
  const { x: sx, y: sy } = path[startIndex];
  const rotation = tangentAt(path, startIndex);
  const forwardX = Math.cos(rotation);
  const forwardY = Math.sin(rotation);
  const lateralX = -Math.sin(rotation);
  const lateralY = Math.cos(rotation);

  const poseAt = (lateral: number, row: number): GridPose => ({
    x: sx + lateralX * lateral - forwardX * row * ROW_GAP,
    y: sy + lateralY * lateral - forwardY * row * ROW_GAP,
    rotation,
  });

  return [
    poseAt(-COL_GAP / 2, 0),
    poseAt(COL_GAP / 2, 0),
    poseAt(-COL_GAP / 2, ROW_GAP),
    poseAt(COL_GAP / 2, ROW_GAP),
  ];
}

export function getRubyCoastRaceDataFields(): {
  checkpoints: readonly CheckpointDefinition[];
  startLeaveDistance: number;
  gridPoses: readonly GridPose[];
  aiPath: readonly PathPoint[];
  worldWidth: number;
  worldHeight: number;
} {
  return {
    checkpoints: getRubyCoastCheckpoints(),
    startLeaveDistance: RUBY_COAST_START_LEAVE_DISTANCE,
    gridPoses: buildRubyCoastStartingGrid(),
    aiPath: getRubyCoastCenterline(),
    worldWidth: RUBY_COAST_WORLD.WIDTH,
    worldHeight: RUBY_COAST_WORLD.HEIGHT,
  };
}

export { RUBY_COAST_START_LEAVE_DISTANCE };

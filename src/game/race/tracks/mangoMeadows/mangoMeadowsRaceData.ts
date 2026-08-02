import type { GridPose, PathPoint, TrackRaceData } from '../trackTypes';
import { RACE_WORLD } from '../../raceConstants';
import {
  getMangoMeadowsCheckpoints,
  MANGO_MEADOWS_START_LEAVE_DISTANCE,
} from './mangoMeadowsCheckpoints';

const MID_A = (RACE_WORLD.ROAD_OUTER_A + RACE_WORLD.ROAD_INNER_A) / 2;
const MID_B = (RACE_WORLD.ROAD_OUTER_B + RACE_WORLD.ROAD_INNER_B) / 2;
const { CENTER_X, CENTER_Y, WIDTH, HEIGHT } = RACE_WORLD;

const ROW_GAP = 52;
const COL_GAP = 58;

function pointOnMidline(angle: number): PathPoint {
  return {
    x: CENTER_X + Math.cos(angle) * MID_A,
    y: CENTER_Y + Math.sin(angle) * MID_B,
  };
}

function tangentAt(angle: number): number {
  const dx = -MID_A * Math.sin(angle);
  const dy = MID_B * Math.cos(angle);
  return Math.atan2(dy, dx);
}

function buildAiPath(pointCount = 32): PathPoint[] {
  const startAngle = Math.PI / 2;
  const step = (Math.PI * 2) / pointCount;
  const points: PathPoint[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    points.push(pointOnMidline(startAngle + step * i));
  }
  return points;
}

function buildStartingGrid(): GridPose[] {
  const startAngle = Math.PI / 2;
  const { x: sx, y: sy } = pointOnMidline(startAngle);
  const rotation = tangentAt(startAngle);
  const forwardX = Math.cos(rotation);
  const forwardY = Math.sin(rotation);
  const lateralX = -Math.sin(rotation);
  const lateralY = Math.cos(rotation);

  const poseAt = (lateral: number, row: number): GridPose => ({
    x: sx + lateralX * lateral + forwardX * row * ROW_GAP,
    y: sy + lateralY * lateral + forwardY * row * ROW_GAP,
    rotation,
  });

  return [
    poseAt(-COL_GAP / 2, 0),
    poseAt(COL_GAP / 2, 0),
    poseAt(-COL_GAP / 2, ROW_GAP),
    poseAt(COL_GAP / 2, ROW_GAP),
  ];
}

export function getMangoMeadowsRaceData(): TrackRaceData {
  return {
    checkpoints: getMangoMeadowsCheckpoints(),
    startLeaveDistance: MANGO_MEADOWS_START_LEAVE_DISTANCE,
    gridPoses: buildStartingGrid(),
    aiPath: buildAiPath(),
    worldWidth: WIDTH,
    worldHeight: HEIGHT,
  };
}

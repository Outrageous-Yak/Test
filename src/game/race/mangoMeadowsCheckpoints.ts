import { RACE_WORLD } from './raceConstants';
import type { CheckpointDefinition } from './raceTypes';

const MID_A = (RACE_WORLD.ROAD_OUTER_A + RACE_WORLD.ROAD_INNER_A) / 2;
const MID_B = (RACE_WORLD.ROAD_OUTER_B + RACE_WORLD.ROAD_INNER_B) / 2;
const { CENTER_X, CENTER_Y } = RACE_WORLD;

const TRIGGER_WIDTH = 110;
const TRIGGER_HEIGHT = 24;

function pointOnMidline(angle: number): { x: number; y: number } {
  return {
    x: CENTER_X + Math.cos(angle) * MID_A,
    y: CENTER_Y + Math.sin(angle) * MID_B,
  };
}

/** Tangent direction (counter-clockwise travel) at a midline angle */
function tangentDirection(angle: number): number {
  const dx = -MID_A * Math.sin(angle);
  const dy = MID_B * Math.cos(angle);
  return Math.atan2(dy, dx);
}

function buildCheckpoint(
  index: number,
  angle: number,
  isFinishLine: boolean,
): CheckpointDefinition {
  const { x, y } = pointOnMidline(angle);
  const rotation = tangentDirection(angle);
  return {
    id: isFinishLine ? 'finish' : `cp-${index}`,
    index,
    x,
    y,
    width: TRIGGER_WIDTH,
    height: TRIGGER_HEIGHT,
    rotation,
    isFinishLine,
    expectedDirection: rotation,
  };
}

/**
 * Eight checkpoints around Mango Meadows — seven intermediates plus finish line at start.
 * Player begins expecting index 0 (first intermediate after the start line).
 */
export function getMangoMeadowsCheckpoints(): readonly CheckpointDefinition[] {
  const startAngle = Math.PI / 2;
  const step = (Math.PI * 2) / 8;

  const checkpoints: CheckpointDefinition[] = [];
  for (let i = 0; i < 7; i += 1) {
    const angle = startAngle + step * (i + 1);
    checkpoints.push(buildCheckpoint(i, angle, false));
  }
  checkpoints.push(buildCheckpoint(7, startAngle, true));

  return checkpoints;
}

export const MANGO_MEADOWS_START_LEAVE_DISTANCE = 120;

import type { PathPoint } from '../trackTypes';

export const VOLCANO_RUSH_WORLD = {
  WIDTH: 4200,
  HEIGHT: 3400,
} as const;

export const VOLCANO_RUSH_ROAD = {
  HALF_WIDTH: 64,
  NARROW_HALF_WIDTH: 50,
  BARRIER_THICKNESS: 16,
} as const;

/** Path segment indices for the narrow lava bridge section */
export const VOLCANO_BRIDGE_SEGMENT_INDICES = new Set([17, 18, 19, 20]);

export const VOLCANO_RUSH_START_LEAVE_DISTANCE = 120;

export const VOLCANO_RUSH_COLORS = {
  GROUND: 0x1a1a1a,
  GROUND_CRACK: 0x2b2b2b,
  LAVA: 0xff4500,
  LAVA_GLOW: 0xff6b35,
  LAVA_DEEP: 0xcc2200,
  ROCK: 0x3d3d3d,
  ROCK_DARK: 0x252525,
  ROAD: 0x3a3a3a,
  ROAD_EDGE: 0xe0e0e0,
  ROAD_DASH: 0xffaa44,
  BARRIER: 0x555555,
  BARRIER_STRIPE: 0xff4500,
  BRIDGE_RAIL: 0x8b0000,
  ASH: 0x4a4a4a,
  START_LINE: 0xffffff,
  EMBER: 0xff6600,
} as const;

/**
 * Volcanic circuit — start straight → crater curve → uphill → switchback →
 * chicane → lava bridge → downhill return.
 */
export const VOLCANO_RUSH_CONTROL_POINTS: readonly PathPoint[] = [
  { x: 1280, y: 3080 },
  { x: 1980, y: 3080 },
  { x: 2680, y: 3080 },
  { x: 3280, y: 3040 },
  { x: 3720, y: 2880 },
  { x: 3980, y: 2580 },
  { x: 4040, y: 2180 },
  { x: 3880, y: 1820 },
  { x: 3580, y: 1480 },
  { x: 3220, y: 1180 },
  { x: 2860, y: 960 },
  { x: 2560, y: 1100 },
  { x: 2280, y: 880 },
  { x: 2040, y: 1080 },
  { x: 1740, y: 940 },
  { x: 1480, y: 1100 },
  { x: 1220, y: 960 },
  { x: 960, y: 1180 },
  { x: 720, y: 1440 },
  { x: 560, y: 1720 },
  { x: 600, y: 1980 },
  { x: 800, y: 2220 },
  { x: 980, y: 2520 },
  { x: 1080, y: 2820 },
  { x: 1160, y: 3040 },
];

export const VOLCANO_RUSH_AI_TUNING = {
  baseSpeedScale: 0.9,
  cornerBrakeStrength: 1.22,
  recoveryDistance: 120,
  lookAheadScale: 1.25,
} as const;

export const VOLCANO_RUSH_CAMERA = {
  zoom: 0.8,
  lerpX: 0.1,
  lerpY: 0.1,
} as const;

export function getVolcanoRoadHalfWidth(segmentIndex: number): number {
  return VOLCANO_BRIDGE_SEGMENT_INDICES.has(segmentIndex)
    ? VOLCANO_RUSH_ROAD.NARROW_HALF_WIDTH
    : VOLCANO_RUSH_ROAD.HALF_WIDTH;
}

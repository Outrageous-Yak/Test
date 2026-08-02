import type { PathPoint } from '../trackTypes';

export const RUBY_COAST_WORLD = {
  WIDTH: 3800,
  HEIGHT: 3000,
} as const;

export const RUBY_COAST_ROAD = {
  HALF_WIDTH: 68,
  BARRIER_THICKNESS: 16,
} as const;

export const RUBY_COAST_START_LEAVE_DISTANCE = 120;

export const RUBY_COAST_COLORS = {
  OCEAN: 0x1e88e5,
  OCEAN_DEEP: 0x1565c0,
  SAND: 0xf4e4bc,
  SAND_DARK: 0xe8d4a8,
  CLIFF: 0x4a4a4a,
  ROCK: 0x3d3d3d,
  ROAD: 0x4a4a4a,
  ROAD_EDGE: 0xdcdcdc,
  ROAD_ACCENT: 0xe63946,
  BOARDWALK: 0x8d6e63,
  BARRIER: 0xffffff,
  BARRIER_STRIPE: 0xe63946,
  PALM_TRUNK: 0x5d4037,
  PALM_LEAF: 0x2e7d32,
  START_LINE: 0xffffff,
} as const;

/** Closed circuit control points — coastal straight → cliff → S-bends → boardwalk → hairpin → beach return */
export const RUBY_COAST_CONTROL_POINTS: readonly PathPoint[] = [
  { x: 1350, y: 2580 },
  { x: 2050, y: 2580 },
  { x: 2850, y: 2580 },
  { x: 3280, y: 2440 },
  { x: 3460, y: 2120 },
  { x: 3400, y: 1760 },
  { x: 3120, y: 1420 },
  { x: 2720, y: 1080 },
  { x: 2320, y: 740 },
  { x: 1920, y: 580 },
  { x: 1520, y: 700 },
  { x: 1120, y: 620 },
  { x: 760, y: 780 },
  { x: 540, y: 1040 },
  { x: 490, y: 1440 },
  { x: 620, y: 1840 },
  { x: 860, y: 2180 },
  { x: 1100, y: 2420 },
  { x: 1220, y: 2540 },
];

export const RUBY_COAST_AI_TUNING = {
  baseSpeedScale: 0.94,
  cornerBrakeStrength: 1.12,
  recoveryDistance: 140,
  lookAheadScale: 1.15,
} as const;

export const RUBY_COAST_CAMERA = {
  zoom: 0.82,
  lerpX: 0.1,
  lerpY: 0.1,
} as const;

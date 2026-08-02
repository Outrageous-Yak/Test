/** Mango Meadows world and driving tuning */
export const RACE_WORLD = {
  WIDTH: 3200,
  HEIGHT: 2400,
  CENTER_X: 1600,
  CENTER_Y: 1200,
  ROAD_OUTER_A: 700,
  ROAD_OUTER_B: 500,
  ROAD_INNER_A: 580,
  ROAD_INNER_B: 380,
} as const;

export const RACE_COLORS = {
  GRASS: 0x5cb85c,
  ROAD: 0x6e6e6e,
  ROAD_LINE: 0xffffff,
  BARRIER: 0x8b4513,
  START_LINE: 0xffffff,
  CAR_DEFAULT: 0xff6b35,
} as const;

export const DRIVING = {
  MAX_SPEED: 340,
  /** Reverse cap ≈ 42% of forward maximum (feels controllable, not instant). */
  MAX_REVERSE_SPEED: 143,
  REVERSE_SPEED_RATIO: 0.42,
  ACCELERATION: 320,
  BRAKE_FORCE: 480,
  FRICTION: 140,
  TURN_RATE: 3.2,
  MIN_TURN_SPEED: 0.15,
  CAR_WIDTH: 44,
  CAR_HEIGHT: 24,
} as const;

export const CAMERA = {
  ZOOM: 0.88,
  FOLLOW_LERP: 0.1,
} as const;

export const BARRIER = {
  SEGMENTS: 56,
  THICKNESS: 16,
} as const;

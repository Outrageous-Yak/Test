/** Normalized analog race driving input (player touch, keyboard, or AI adapter). */
export interface RaceInput {
  /** -1 full left to +1 full right */
  steer: number;
  /** 0 to 1 forward acceleration demand */
  throttle: number;
  /** 0 to 1 forward braking demand */
  brake: number;
  /** 0 to 1 reverse acceleration demand */
  reverse: number;
}

export const ZERO_RACE_INPUT: RaceInput = {
  steer: 0,
  throttle: 0,
  brake: 0,
  reverse: 0,
};

/** Raw pad/keyboard intent before brake-vs-reverse resolution (uses car speed). */
export interface DriveIntent {
  steer: number;
  throttle: number;
  upwardDemand: number;
}

export const ZERO_DRIVE_INTENT: DriveIntent = {
  steer: 0,
  throttle: 0,
  upwardDemand: 0,
};

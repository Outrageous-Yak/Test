import type { RaceInput } from './raceInput';
import { ZERO_RACE_INPUT } from './raceInput';

/** Convert legacy AI steering/brake flags into normalized RaceInput. */
export function aiFlagsToRaceInput(
  steerLeft: boolean,
  steerRight: boolean,
  braking: boolean,
): RaceInput {
  let steer = 0;
  if (steerLeft) steer = -1;
  if (steerRight) steer = 1;

  if (braking) {
    return { steer, throttle: 0, brake: 1, reverse: 0 };
  }

  return { steer, throttle: 1, brake: 0, reverse: 0 };
}

export function emptyRaceInput(): RaceInput {
  return { ...ZERO_RACE_INPUT };
}

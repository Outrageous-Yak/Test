import type { DriveIntent } from './raceInput';

export interface KeyboardDriveFlags {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function buildKeyboardIntent(flags: KeyboardDriveFlags): DriveIntent {
  let steer = 0;
  if (flags.left) steer = -1;
  if (flags.right) steer = 1;

  return {
    steer,
    throttle: flags.forward ? 1 : 0,
    upwardDemand: flags.backward ? 1 : 0,
  };
}

export function mergeDriveIntents(a: DriveIntent, b: DriveIntent): DriveIntent {
  return {
    steer: Math.abs(b.steer) > Math.abs(a.steer) ? b.steer : a.steer,
    throttle: Math.max(a.throttle, b.throttle),
    upwardDemand: Math.max(a.upwardDemand, b.upwardDemand),
  };
}

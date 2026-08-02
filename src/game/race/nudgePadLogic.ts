/** Pure helpers for the 360-degree nudge pad (testable, no Phaser deps). */

import type { DriveIntent, RaceInput } from './raceInput';
import { ZERO_DRIVE_INTENT, ZERO_RACE_INPUT } from './raceInput';

export const NUDGE_DEAD_ZONE = 0.1;

export const BRAKE_REVERSE = {
  /** Forward speed above this applies braking only (px/s along facing). */
  FORWARD_BRAKE_THRESHOLD: 28,
  /** Forward speed below this allows reverse engagement (px/s). */
  REVERSE_ENGAGE_THRESHOLD: 15,
  /** Treat as reversing when signed speed is below this (px/s). */
  REVERSING_SPEED: -8,
} as const;

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export interface PadGeometry {
  cx: number;
  cy: number;
  radius: number;
}

export function computePadGeometry(width: number, height: number): PadGeometry {
  const top = 34;
  const bottom = Math.max(top + 10, height - 30);
  const usableH = Math.max(1, bottom - top);
  const usableW = Math.max(1, width - 20);
  const radius = Math.max(10, Math.min(usableW, usableH) * 0.42);
  return {
    cx: width / 2,
    cy: top + usableH / 2,
    radius,
  };
}

export interface NudgeVector {
  x: number;
  y: number;
}

export function vectorFromTouch(
  touchX: number,
  touchY: number,
  geometry: PadGeometry,
): NudgeVector {
  let vx = (touchX - geometry.cx) / Math.max(1, geometry.radius);
  let vy = (touchY - geometry.cy) / Math.max(1, geometry.radius);
  const magnitude = Math.hypot(vx, vy);

  if (magnitude > 1) {
    vx /= magnitude;
    vy /= magnitude;
  }

  return {
    x: clamp(vx, -1, 1),
    y: clamp(vy, -1, 1),
  };
}

export function vectorMagnitude(vector: NudgeVector): number {
  return Math.hypot(vector.x, vector.y);
}

/**
 * Radial dead zone with smooth remapping so control ramps from zero at the edge
 * of the dead zone to full strength at the pad rim.
 */
export function applyRadialDeadZone(
  vector: NudgeVector,
  deadZone: number = NUDGE_DEAD_ZONE,
): NudgeVector {
  const magnitude = vectorMagnitude(vector);
  if (magnitude <= deadZone) {
    return { x: 0, y: 0 };
  }

  const remapped = (magnitude - deadZone) / (1 - deadZone);
  const scale = remapped / magnitude;
  return {
    x: vector.x * scale,
    y: vector.y * scale,
  };
}

/**
 * Map normalized pad vector to driving axes.
 * Screen Y is positive downward: down = throttle, up = brake/reverse demand.
 */
export function controlsFromNudgeVector(vector: NudgeVector): DriveIntent {
  const dead = applyRadialDeadZone(vector);
  return {
    steer: clamp(dead.x, -1, 1),
    throttle: clamp(dead.y, 0, 1),
    upwardDemand: clamp(-dead.y, 0, 1),
  };
}

export interface ReverseLatchState {
  allowReverse: boolean;
}

export function createReverseLatchState(): ReverseLatchState {
  return { allowReverse: false };
}

export interface BrakeReverseResult {
  brake: number;
  reverse: number;
  latch: ReverseLatchState;
}

/**
 * Split upward pad demand into brake vs reverse using forward speed hysteresis.
 */
export function resolveBrakeAndReverse(
  upwardDemand: number,
  signedSpeed: number,
  latch: ReverseLatchState,
): BrakeReverseResult {
  if (upwardDemand <= 0) {
    return {
      brake: 0,
      reverse: 0,
      latch: { allowReverse: signedSpeed <= BRAKE_REVERSE.REVERSE_ENGAGE_THRESHOLD },
    };
  }

  const nextLatch = { ...latch };

  if (signedSpeed > BRAKE_REVERSE.FORWARD_BRAKE_THRESHOLD) {
    nextLatch.allowReverse = false;
    return { brake: upwardDemand, reverse: 0, latch: nextLatch };
  }

  if (signedSpeed < BRAKE_REVERSE.REVERSING_SPEED) {
    nextLatch.allowReverse = true;
    return { brake: 0, reverse: upwardDemand, latch: nextLatch };
  }

  if (signedSpeed <= BRAKE_REVERSE.REVERSE_ENGAGE_THRESHOLD) {
    nextLatch.allowReverse = true;
  }

  if (nextLatch.allowReverse) {
    return { brake: 0, reverse: upwardDemand, latch: nextLatch };
  }

  return { brake: upwardDemand, reverse: 0, latch: nextLatch };
}

export function buildRaceInputFromIntent(
  intent: DriveIntent,
  signedSpeed: number,
  latch: ReverseLatchState,
): { input: RaceInput; latch: ReverseLatchState } {
  const { brake, reverse, latch: nextLatch } = resolveBrakeAndReverse(
    intent.upwardDemand,
    signedSpeed,
    latch,
  );

  return {
    input: {
      steer: intent.steer,
      throttle: intent.throttle,
      brake,
      reverse,
    },
    latch: nextLatch,
  };
}


export function getNudgeActionLabel(
  intent: DriveIntent,
  signedSpeed: number,
  latch: ReverseLatchState,
): string {
  const { brake, reverse } = resolveBrakeAndReverse(intent.upwardDemand, signedSpeed, latch);

  if (reverse > 0.05) return 'REVERSE';
  if (brake > 0.05) return 'BRAKE';

  if (intent.throttle > 0.85) return 'MAX';
  if (intent.throttle > 0.65) return 'HIGH';
  if (intent.throttle > 0.45) return 'MED';
  if (intent.throttle > 0.08) return 'LOW';
  return 'COAST';
}

export function knobRadius(padRadius: number): number {
  return Math.max(12, Math.min(20, padRadius * 0.16));
}

/** Convert screen pointer position to panel-local coordinates (origin top-left). */
export function pointerToPanelCoords(
  pointerX: number,
  pointerY: number,
  centerX: number,
  centerY: number,
  panelWidth: number,
  panelHeight: number,
): { x: number; y: number } {
  return {
    x: pointerX - centerX + panelWidth / 2,
    y: pointerY - centerY + panelHeight / 2,
  };
}

export function isPointerInsidePanel(
  pointerX: number,
  pointerY: number,
  centerX: number,
  centerY: number,
  panelWidth: number,
  panelHeight: number,
): boolean {
  const { x, y } = pointerToPanelCoords(
    pointerX,
    pointerY,
    centerX,
    centerY,
    panelWidth,
    panelHeight,
  );
  return x >= 0 && x <= panelWidth && y >= 0 && y <= panelHeight;
}

export function isZeroRaceInput(input: RaceInput): boolean {
  return (
    input.steer === 0 &&
    input.throttle === 0 &&
    input.brake === 0 &&
    input.reverse === 0
  );
}

export function isZeroDriveIntent(intent: DriveIntent): boolean {
  return (
    intent.steer === 0 &&
    intent.throttle === 0 &&
    intent.upwardDemand === 0
  );
}

export { ZERO_DRIVE_INTENT, ZERO_RACE_INPUT };

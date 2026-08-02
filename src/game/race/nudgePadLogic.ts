/** Pure helpers for the 360-degree nudge pad (testable, no Phaser deps). */

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

export interface SpeedTier {
  speed: number;
  label: string;
}

export function speedForMagnitude(magnitude: number): SpeedTier {
  if (magnitude < 0.08) return { speed: 0, label: 'STOP' };
  if (magnitude < 0.25) return { speed: 1, label: 'FINE' };
  if (magnitude < 0.45) return { speed: 3, label: 'SLOW' };
  if (magnitude < 0.65) return { speed: 8, label: 'MED' };
  if (magnitude < 0.85) return { speed: 20, label: 'FAST' };
  return { speed: 50, label: 'MAX' };
}

/** Horizontal steering from pad deflection; dead-zones small nudges near centre. */
export function steerFromNudgeVector(vector: NudgeVector): number {
  if (vectorMagnitude(vector) < 0.08) return 0;
  return vector.x;
}

/** Movement delta per tick (matches reference callback distance = speed * dt * 10). */
export function movementDelta(
  vector: NudgeVector,
  speed: number,
  deltaSeconds: number,
): NudgeVector {
  const magnitude = vectorMagnitude(vector);
  if (speed <= 0 || magnitude <= 0) {
    return { x: 0, y: 0 };
  }

  const distance = speed * deltaSeconds * 10;
  return {
    x: (vector.x / magnitude) * distance,
    y: (vector.y / magnitude) * distance,
  };
}

export function knobRadius(padRadius: number): number {
  return Math.max(12, Math.min(20, padRadius * 0.16));
}

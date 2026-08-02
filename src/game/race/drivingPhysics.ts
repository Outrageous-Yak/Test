/** Shared arcade driving helpers (testable, no Phaser deps). */

export function steeringSpeedFactor(
  signedSpeed: number,
  maxSpeed: number,
  minTurnFactor: number,
): number {
  const ratio = Math.min(1, Math.abs(signedSpeed) / Math.max(1, maxSpeed));
  return minTurnFactor + (1 - minTurnFactor) * Math.sqrt(ratio);
}

export interface BarrierHitOptions {
  speed: number;
  throttle: number;
  speedRetain: number;
  scrapeMinSpeed: number;
  throttleFloor: number;
}

/**
 * Slow the car on barrier contact but keep a forward scrape speed so it never dead-stops
 * against track walls when the player is still on the throttle.
 */
export function applyBarrierHitSpeed(options: BarrierHitOptions): number {
  const { speedRetain, scrapeMinSpeed, throttleFloor, throttle } = options;
  let speed = options.speed * speedRetain;

  if (speed > 0) {
    const floor =
      throttle > 0.05 ? throttle * throttleFloor + scrapeMinSpeed * 0.45 : scrapeMinSpeed;
    speed = Math.max(speed, floor);
  } else if (speed < 0) {
    speed = Math.min(speed, -scrapeMinSpeed * 0.35);
  }

  return speed;
}

export interface WallSlideInput {
  bodyVx: number;
  bodyVy: number;
  facingAngle: number;
  targetSpeed: number;
  lateralRetain: number;
  forwardPush: number;
}

/**
 * Blend velocity toward sliding along the wall instead of pushing straight into it.
 */
export function computeWallSlideVelocity(input: WallSlideInput): {
  vx: number;
  vy: number;
} {
  const { bodyVx, bodyVy, facingAngle, targetSpeed, lateralRetain, forwardPush } = input;
  const fx = Math.cos(facingAngle);
  const fy = Math.sin(facingAngle);
  const forwardDot = bodyVx * fx + bodyVy * fy;
  const lateralX = bodyVx - forwardDot * fx;
  const lateralY = bodyVy - forwardDot * fy;
  const lateralMag = Math.hypot(lateralX, lateralY);

  const perpX = lateralMag > 0.5 ? lateralX / lateralMag : -fy;
  const perpY = lateralMag > 0.5 ? lateralY / lateralMag : fx;
  const slideSpeed = Math.max(lateralMag, Math.abs(targetSpeed) * lateralRetain);

  return {
    vx: perpX * slideSpeed + fx * targetSpeed * forwardPush,
    vy: perpY * slideSpeed + fy * targetSpeed * forwardPush,
  };
}

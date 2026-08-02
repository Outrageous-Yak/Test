/**
 * Returns true when velocity opposes the expected travel direction.
 */
export function isWrongWayTravel(
  velocityX: number,
  velocityY: number,
  expectedDirection: number,
  minSpeed: number,
): boolean {
  const speed = Math.hypot(velocityX, velocityY);
  if (speed < minSpeed) return false;

  const travelDir = Math.atan2(velocityY, velocityX);
  let diff = Math.abs(travelDir - expectedDirection);
  if (diff > Math.PI) diff = Math.PI * 2 - diff;

  return diff > Math.PI * 0.55;
}

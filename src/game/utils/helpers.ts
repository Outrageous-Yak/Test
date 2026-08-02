/**
 * Utility helpers for the game.
 * Expand as needed in future phases.
 */

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Check if the device is in portrait orientation */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/** Check if the device likely supports touch input */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

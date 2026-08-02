/**
 * Formats elapsed race time as mm:ss.mmm
 */
export function formatRaceTime(milliseconds: number): string {
  const clamped = Math.max(0, Math.floor(milliseconds));
  const minutes = Math.floor(clamped / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const millis = clamped % 1000;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const mmm = String(millis).padStart(3, '0');

  return `${mm}:${ss}.${mmm}`;
}

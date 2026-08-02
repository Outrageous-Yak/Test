import { GameState } from '../state/GameState';

/** Optional light vibration on supported devices when enabled in settings */
export function triggerSelectionVibration(): void {
  if (!GameState.settings.vibrationEnabled) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;

  try {
    navigator.vibrate(15);
  } catch {
    // Ignore unsupported or blocked vibration
  }
}

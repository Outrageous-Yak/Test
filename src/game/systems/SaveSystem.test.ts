import { describe, it, expect, beforeEach } from 'vitest';
import { mergeWithDefaults, SaveSystem, STORAGE_KEY } from './SaveSystem';
import { DEFAULT_GAME_STATE } from '../state/gameStateTypes';

describe('SaveSystem', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when storage is empty', () => {
    const state = SaveSystem.load();
    expect(state).toEqual(DEFAULT_GAME_STATE);
  });

  it('merges partial stored data with defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        coins: 42,
        settings: { musicEnabled: false },
      }),
    );

    const state = SaveSystem.load();
    expect(state.coins).toBe(42);
    expect(state.settings.musicEnabled).toBe(false);
    expect(state.settings.soundEnabled).toBe(true);
    expect(state.unlockedCharacters).toEqual(['mango', 'ruby']);
  });

  it('handles malformed JSON without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json');
    expect(() => SaveSystem.load()).not.toThrow();
    expect(SaveSystem.load()).toEqual(DEFAULT_GAME_STATE);
  });

  it('handles non-object stored data', () => {
    localStorage.setItem(STORAGE_KEY, '"hello"');
    expect(SaveSystem.load()).toEqual(DEFAULT_GAME_STATE);
  });

  it('ignores invalid settings values', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        settings: {
          musicEnabled: 'yes',
          controlStyle: 'joystick',
        },
      }),
    );

    const state = SaveSystem.load();
    expect(state.settings.musicEnabled).toBe(true);
    expect(state.settings.controlStyle).toBe('buttons');
  });

  it('persists and reloads state', () => {
    const custom = mergeWithDefaults({
      coins: 10,
      settings: { vibrationEnabled: false, controlStyle: 'tilt' },
    });

    SaveSystem.save(custom);
    const loaded = SaveSystem.load();

    expect(loaded.coins).toBe(10);
    expect(loaded.settings.vibrationEnabled).toBe(false);
    expect(loaded.settings.controlStyle).toBe('tilt');
  });

  it('reset removes stored data', () => {
    SaveSystem.save(mergeWithDefaults({ coins: 99 }));
    SaveSystem.reset();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(SaveSystem.load().coins).toBe(0);
  });
});

describe('mergeWithDefaults', () => {
  it('preserves default unlock lists when omitted', () => {
    const state = mergeWithDefaults({});
    expect(state.unlockedCharacters).toEqual(['mango', 'ruby']);
    expect(state.unlockedCars).toEqual(['mango-car', 'red-car']);
    expect(state.unlockedTracks).toEqual(['mango-meadows']);
  });

  it('rejects negative coin values', () => {
    const state = mergeWithDefaults({ coins: -5 });
    expect(state.coins).toBe(0);
  });

  it('accepts valid selectedCharacter values', () => {
    expect(mergeWithDefaults({ selectedCharacter: 'mango' }).selectedCharacter).toBe('mango');
    expect(mergeWithDefaults({ selectedCharacter: 'ruby' }).selectedCharacter).toBe('ruby');
    expect(mergeWithDefaults({ selectedCharacter: null }).selectedCharacter).toBeNull();
  });

  it('rejects unknown selectedCharacter values safely', () => {
    expect(mergeWithDefaults({ selectedCharacter: 'peach' }).selectedCharacter).toBeNull();
    expect(mergeWithDefaults({ selectedCharacter: 123 }).selectedCharacter).toBeNull();
  });

  it('filters invalid entries from unlockedCharacters', () => {
    const state = mergeWithDefaults({ unlockedCharacters: ['mango', 'peach', 'ruby'] });
    expect(state.unlockedCharacters).toEqual(['mango', 'ruby']);
  });

  it('falls back to defaults when unlockedCharacters is entirely invalid', () => {
    const state = mergeWithDefaults({ unlockedCharacters: ['peach', 'banana'] });
    expect(state.unlockedCharacters).toEqual(['mango', 'ruby']);
  });
});

describe('character selection persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists selectedCharacter across reload', () => {
    const state = mergeWithDefaults({ selectedCharacter: 'ruby' });
    SaveSystem.save(state);
    expect(SaveSystem.load().selectedCharacter).toBe('ruby');
  });

  it('does not crash on unknown stored character selection', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ selectedCharacter: 'unknown-racer' }),
    );
    expect(() => SaveSystem.load()).not.toThrow();
    expect(SaveSystem.load().selectedCharacter).toBeNull();
  });
});

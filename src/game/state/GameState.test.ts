import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../state/GameState';
import { SaveSystem } from '../systems/SaveSystem';
import { mergeWithDefaults } from '../systems/SaveSystem';

describe('GameState car selection', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('selects Mango Car and persists', () => {
    expect(GameState.setSelectedCar('mango-car')).toBe(true);
    expect(GameState.getState().selectedCar).toBe('mango-car');
  });

  it('selects Red Car and replaces Mango Car', () => {
    GameState.setSelectedCar('mango-car');
    GameState.setSelectedCar('red-car');
    expect(GameState.getState().selectedCar).toBe('red-car');
  });

  it('rejects locked cars', () => {
    SaveSystem.save(mergeWithDefaults({ unlockedCars: ['mango-car'] }));
    GameState.reloadFromStorage();
    expect(GameState.setSelectedCar('red-car')).toBe(false);
    expect(GameState.getState().selectedCar).toBeNull();
  });

  it('allows clearing selection with null', () => {
    GameState.setSelectedCar('mango-car');
    expect(GameState.setSelectedCar(null)).toBe(true);
    expect(GameState.getState().selectedCar).toBeNull();
  });
});

describe('GameState track selection', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('selects Mango Meadows by default unlock state', () => {
    expect(GameState.setSelectedTrack('mango-meadows')).toBe(true);
    expect(GameState.getState().selectedTrack).toBe('mango-meadows');
  });

  it('rejects locked Ruby Coast', () => {
    expect(GameState.setSelectedTrack('ruby-coast')).toBe(false);
    expect(GameState.getState().selectedTrack).toBeNull();
  });

  it('rejects locked Volcano Rush', () => {
    expect(GameState.setSelectedTrack('volcano-rush')).toBe(false);
  });

  it('allows selection after unlock', () => {
    expect(GameState.unlockTrack('ruby-coast')).toBe(true);
    expect(GameState.setSelectedTrack('ruby-coast')).toBe(true);
    expect(GameState.getState().selectedTrack).toBe('ruby-coast');
  });

  it('replaces previous track selection', () => {
    GameState.setSelectedTrack('mango-meadows');
    GameState.unlockTrack('ruby-coast');
    GameState.setSelectedTrack('ruby-coast');
    expect(GameState.getState().selectedTrack).toBe('ruby-coast');
  });

  it('clears selection with null', () => {
    GameState.setSelectedTrack('mango-meadows');
    expect(GameState.setSelectedTrack(null)).toBe(true);
    expect(GameState.getState().selectedTrack).toBeNull();
  });
});

describe('GameState track unlocking', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('has Mango Meadows unlocked by default', () => {
    expect(GameState.isTrackUnlocked('mango-meadows')).toBe(true);
    expect(GameState.isTrackUnlocked('ruby-coast')).toBe(false);
    expect(GameState.isTrackUnlocked('volcano-rush')).toBe(false);
  });

  it('unlocks a track exactly once', () => {
    expect(GameState.unlockTrack('ruby-coast')).toBe(true);
    expect(GameState.getState().unlockedTracks).toEqual(['mango-meadows', 'ruby-coast']);
    expect(GameState.unlockTrack('ruby-coast')).toBe(true);
    expect(GameState.getState().unlockedTracks).toEqual(['mango-meadows', 'ruby-coast']);
  });

  it('rejects unknown track ids', () => {
    expect(GameState.unlockTrack('desert-drift' as 'mango-meadows')).toBe(false);
  });

  it('persists unlock after reload', () => {
    GameState.unlockTrack('ruby-coast');
    SaveSystem.save(GameState.getState() as ReturnType<typeof mergeWithDefaults>);
    GameState.reloadFromStorage();
    expect(GameState.isTrackUnlocked('ruby-coast')).toBe(true);
  });
});

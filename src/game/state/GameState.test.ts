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

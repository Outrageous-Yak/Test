import { describe, it, expect, beforeEach } from 'vitest';
import { GameState } from '../state/GameState';
import { canLaunchPhase6Race, getRaceLaunchRedirectScene } from './raceValidation';
import { SCENE_KEYS } from '../constants';

describe('raceValidation', () => {
  beforeEach(() => {
    GameState.reset();
  });

  it('allows Mango Meadows when selections are valid', () => {
    GameState.setSelectedCharacter('mango');
    GameState.setSelectedCar('mango-car');
    GameState.setSelectedTrack('mango-meadows');
    expect(canLaunchPhase6Race()).toBe(true);
    expect(getRaceLaunchRedirectScene()).toBeNull();
  });

  it('rejects unsupported tracks', () => {
    GameState.setSelectedCharacter('mango');
    GameState.setSelectedCar('mango-car');
    GameState.unlockTrack('ruby-coast');
    GameState.setSelectedTrack('ruby-coast');
    expect(canLaunchPhase6Race()).toBe(false);
    expect(getRaceLaunchRedirectScene()).toBe(SCENE_KEYS.TRACK_SELECT);
  });

  it('redirects when character missing', () => {
    GameState.setSelectedCar('mango-car');
    GameState.setSelectedTrack('mango-meadows');
    expect(getRaceLaunchRedirectScene()).toBe(SCENE_KEYS.CHARACTER_SELECT);
  });

  it('does not unlock progression during validation', () => {
    GameState.setSelectedCharacter('mango');
    GameState.setSelectedCar('mango-car');
    GameState.setSelectedTrack('mango-meadows');
    const before = GameState.getState().unlockedTracks;
    canLaunchPhase6Race();
    expect(GameState.getState().unlockedTracks).toEqual(before);
    expect(GameState.getState().coins).toBe(0);
  });
});

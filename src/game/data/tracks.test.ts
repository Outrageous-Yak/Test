import { describe, it, expect } from 'vitest';
import {
  TRACKS,
  getTrackById,
  getTrackDisplayName,
  getDifficultyLabel,
  getDifficultyMarkers,
  isValidTrackId,
  parseTrackId,
  filterUnlockedTrackIds,
  canSelectTrack,
} from './tracks';

describe('tracks data', () => {
  it('defines all three tracks with unique IDs', () => {
    expect(TRACKS).toHaveLength(3);
    const ids = TRACKS.map((t) => t.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids).toEqual(['mango-meadows', 'ruby-coast', 'volcano-rush']);
  });

  it('has required text and color fields', () => {
    TRACKS.forEach((track) => {
      expect(track.name.length).toBeGreaterThan(0);
      expect(track.subtitle.length).toBeGreaterThan(0);
      expect(track.description.length).toBeGreaterThan(0);
      expect(track.previewLabel.length).toBeGreaterThan(0);
      expect(track.lapCount).toBe(3);
      expect(track.primaryColor).toBeTypeOf('number');
      expect(track.secondaryColor).toBeTypeOf('number');
      expect(track.accentColor).toBeTypeOf('number');
    });
  });

  it('marks Mango Meadows unlocked and others locked by default', () => {
    const meadows = getTrackById('mango-meadows');
    const coast = getTrackById('ruby-coast');
    const volcano = getTrackById('volcano-rush');
    expect(meadows.unlockedByDefault).toBe(true);
    expect(coast.unlockedByDefault).toBe(false);
    expect(volcano.unlockedByDefault).toBe(false);
  });

  it('has valid difficulty values', () => {
    expect(getTrackById('mango-meadows').difficulty).toBe('easy');
    expect(getTrackById('ruby-coast').difficulty).toBe('medium');
    expect(getTrackById('volcano-rush').difficulty).toBe('hard');
  });

  it('formats difficulty labels and markers', () => {
    expect(getDifficultyLabel('easy')).toBe('EASY');
    expect(getDifficultyMarkers('medium')).toBe('●●');
    expect(getDifficultyMarkers('hard')).toBe('●●●');
  });

  it('validates and parses track ids', () => {
    expect(isValidTrackId('mango-meadows')).toBe(true);
    expect(parseTrackId('volcano-rush')).toBe('volcano-rush');
    expect(parseTrackId('desert-drift')).toBeNull();
  });

  it('filters unknown unlocked track ids', () => {
    expect(filterUnlockedTrackIds(['mango-meadows', 'fake-track'])).toEqual(['mango-meadows']);
  });

  it('checks track selection eligibility', () => {
    expect(canSelectTrack('mango-meadows', ['mango-meadows'])).toBe(true);
    expect(canSelectTrack('ruby-coast', ['mango-meadows'])).toBe(false);
  });

  it('formats display name', () => {
    expect(getTrackDisplayName('mango-meadows')).toBe('Mango Meadows');
    expect(getTrackDisplayName(null)).toBe('None');
  });
});

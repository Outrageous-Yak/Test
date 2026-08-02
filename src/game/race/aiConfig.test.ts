import { describe, it, expect } from 'vitest';
import { AI_CONFIG, AI_PROFILES } from './aiConfig';

describe('aiConfig', () => {
  it('defines exactly three AI profiles with unique IDs', () => {
    expect(AI_PROFILES).toHaveLength(3);
    const ids = AI_PROFILES.map((p) => p.id);
    expect(new Set(ids).size).toBe(3);
    expect(ids).toEqual(['ai-citrus', 'ai-pepper', 'ai-berry']);
  });

  it('has display names and safe tuning bounds', () => {
    AI_PROFILES.forEach((profile) => {
      expect(profile.displayName.length).toBeGreaterThan(0);
      expect(profile.targetSpeedMultiplier).toBeGreaterThan(0.8);
      expect(profile.targetSpeedMultiplier).toBeLessThan(1.2);
      expect(profile.rubberBandStrength).toBeGreaterThan(0);
      expect(profile.rubberBandStrength).toBeLessThan(2);
    });
  });

  it('clamps rubber-band config range', () => {
    expect(AI_CONFIG.rubberBandMinMultiplier).toBeLessThan(1);
    expect(AI_CONFIG.rubberBandMaxMultiplier).toBeGreaterThan(1);
    expect(AI_CONFIG.rubberBandMaxMultiplier).toBeLessThanOrEqual(1.12);
  });

  it('defines post-player-finish timeout', () => {
    expect(AI_CONFIG.postPlayerFinishTimeoutMs).toBeGreaterThanOrEqual(10000);
    expect(AI_CONFIG.postPlayerFinishTimeoutMs).toBeLessThanOrEqual(20000);
  });
});

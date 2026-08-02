import { describe, it, expect } from 'vitest';
import {
  calculateRacePositions,
  computeRaceProgressScore,
  computeRubberBandMultiplier,
  getPlayerPosition,
  rankUnfinishedByProgress,
} from './RacePositionSystem';
import { createRacerRaceProgress } from './checkpointLogic';
import type { CheckpointDefinition } from './raceTypes';

const CHECKPOINTS: CheckpointDefinition[] = [
  { id: '0', index: 0, x: 0, y: 0, width: 10, height: 10, rotation: 0, isFinishLine: false, expectedDirection: 0 },
  { id: '1', index: 1, x: 100, y: 0, width: 10, height: 10, rotation: 0, isFinishLine: false, expectedDirection: 0 },
  { id: 'finish', index: 2, x: 0, y: 100, width: 10, height: 10, rotation: 0, isFinishLine: true, expectedDirection: 0 },
];

describe('RacePositionSystem', () => {
  it('ranks by lap then checkpoint', () => {
    const ahead = createRacerRaceProgress(3);
    ahead.currentLap = 2;
    ahead.completedCheckpoints = 1;

    const behind = createRacerRaceProgress(3);
    behind.currentLap = 1;
    behind.completedCheckpoints = 2;

    const positions = calculateRacePositions(
      [
        { racerId: 'player', progress: behind, x: 50, y: 0 },
        { racerId: 'ai-citrus', progress: ahead, x: 10, y: 0 },
      ],
      CHECKPOINTS,
    );

    expect(positions.get('ai-citrus')).toBe(1);
    expect(positions.get('player')).toBe(2);
  });

  it('places finished racers by finish position', () => {
    const finished = createRacerRaceProgress(3);
    finished.finished = true;
    finished.finishPosition = 1;

    const racing = createRacerRaceProgress(3);
    racing.currentLap = 3;

    const positions = calculateRacePositions(
      [
        { racerId: 'player', progress: racing, x: 0, y: 0 },
        { racerId: 'ai-berry', progress: finished, x: 0, y: 0 },
      ],
      CHECKPOINTS,
    );

    expect(positions.get('ai-berry')).toBe(1);
    expect(getPlayerPosition(positions)).toBe(2);
  });

  it('returns finite progress scores', () => {
    const progress = createRacerRaceProgress(3);
    const score = computeRaceProgressScore(progress, 50, 0, CHECKPOINTS);
    expect(Number.isFinite(score)).toBe(true);
  });

  it('applies bounded rubber-banding', () => {
    const behind = computeRubberBandMultiplier(0, 2, 1, 0.92, 1.12, 0.15, 0.15);
    const ahead = computeRubberBandMultiplier(3, 0, 1, 0.92, 1.12, 0.15, 0.15);
    const neutral = computeRubberBandMultiplier(1, 1, 1, 0.92, 1.12, 0.15, 0.15);

    expect(behind).toBeGreaterThan(1);
    expect(behind).toBeLessThanOrEqual(1.12);
    expect(ahead).toBeLessThan(1);
    expect(ahead).toBeGreaterThanOrEqual(0.92);
    expect(neutral).toBeCloseTo(1, 1);
  });

  it('ranks unfinished racers for DNF classification', () => {
    const ranked = rankUnfinishedByProgress(
      [
        { racerId: 'ai-pepper', progress: { ...createRacerRaceProgress(3), currentLap: 2 }, x: 0, y: 0 },
        { racerId: 'ai-citrus', progress: { ...createRacerRaceProgress(3), currentLap: 1 }, x: 0, y: 0 },
      ],
      CHECKPOINTS,
    );
    expect(ranked[0]).toBe('ai-pepper');
  });
});

describe('finishing order helpers', () => {
  it('assigns player position between 1 and 4', () => {
    const positions = new Map([
      ['player', 2],
      ['ai-citrus', 1],
      ['ai-pepper', 3],
      ['ai-berry', 4],
    ] as const);
    const pos = getPlayerPosition(positions);
    expect(pos).toBeGreaterThanOrEqual(1);
    expect(pos).toBeLessThanOrEqual(4);
  });
});

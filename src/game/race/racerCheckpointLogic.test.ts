import { describe, it, expect } from 'vitest';
import {
  createCheckpointProgress,
  createRacerRaceProgress,
  processRacerCheckpointEntry,
  resetRacerState,
} from './checkpointLogic';
import type { CheckpointDefinition } from './raceTypes';

const DEFINITIONS: CheckpointDefinition[] = [
  {
    id: 'cp-0',
    index: 0,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    rotation: 0,
    isFinishLine: false,
    expectedDirection: 0,
  },
  {
    id: 'finish',
    index: 1,
    x: 10,
    y: 0,
    width: 100,
    height: 20,
    rotation: 0,
    isFinishLine: true,
    expectedDirection: 0,
  },
];

describe('per-racer checkpoint progress', () => {
  it('tracks independent checkpoint state per racer', () => {
    let cpA = createCheckpointProgress();
    let raceA = createRacerRaceProgress(3);
    cpA = { ...cpA, hasLeftStartZone: true };

    let cpB = createCheckpointProgress();
    let raceB = createRacerRaceProgress(3);

    const resultA = processRacerCheckpointEntry(cpA, raceA, 0, DEFINITIONS, 1000);
    cpA = resultA.checkpointProgress;
    raceA = resultA.racerProgress;

    expect(raceA.nextCheckpointIndex).toBe(1);
    expect(raceB.nextCheckpointIndex).toBe(0);
  });

  it('advances laps independently', () => {
    let cp = createCheckpointProgress();
    let race = createRacerRaceProgress(3);
    cp = { ...cp, hasLeftStartZone: true };

    let result = processRacerCheckpointEntry(cp, race, 0, DEFINITIONS, 1000);
    cp = result.checkpointProgress;
    race = result.racerProgress;

    result = processRacerCheckpointEntry(cp, race, 1, DEFINITIONS, 2000);
    expect(result.event.type).toBe('lap_completed');
    expect(result.racerProgress.currentLap).toBe(2);
  });

  it('finishes one racer without finishing another', () => {
    let cp = createCheckpointProgress();
    let race = createRacerRaceProgress(1);
    cp = { ...cp, hasLeftStartZone: true, nextCheckpointIndex: 1 };

    cp = processRacerCheckpointEntry(cp, race, 0, DEFINITIONS, 500).checkpointProgress;
    race = processRacerCheckpointEntry(cp, race, 0, DEFINITIONS, 500).racerProgress;
    race = processRacerCheckpointEntry(cp, race, 1, DEFINITIONS, 3000).racerProgress;

    expect(race.finished).toBe(true);
    expect(createRacerRaceProgress(1).finished).toBe(false);
  });

  it('resets all racer state on restart', () => {
    const reset = resetRacerState(3);
    expect(reset.racerProgress.currentLap).toBe(1);
    expect(reset.racerProgress.finished).toBe(false);
    expect(reset.checkpointProgress.nextCheckpointIndex).toBe(0);
  });
});

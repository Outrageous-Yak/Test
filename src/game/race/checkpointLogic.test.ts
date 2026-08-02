import { describe, it, expect } from 'vitest';
import {
  createCheckpointProgress,
  createRaceProgress,
  processCheckpointEntry,
  processCheckpointExit,
  resetRaceProgress,
  setRacePhase,
  updateStartZone,
  isSupportedRaceTrack,
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
    id: 'cp-1',
    index: 1,
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
    index: 2,
    x: 0,
    y: 0,
    width: 100,
    height: 20,
    rotation: 0,
    isFinishLine: true,
    expectedDirection: 0,
  },
];

describe('checkpointLogic', () => {
  it('starts expecting checkpoint 0', () => {
    const cp = createCheckpointProgress();
    expect(cp.nextCheckpointIndex).toBe(0);
    expect(cp.hasLeftStartZone).toBe(false);
  });

  it('advances on correct checkpoint', () => {
    const cp = createCheckpointProgress();
    const race = createRaceProgress(3);
    const result = processCheckpointEntry(cp, race, 0, DEFINITIONS);
    expect(result.event.type).toBe('advanced');
    expect(result.checkpointProgress.nextCheckpointIndex).toBe(1);
  });

  it('ignores out-of-order checkpoint', () => {
    const cp = createCheckpointProgress();
    const race = createRaceProgress(3);
    const result = processCheckpointEntry(cp, race, 1, DEFINITIONS);
    expect(result.event.type).toBe('ignored');
    expect(result.checkpointProgress.nextCheckpointIndex).toBe(0);
  });

  it('does not re-register while inside the same checkpoint', () => {
    let cp = createCheckpointProgress();
    const race = createRaceProgress(3);
    cp = processCheckpointEntry(cp, race, 0, DEFINITIONS).checkpointProgress;
    cp = { ...cp, insideCheckpointIndex: 0 };
    const again = processCheckpointEntry(cp, race, 0, DEFINITIONS);
    expect(again.event.type).toBe('ignored');
  });

  it('clears inside state on exit', () => {
    const cp = { ...createCheckpointProgress(), insideCheckpointIndex: 1 };
    const exited = processCheckpointExit(cp, 1);
    expect(exited.insideCheckpointIndex).toBeNull();
  });

  it('arms finish line only after intermediates', () => {
    let cp = createCheckpointProgress();
    let race = createRaceProgress(3);
    cp = { ...cp, hasLeftStartZone: true };

    let result = processCheckpointEntry(cp, race, 2, DEFINITIONS);
    expect(result.event.type).toBe('missed_checkpoint');
    cp = result.checkpointProgress;
    race = result.raceProgress;

    result = processCheckpointEntry(cp, race, 0, DEFINITIONS);
    cp = result.checkpointProgress;
    race = result.raceProgress;
    result = processCheckpointEntry(cp, race, 1, DEFINITIONS);
    cp = result.checkpointProgress;
    race = result.raceProgress;

    result = processCheckpointEntry(cp, race, 2, DEFINITIONS);
    expect(result.event.type).toBe('lap_completed');
    expect(result.raceProgress.currentLap).toBe(2);
    expect(result.checkpointProgress.nextCheckpointIndex).toBe(0);
  });

  it('ignores finish line before leaving start zone', () => {
    const cp = createCheckpointProgress();
    const race = createRaceProgress(3);
    const result = processCheckpointEntry(cp, race, 2, DEFINITIONS);
    expect(result.event.type).toBe('ignored');
  });

  it('completes race after three valid laps', () => {
    let cp = createCheckpointProgress();
    let race = createRaceProgress(3);
    cp = { ...cp, hasLeftStartZone: true };

    const completeLap = () => {
      let result = processCheckpointEntry(cp, race, 0, DEFINITIONS);
      cp = result.checkpointProgress;
      race = result.raceProgress;
      result = processCheckpointEntry(cp, race, 1, DEFINITIONS);
      cp = result.checkpointProgress;
      race = result.raceProgress;
      return processCheckpointEntry(cp, race, 2, DEFINITIONS);
    };

    let result = completeLap();
    expect(result.event.type).toBe('lap_completed');
    expect(result.raceProgress.currentLap).toBe(2);
    cp = result.checkpointProgress;
    race = result.raceProgress;

    result = completeLap();
    expect(result.event.type).toBe('lap_completed');
    expect(result.raceProgress.currentLap).toBe(3);
    cp = result.checkpointProgress;
    race = result.raceProgress;

    result = completeLap();
    expect(result.event.type).toBe('race_completed');
    expect(result.raceProgress.phase).toBe('finished');
  });

  it('updates start zone after leaving threshold', () => {
    const cp = updateStartZone(createCheckpointProgress(), 50, 120);
    expect(cp.hasLeftStartZone).toBe(false);
    const left = updateStartZone(cp, 150, 120);
    expect(left.hasLeftStartZone).toBe(true);
  });

  it('resets race and checkpoint progress', () => {
    const reset = resetRaceProgress(3);
    expect(reset.raceProgress.phase).toBe('countdown');
    expect(reset.raceProgress.currentLap).toBe(1);
    expect(reset.checkpointProgress.nextCheckpointIndex).toBe(0);
  });

  it('validates supported race track', () => {
    expect(isSupportedRaceTrack('mango-meadows')).toBe(true);
    expect(isSupportedRaceTrack('ruby-coast')).toBe(true);
    expect(isSupportedRaceTrack('volcano-rush')).toBe(false);
    expect(isSupportedRaceTrack(null)).toBe(false);
  });
});

describe('race phase transitions', () => {
  it('begins in countdown and timer does not advance before racing', () => {
    const progress = createRaceProgress(3);
    expect(progress.phase).toBe('countdown');
    expect(progress.elapsedTimeMs).toBe(0);
  });

  it('transitions to racing on GO', () => {
    const racing = setRacePhase(createRaceProgress(3), 'racing');
    expect(racing.phase).toBe('racing');
  });

  it('finish stops timer advancement state', () => {
    const finished = setRacePhase(
      { ...createRaceProgress(3), elapsedTimeMs: 5000, finalTimeMs: 5000 },
      'finished',
    );
    expect(finished.phase).toBe('finished');
    expect(finished.finalTimeMs).toBe(5000);
  });
});

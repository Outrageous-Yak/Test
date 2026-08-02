import type {
  CheckpointDefinition,
  CheckpointEvent,
  CheckpointProgress,
  RaceProgress,
  RacePhase,
} from './raceTypes';

export function createCheckpointProgress(): CheckpointProgress {
  return {
    nextCheckpointIndex: 0,
    hasLeftStartZone: false,
    insideCheckpointIndex: null,
  };
}

export function createRaceProgress(totalLaps: number): RaceProgress {
  return {
    phase: 'countdown',
    currentLap: 1,
    totalLaps,
    nextCheckpointIndex: 0,
    completedCheckpoints: 0,
    elapsedTimeMs: 0,
    finalTimeMs: null,
  };
}

export function getFinishCheckpointIndex(definitions: readonly CheckpointDefinition[]): number {
  const finish = definitions.find((cp) => cp.isFinishLine);
  return finish?.index ?? definitions.length - 1;
}

export function updateStartZone(
  progress: CheckpointProgress,
  distanceFromSpawn: number,
  leaveThreshold: number,
): CheckpointProgress {
  if (progress.hasLeftStartZone) return progress;
  if (distanceFromSpawn >= leaveThreshold) {
    return { ...progress, hasLeftStartZone: true };
  }
  return progress;
}

export function processCheckpointExit(
  progress: CheckpointProgress,
  checkpointIndex: number,
): CheckpointProgress {
  if (progress.insideCheckpointIndex !== checkpointIndex) return progress;
  return { ...progress, insideCheckpointIndex: null };
}

export function processCheckpointEntry(
  checkpointProgress: CheckpointProgress,
  raceProgress: RaceProgress,
  checkpointIndex: number,
  definitions: readonly CheckpointDefinition[],
): { checkpointProgress: CheckpointProgress; raceProgress: RaceProgress; event: CheckpointEvent } {
  if (raceProgress.phase === 'finished') {
    return { checkpointProgress, raceProgress, event: { type: 'ignored' } };
  }

  if (checkpointProgress.insideCheckpointIndex === checkpointIndex) {
    return { checkpointProgress, raceProgress, event: { type: 'ignored' } };
  }

  const definition = definitions.find((cp) => cp.index === checkpointIndex);
  if (!definition) {
    return { checkpointProgress, raceProgress, event: { type: 'ignored' } };
  }

  const entered: CheckpointProgress = {
    ...checkpointProgress,
    insideCheckpointIndex: checkpointIndex,
  };

  if (definition.isFinishLine) {
    if (!checkpointProgress.hasLeftStartZone) {
      return { checkpointProgress: entered, raceProgress, event: { type: 'ignored' } };
    }

    if (checkpointIndex !== checkpointProgress.nextCheckpointIndex) {
      return {
        checkpointProgress: entered,
        raceProgress,
        event: { type: 'missed_checkpoint' },
      };
    }

    const nextLap = raceProgress.currentLap + 1;
    const isRaceComplete = raceProgress.currentLap >= raceProgress.totalLaps;

    const updatedRace: RaceProgress = {
      ...raceProgress,
      currentLap: isRaceComplete ? raceProgress.currentLap : nextLap,
      nextCheckpointIndex: 0,
      completedCheckpoints: 0,
      phase: isRaceComplete ? 'finished' : raceProgress.phase,
      finalTimeMs: isRaceComplete ? raceProgress.elapsedTimeMs : null,
    };

    const resetCheckpoints: CheckpointProgress = {
      ...entered,
      nextCheckpointIndex: 0,
      insideCheckpointIndex: null,
      hasLeftStartZone: true,
    };

    if (isRaceComplete) {
      return {
        checkpointProgress: resetCheckpoints,
        raceProgress: updatedRace,
        event: { type: 'race_completed', finalLap: raceProgress.currentLap },
      };
    }

    return {
      checkpointProgress: resetCheckpoints,
      raceProgress: updatedRace,
      event: { type: 'lap_completed', lap: raceProgress.currentLap },
    };
  }

  if (checkpointIndex !== checkpointProgress.nextCheckpointIndex) {
    return { checkpointProgress: entered, raceProgress, event: { type: 'ignored' } };
  }

  const nextIndex = checkpointIndex + 1;
  const updatedCheckpoints: CheckpointProgress = {
    ...entered,
    nextCheckpointIndex: nextIndex,
  };

  const updatedRace: RaceProgress = {
    ...raceProgress,
    nextCheckpointIndex: nextIndex,
    completedCheckpoints: raceProgress.completedCheckpoints + 1,
  };

  return {
    checkpointProgress: updatedCheckpoints,
    raceProgress: updatedRace,
    event: { type: 'advanced', index: checkpointIndex },
  };
}

export function setRacePhase(progress: RaceProgress, phase: RacePhase): RaceProgress {
  return { ...progress, phase };
}

export function resetRaceProgress(totalLaps: number): {
  raceProgress: RaceProgress;
  checkpointProgress: CheckpointProgress;
} {
  return {
    raceProgress: createRaceProgress(totalLaps),
    checkpointProgress: createCheckpointProgress(),
  };
}

/** Whether the selected track can launch the Phase 6 race rules */
export function isSupportedRaceTrack(trackId: string | null): boolean {
  return trackId === 'mango-meadows';
}

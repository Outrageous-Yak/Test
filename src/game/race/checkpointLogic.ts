import type {
  CheckpointDefinition,
  CheckpointEvent,
  CheckpointProgress,
  RaceProgress,
  RacePhase,
  RacerRaceProgress,
  RacerCheckpointEvent,
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

export function createRacerRaceProgress(totalLaps: number): RacerRaceProgress {
  return {
    currentLap: 1,
    totalLaps,
    nextCheckpointIndex: 0,
    completedCheckpoints: 0,
    finished: false,
    finishTimeMs: null,
    finishPosition: null,
    lapProgress: 0,
    totalRaceProgress: 0,
  };
}

export function processRacerCheckpointEntry(
  checkpointProgress: CheckpointProgress,
  racerProgress: RacerRaceProgress,
  checkpointIndex: number,
  definitions: readonly CheckpointDefinition[],
  elapsedTimeMs: number,
): {
  checkpointProgress: CheckpointProgress;
  racerProgress: RacerRaceProgress;
  event: RacerCheckpointEvent;
} {
  if (racerProgress.finished) {
    return { checkpointProgress, racerProgress, event: { type: 'ignored' } };
  }

  if (checkpointProgress.insideCheckpointIndex === checkpointIndex) {
    return { checkpointProgress, racerProgress, event: { type: 'ignored' } };
  }

  const definition = definitions.find((cp) => cp.index === checkpointIndex);
  if (!definition) {
    return { checkpointProgress, racerProgress, event: { type: 'ignored' } };
  }

  const entered: CheckpointProgress = {
    ...checkpointProgress,
    insideCheckpointIndex: checkpointIndex,
  };

  if (definition.isFinishLine) {
    if (!checkpointProgress.hasLeftStartZone) {
      return { checkpointProgress: entered, racerProgress, event: { type: 'ignored' } };
    }

    if (checkpointIndex !== checkpointProgress.nextCheckpointIndex) {
      return {
        checkpointProgress: entered,
        racerProgress,
        event: { type: 'missed_checkpoint' },
      };
    }

    const nextLap = racerProgress.currentLap + 1;
    const isRaceComplete = racerProgress.currentLap >= racerProgress.totalLaps;

    const updatedRacer: RacerRaceProgress = {
      ...racerProgress,
      currentLap: isRaceComplete ? racerProgress.currentLap : nextLap,
      nextCheckpointIndex: 0,
      completedCheckpoints: 0,
      finished: isRaceComplete,
      finishTimeMs: isRaceComplete ? elapsedTimeMs : null,
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
        racerProgress: updatedRacer,
        event: { type: 'racer_finished', finalLap: racerProgress.currentLap },
      };
    }

    return {
      checkpointProgress: resetCheckpoints,
      racerProgress: updatedRacer,
      event: { type: 'lap_completed', lap: racerProgress.currentLap },
    };
  }

  if (checkpointIndex !== checkpointProgress.nextCheckpointIndex) {
    return { checkpointProgress: entered, racerProgress, event: { type: 'ignored' } };
  }

  const nextIndex = checkpointIndex + 1;
  const updatedCheckpoints: CheckpointProgress = {
    ...entered,
    nextCheckpointIndex: nextIndex,
  };

  const updatedRacer: RacerRaceProgress = {
    ...racerProgress,
    nextCheckpointIndex: nextIndex,
    completedCheckpoints: racerProgress.completedCheckpoints + 1,
  };

  return {
    checkpointProgress: updatedCheckpoints,
    racerProgress: updatedRacer,
    event: { type: 'advanced', index: checkpointIndex },
  };
}

export function resetRacerState(totalLaps: number): {
  racerProgress: RacerRaceProgress;
  checkpointProgress: CheckpointProgress;
} {
  return {
    racerProgress: createRacerRaceProgress(totalLaps),
    checkpointProgress: createCheckpointProgress(),
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

/** Whether the selected track can launch a race — delegates to TrackRegistry */
export function isSupportedRaceTrack(trackId: string | null): boolean {
  if (trackId === null) return false;
  // Re-exported from TrackRegistry at runtime to avoid circular imports in tests
  return trackId === 'mango-meadows' || trackId === 'ruby-coast';
}

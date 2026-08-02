/** High-level race phase — single source of truth for race flow control */
export type RacePhase =
  | 'countdown'
  | 'racing'
  | 'post_player_finish'
  | 'finished'
  | 'paused';

export type RacerId = 'player' | 'ai-citrus' | 'ai-pepper' | 'ai-berry';

export type RacerKind = 'player' | 'ai';

export interface RacerRaceProgress {
  currentLap: number;
  totalLaps: number;
  nextCheckpointIndex: number;
  completedCheckpoints: number;
  finished: boolean;
  finishTimeMs: number | null;
  finishPosition: number | null;
  lapProgress: number;
  totalRaceProgress: number;
}

export interface RaceProgress {
  phase: RacePhase;
  currentLap: number;
  totalLaps: number;
  nextCheckpointIndex: number;
  completedCheckpoints: number;
  elapsedTimeMs: number;
  finalTimeMs: number | null;
}

export interface CheckpointDefinition {
  id: string;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isFinishLine: boolean;
  /** Expected forward travel direction in radians (for wrong-way detection) */
  expectedDirection: number;
}

export interface CheckpointProgress {
  nextCheckpointIndex: number;
  hasLeftStartZone: boolean;
  insideCheckpointIndex: number | null;
}

export type RacerCheckpointEvent =
  | { type: 'advanced'; index: number }
  | { type: 'lap_completed'; lap: number }
  | { type: 'racer_finished'; finalLap: number }
  | { type: 'missed_checkpoint' }
  | { type: 'ignored' };

/** @deprecated Use RacerCheckpointEvent for multi-racer races */
export type CheckpointEvent =
  | { type: 'advanced'; index: number }
  | { type: 'lap_completed'; lap: number }
  | { type: 'race_completed'; finalLap: number }
  | { type: 'missed_checkpoint' }
  | { type: 'ignored' };

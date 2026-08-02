import type { RacerId } from './raceTypes';

export const AI_CONFIG = {
  racerCount: 3,
  positionUpdateIntervalMs: 150,
  stuckSpeedThreshold: 20,
  stuckTimeThresholdMs: 2500,
  stuckCheckIntervalMs: 500,
  maxRecoveryDistance: 300,
  rubberBandMinMultiplier: 0.92,
  rubberBandMaxMultiplier: 1.12,
  rubberBandBehindThreshold: 0.15,
  rubberBandAheadThreshold: 0.15,
  rubberBandSmoothing: 0.05,
  postPlayerFinishTimeoutMs: 15000,
  pathReachDistance: 42,
  waypointLookAhead: 3,
  carCollisionBounce: 0.05,
  finishCoastGraceMs: 800,
} as const;

export interface AiProfile {
  id: RacerId;
  displayName: string;
  color: number;
  targetSpeedMultiplier: number;
  cornerCaution: number;
  steeringResponsiveness: number;
  pathLookAhead: number;
  rubberBandStrength: number;
}

export const AI_PROFILES: readonly AiProfile[] = [
  {
    id: 'ai-citrus',
    displayName: 'Citrus',
    color: 0xff8c00,
    targetSpeedMultiplier: 1.0,
    cornerCaution: 0.95,
    steeringResponsiveness: 1.0,
    pathLookAhead: 3,
    rubberBandStrength: 1.0,
  },
  {
    id: 'ai-pepper',
    displayName: 'Pepper',
    color: 0x4caf50,
    targetSpeedMultiplier: 0.96,
    cornerCaution: 1.12,
    steeringResponsiveness: 0.92,
    pathLookAhead: 2,
    rubberBandStrength: 0.9,
  },
  {
    id: 'ai-berry',
    displayName: 'Berry',
    color: 0x9b59b6,
    targetSpeedMultiplier: 1.04,
    cornerCaution: 0.88,
    steeringResponsiveness: 1.08,
    pathLookAhead: 4,
    rubberBandStrength: 1.1,
  },
];

export function getAiProfile(id: RacerId): AiProfile {
  const profile = AI_PROFILES.find((p) => p.id === id);
  if (!profile) {
    throw new Error(`Unknown AI profile: ${id}`);
  }
  return profile;
}

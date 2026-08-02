import type Phaser from 'phaser';
import type { TrackId } from '../../state/gameStateTypes';
import type { CheckpointDefinition } from '../raceTypes';

export interface GridPose {
  x: number;
  y: number;
  rotation: number;
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface TrackCameraConfig {
  zoom: number;
  lerpX: number;
  lerpY: number;
}

export interface TrackAiTuning {
  baseSpeedScale: number;
  cornerBrakeStrength: number;
  recoveryDistance: number;
  lookAheadScale: number;
}

export interface TrackRaceData {
  checkpoints: readonly CheckpointDefinition[];
  startLeaveDistance: number;
  gridPoses: readonly GridPose[];
  aiPath: readonly PathPoint[];
  worldWidth: number;
  worldHeight: number;
  aiTuning?: TrackAiTuning;
}

export interface TrackBuildResult {
  worldWidth: number;
  worldHeight: number;
  startX: number;
  startY: number;
  startAngle: number;
  barriers: Phaser.Physics.Arcade.StaticGroup;
  checkpoints: readonly CheckpointDefinition[];
  destroyGraphics?: () => void;
}

export interface PlayableTrackDefinition {
  id: TrackId;
  displayName: string;
  lapCount: number;
  raceData: TrackRaceData;
  camera: TrackCameraConfig;
  build: (scene: Phaser.Scene) => TrackBuildResult;
}

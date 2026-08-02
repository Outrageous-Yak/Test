import type { PlayableTrackDefinition } from './trackTypes';

export function validatePlayableTrackDefinition(track: PlayableTrackDefinition): string[] {
  const errors: string[] = [];

  if (!track.id) errors.push('missing id');
  if (!track.displayName) errors.push('missing displayName');
  if (track.lapCount <= 0) errors.push('invalid lapCount');
  if (track.raceData.worldWidth <= 0 || track.raceData.worldHeight <= 0) {
    errors.push('invalid world dimensions');
  }
  if (track.raceData.gridPoses.length !== 4) errors.push('grid must have 4 poses');
  if (track.raceData.checkpoints.length < 4) errors.push('insufficient checkpoints');
  if (track.raceData.checkpoints.filter((cp) => cp.isFinishLine).length !== 1) {
    errors.push('must have exactly one finish checkpoint');
  }
  if (track.raceData.aiPath.length < 8) errors.push('insufficient AI path points');
  if (track.camera.zoom <= 0) errors.push('invalid camera zoom');

  const indices = track.raceData.checkpoints.map((cp) => cp.index);
  if (new Set(indices).size !== indices.length) errors.push('duplicate checkpoint indices');

  track.raceData.gridPoses.forEach((pose, i) => {
    if (!Number.isFinite(pose.x) || !Number.isFinite(pose.y) || !Number.isFinite(pose.rotation)) {
      errors.push(`invalid grid pose ${i}`);
    }
  });

  for (let i = 0; i < track.raceData.gridPoses.length; i += 1) {
    for (let j = i + 1; j < track.raceData.gridPoses.length; j += 1) {
      const a = track.raceData.gridPoses[i];
      const b = track.raceData.gridPoses[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < 30) {
        errors.push('overlapping grid spawns');
        break;
      }
    }
  }

  return errors;
}

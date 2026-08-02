import type { TrackId } from '../state/gameStateTypes';

export type TrackDifficulty = 'easy' | 'medium' | 'hard';

export interface TrackDefinition {
  id: TrackId;
  name: string;
  subtitle: string;
  description: string;
  difficulty: TrackDifficulty;
  lapCount: number;
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  unlockedByDefault: boolean;
  previewLabel: string;
  unlockHint: string;
}

export const TRACKS: TrackDefinition[] = [
  {
    id: 'mango-meadows',
    name: 'Mango Meadows',
    subtitle: 'Sunny fields and sweeping corners',
    description:
      'A bright countryside circuit with wide roads, gentle bends, and plenty of room to learn.',
    difficulty: 'easy',
    lapCount: 3,
    primaryColor: 0xffd700,
    secondaryColor: 0x4caf50,
    accentColor: 0x87ceeb,
    unlockedByDefault: true,
    previewLabel: 'MEADOWS',
    unlockHint: '',
  },
  {
    id: 'ruby-coast',
    name: 'Ruby Coast',
    subtitle: 'Ocean views and sharper turns',
    description:
      'A seaside circuit with fast straights, tighter corners, and bright coastal scenery.',
    difficulty: 'medium',
    lapCount: 3,
    primaryColor: 0xe63946,
    secondaryColor: 0x1e88e5,
    accentColor: 0xff8c69,
    unlockedByDefault: false,
    previewLabel: 'COAST',
    unlockHint: 'Finish Mango Meadows to unlock',
  },
  {
    id: 'volcano-rush',
    name: 'Volcano Rush',
    subtitle: 'Heat, hazards, and tight racing lines',
    description:
      'A dramatic volcanic circuit with narrow turns, glowing lava, and the toughest challenge.',
    difficulty: 'hard',
    lapCount: 3,
    primaryColor: 0xff6b35,
    secondaryColor: 0x2b2b2b,
    accentColor: 0x8b0000,
    unlockedByDefault: false,
    previewLabel: 'VOLCANO',
    unlockHint: 'Finish Ruby Coast to unlock',
  },
];

const trackMap = new Map<TrackId, TrackDefinition>(TRACKS.map((track) => [track.id, track]));

export function getTrackById(id: TrackId): TrackDefinition {
  const track = trackMap.get(id);
  if (!track) {
    throw new Error(`Unknown track id: ${id}`);
  }
  return track;
}

export function getTrackDisplayName(id: TrackId | null): string {
  if (!id) return 'None';
  return getTrackById(id).name;
}

export function getDifficultyLabel(difficulty: TrackDifficulty): string {
  return difficulty.toUpperCase();
}

export function getDifficultyMarkers(difficulty: TrackDifficulty): string {
  switch (difficulty) {
    case 'easy':
      return '●';
    case 'medium':
      return '●●';
    case 'hard':
      return '●●●';
  }
}

export function isValidTrackId(value: unknown): value is TrackId {
  return value === 'mango-meadows' || value === 'ruby-coast' || value === 'volcano-rush';
}

export function parseTrackId(value: unknown): TrackId | null {
  return isValidTrackId(value) ? value : null;
}

export function filterUnlockedTrackIds(values: string[]): TrackId[] {
  return values.filter(isValidTrackId);
}

export function canSelectTrack(trackId: TrackId, unlockedTracks: readonly string[]): boolean {
  return unlockedTracks.includes(trackId);
}

import type { CharacterId } from '../state/gameStateTypes';

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
  color: number;
  accentColor: number;
  portraitColor: number;
  initial: string;
  unlockedByDefault: boolean;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'mango',
    name: 'Mango',
    title: 'The Sunny Racer',
    description: 'Friendly, confident, and ready for every corner.',
    color: 0xffd700,
    accentColor: 0x4caf50,
    portraitColor: 0xff6b35,
    initial: 'M',
    unlockedByDefault: true,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    title: 'The Fearless Racer',
    description: 'Fast, focused, and never afraid of a challenge.',
    color: 0xe63946,
    accentColor: 0x8b1a2b,
    portraitColor: 0xffb4a2,
    initial: 'R',
    unlockedByDefault: true,
  },
];

const characterMap = new Map<CharacterId, CharacterDefinition>(
  CHARACTERS.map((character) => [character.id, character]),
);

export function getCharacterById(id: CharacterId): CharacterDefinition {
  const character = characterMap.get(id);
  if (!character) {
    throw new Error(`Unknown character id: ${id}`);
  }
  return character;
}

export function getCharacterDisplayName(id: CharacterId | null): string {
  if (!id) return 'None';
  return getCharacterById(id).name;
}

export function isValidCharacterId(value: unknown): value is CharacterId {
  return value === 'mango' || value === 'ruby';
}

export function parseCharacterId(value: unknown): CharacterId | null {
  return isValidCharacterId(value) ? value : null;
}

export function filterUnlockedCharacterIds(values: string[]): CharacterId[] {
  return values.filter(isValidCharacterId);
}

export function canSelectCharacter(
  characterId: CharacterId,
  unlockedCharacters: readonly string[],
): boolean {
  return unlockedCharacters.includes(characterId);
}

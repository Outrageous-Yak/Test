import { describe, it, expect } from 'vitest';
import {
  CHARACTERS,
  getCharacterById,
  getCharacterDisplayName,
  isValidCharacterId,
  parseCharacterId,
  filterUnlockedCharacterIds,
  canSelectCharacter,
} from './characters';

describe('characters data', () => {
  it('defines Mango and Ruby as unlocked by default', () => {
    expect(CHARACTERS).toHaveLength(2);
    expect(CHARACTERS.every((c) => c.unlockedByDefault)).toBe(true);
  });

  it('returns character by id', () => {
    expect(getCharacterById('mango').name).toBe('Mango');
    expect(getCharacterById('ruby').name).toBe('Ruby');
  });

  it('validates character ids', () => {
    expect(isValidCharacterId('mango')).toBe(true);
    expect(isValidCharacterId('ruby')).toBe(true);
    expect(isValidCharacterId('peach')).toBe(false);
    expect(isValidCharacterId(null)).toBe(false);
  });

  it('parses character ids safely', () => {
    expect(parseCharacterId('mango')).toBe('mango');
    expect(parseCharacterId('unknown')).toBeNull();
    expect(parseCharacterId(42)).toBeNull();
  });

  it('filters unknown ids from unlocked lists', () => {
    expect(filterUnlockedCharacterIds(['mango', 'ruby', 'peach'])).toEqual(['mango', 'ruby']);
    expect(filterUnlockedCharacterIds(['invalid'])).toEqual([]);
  });

  it('checks whether a character can be selected', () => {
    expect(canSelectCharacter('mango', ['mango', 'ruby'])).toBe(true);
    expect(canSelectCharacter('ruby', ['mango'])).toBe(false);
  });

  it('formats display name', () => {
    expect(getCharacterDisplayName('mango')).toBe('Mango');
    expect(getCharacterDisplayName(null)).toBe('None');
  });
});

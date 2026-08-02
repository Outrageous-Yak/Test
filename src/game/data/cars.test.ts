import { describe, it, expect } from 'vitest';
import {
  CARS,
  getCarById,
  getCarDisplayName,
  isValidCarId,
  parseCarId,
  filterUnlockedCarIds,
  canSelectCar,
} from './cars';

describe('cars data', () => {
  it('defines Mango Car and Red Car as unlocked by default', () => {
    expect(CARS).toHaveLength(2);
    expect(CARS.every((car) => car.unlockedByDefault)).toBe(true);
  });

  it('has unique car IDs matching CarId values', () => {
    const ids = CARS.map((car) => car.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('mango-car');
    expect(ids).toContain('red-car');
  });

  it('includes required text and color fields', () => {
    CARS.forEach((car) => {
      expect(car.name.length).toBeGreaterThan(0);
      expect(car.subtitle.length).toBeGreaterThan(0);
      expect(car.description.length).toBeGreaterThan(0);
      expect(car.primaryColor).toBeTypeOf('number');
      expect(car.secondaryColor).toBeTypeOf('number');
      expect(car.accentColor).toBeTypeOf('number');
    });
  });

  it('returns car by id', () => {
    expect(getCarById('mango-car').name).toBe('Mango Car');
    expect(getCarById('red-car').name).toBe('Red Car');
  });

  it('validates car ids', () => {
    expect(isValidCarId('mango-car')).toBe(true);
    expect(isValidCarId('red-car')).toBe(true);
    expect(isValidCarId('blue-car')).toBe(false);
  });

  it('parses car ids safely', () => {
    expect(parseCarId('mango-car')).toBe('mango-car');
    expect(parseCarId('invalid')).toBeNull();
  });

  it('filters unknown ids from unlocked lists', () => {
    expect(filterUnlockedCarIds(['mango-car', 'red-car', 'blue-car'])).toEqual([
      'mango-car',
      'red-car',
    ]);
  });

  it('checks whether a car can be selected', () => {
    expect(canSelectCar('mango-car', ['mango-car', 'red-car'])).toBe(true);
    expect(canSelectCar('red-car', ['mango-car'])).toBe(false);
  });

  it('formats display name', () => {
    expect(getCarDisplayName('mango-car')).toBe('Mango Car');
    expect(getCarDisplayName(null)).toBe('None');
  });
});

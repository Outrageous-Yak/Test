import type { CarId } from '../state/gameStateTypes';

export interface CarDefinition {
  id: CarId;
  name: string;
  subtitle: string;
  description: string;
  primaryColor: number;
  secondaryColor: number;
  accentColor: number;
  unlockedByDefault: boolean;
}

export const CARS: CarDefinition[] = [
  {
    id: 'mango-car',
    name: 'Mango Car',
    subtitle: 'Bright, balanced, and ready to roll',
    description: 'A cheerful racing car with smooth handling and a sunny style.',
    primaryColor: 0xffd700,
    secondaryColor: 0x4caf50,
    accentColor: 0xff6b35,
    unlockedByDefault: true,
  },
  {
    id: 'red-car',
    name: 'Red Car',
    subtitle: 'Bold, sharp, and built to race',
    description: 'A striking red racer with a confident look and energetic personality.',
    primaryColor: 0xe63946,
    secondaryColor: 0x8b1a2b,
    accentColor: 0xfff5e6,
    unlockedByDefault: true,
  },
];

const carMap = new Map<CarId, CarDefinition>(CARS.map((car) => [car.id, car]));

export function getCarById(id: CarId): CarDefinition {
  const car = carMap.get(id);
  if (!car) {
    throw new Error(`Unknown car id: ${id}`);
  }
  return car;
}

export function getCarDisplayName(id: CarId | null): string {
  if (!id) return 'None';
  return getCarById(id).name;
}

export function isValidCarId(value: unknown): value is CarId {
  return value === 'mango-car' || value === 'red-car';
}

export function parseCarId(value: unknown): CarId | null {
  return isValidCarId(value) ? value : null;
}

export function filterUnlockedCarIds(values: string[]): CarId[] {
  return values.filter(isValidCarId);
}

export function canSelectCar(carId: CarId, unlockedCars: readonly string[]): boolean {
  return unlockedCars.includes(carId);
}

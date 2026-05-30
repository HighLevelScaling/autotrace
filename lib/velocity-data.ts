export const BRAND_LIQUIDITY: Record<string, number> = {
  toyota: 18,
  honda: 18,
  ford: 16,
  chevrolet: 16,
  subaru: 14,
  'mercedes-benz': 10,
  bmw: 10,
  lexus: 12,
  audi: 9,
  jeep: 14,
  kia: 12,
  hyundai: 12,
  volkswagen: 10,
  maserati: -18,
  alfa: -16,
  fiat: -14,
  jaguar: -12,
  'land rover': -10,
  ferrari: -8,
  volvo: 6,
};

export const COLOR_DEMAND: Record<string, number> = {
  white: 4,
  black: 4,
  silver: 3,
  gray: 3,
  blue: 2,
  red: 1,
  green: -1,
  gold: -1,
  brown: -2,
  yellow: 0,
  orange: -2,
  purple: -3,
};

export const SEASONAL_MULTIPLIERS: Record<string, number[]> = {
  suv: [0.95, 0.95, 1.0, 1.05, 1.05, 1.0, 0.95, 0.95, 1.0, 1.05, 1.05, 1.0],
  sedan: [1.0, 1.0, 1.05, 1.05, 1.0, 0.95, 0.9, 0.9, 1.0, 1.05, 1.05, 1.0],
  truck: [0.9, 0.9, 1.0, 1.1, 1.1, 1.05, 1.0, 1.0, 1.05, 1.1, 1.05, 0.95],
  coupe: [0.8, 0.8, 0.9, 1.0, 1.1, 1.15, 1.15, 1.1, 1.0, 0.9, 0.85, 0.8],
  hatchback: [1.0, 1.0, 1.02, 1.02, 1.0, 0.98, 0.98, 0.98, 1.0, 1.02, 1.02, 1.0],
  wagon: [0.95, 0.95, 0.98, 0.98, 1.0, 1.0, 1.0, 1.0, 0.98, 0.98, 0.95, 0.95],
  van: [0.9, 0.9, 0.95, 0.95, 1.0, 1.0, 1.05, 1.05, 1.0, 0.95, 0.9, 0.9],
  convertible: [0.6, 0.6, 0.75, 0.9, 1.15, 1.2, 1.25, 1.2, 1.1, 0.9, 0.7, 0.6],
};

export const DEFAULT_SEASONAL = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0];

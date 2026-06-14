import { NextRequest, NextResponse } from 'next/server';

interface HottestCar {
  rank: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  wholesaleBook: number;
  retailPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  velocityScore: number;
  daysOnMarket: number;
  trend: 'up' | 'down' | 'flat';
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

const MAKES = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'BMW',
  'Lexus',
  'Subaru',
  'Jeep',
  'Audi',
  'Mercedes-Benz',
];

const MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'RAV4', 'Tacoma', 'Corolla'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Pilot'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe'],
  BMW: ['3 Series', 'X5', 'X3', '5 Series'],
  Lexus: ['RX 350', 'ES 350', 'NX 300', 'IS 300'],
  Subaru: ['Outback', 'Forester', 'Crosstrek', 'Impreza'],
  Jeep: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass'],
  Audi: ['Q5', 'A4', 'Q7', 'A6'],
  'Mercedes-Benz': ['C-Class', 'GLC', 'E-Class', 'GLE'],
};

function generateHottestCars(period: string, limit: number): HottestCar[] {
  const now = new Date();
  const weekNumber = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );
  const seed = hashString(`${period}-${weekNumber}`);
  const rng = new SeededRandom(seed);

  const cars: HottestCar[] = [];
  for (let i = 0; i < limit; i++) {
    const make = rng.pick(MAKES);
    const model = rng.pick(MODELS[make] || ['Sedan']);
    const year = rng.nextInt(2018, 2024);
    const wholesaleBook = rng.nextInt(12000, 45000);
    const spreadPercent = rng.nextInt(15, 45);
    const retailPrice = Math.round(wholesaleBook * (1 + spreadPercent / 100));
    const spreadAmount = retailPrice - wholesaleBook;
    const velocityScore = rng.nextInt(35, 95);

    cars.push({
      rank: i + 1,
      make,
      model,
      year,
      vin: `${make.slice(0, 3).toUpperCase()}${rng.nextInt(100000, 999999)}`,
      wholesaleBook,
      retailPrice,
      spreadAmount,
      spreadPercent,
      velocityScore,
      daysOnMarket: rng.nextInt(8, 60),
      trend: rng.pick(['up', 'down', 'flat']),
    });
  }

  return cars
    .sort((a, b) => b.spreadPercent - a.spreadPercent)
    .map((c, i) => ({ ...c, rank: i + 1 }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'weekly';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

  if (!['weekly', 'monthly'].includes(period)) {
    return NextResponse.json(
      { error: 'Invalid period. Use weekly or monthly.' },
      { status: 400 }
    );
  }

  const cars = generateHottestCars(period, limit);
  return NextResponse.json({
    success: true,
    period,
    updatedAt: new Date().toISOString(),
    cars,
  });
}

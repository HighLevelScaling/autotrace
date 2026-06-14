import { VehicleReport } from './types';
import { MarketArbitrage } from './acquisition-engine';

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
}

// 20 major US metro markets with approximate lat/lng
const MARKETS = [
  { name: 'Los Angeles, CA', lat: 34.05, lng: -118.24, basePremium: 5 },
  { name: 'San Francisco, CA', lat: 37.77, lng: -122.42, basePremium: 7 },
  { name: 'Houston, TX', lat: 29.76, lng: -95.37, basePremium: 4 },
  { name: 'Dallas, TX', lat: 32.78, lng: -96.8, basePremium: 5 },
  { name: 'Miami, FL', lat: 25.76, lng: -80.19, basePremium: 6 },
  { name: 'Atlanta, GA', lat: 33.75, lng: -84.39, basePremium: 2 },
  { name: 'Chicago, IL', lat: 41.88, lng: -87.63, basePremium: -2 },
  { name: 'New York, NY', lat: 40.71, lng: -74.01, basePremium: 3 },
  { name: 'Phoenix, AZ', lat: 33.45, lng: -112.07, basePremium: 3 },
  { name: 'Seattle, WA', lat: 47.61, lng: -122.33, basePremium: 4 },
  { name: 'Denver, CO', lat: 39.74, lng: -104.99, basePremium: 2 },
  { name: 'Detroit, MI', lat: 42.33, lng: -83.05, basePremium: -4 },
  { name: 'Boston, MA', lat: 42.36, lng: -71.06, basePremium: 1 },
  { name: 'Philadelphia, PA', lat: 39.95, lng: -75.17, basePremium: -1 },
  { name: 'Tampa, FL', lat: 27.95, lng: -82.46, basePremium: 3 },
  { name: 'Minneapolis, MN', lat: 44.98, lng: -93.27, basePremium: -3 },
  { name: 'Portland, OR', lat: 45.52, lng: -122.68, basePremium: 1 },
  { name: 'Las Vegas, NV', lat: 36.17, lng: -115.14, basePremium: 2 },
  { name: 'San Diego, CA', lat: 32.72, lng: -117.16, basePremium: 5 },
  { name: 'Austin, TX', lat: 30.27, lng: -97.74, basePremium: 6 },
];

// Default dealer location (seeded per VIN)
function getDealerLocation(seed: number) {
  const rng = new SeededRandom(seed);
  return MARKETS[rng.nextInt(0, MARKETS.length - 1)];
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getSpecPremium(market: string, report: VehicleReport): number {
  let premium = 0;
  const name = market.toLowerCase();

  // Truck premiums in TX and mountain states
  if (report.bodyType.toLowerCase() === 'truck') {
    if (name.includes('houston') || name.includes('dallas') || name.includes('austin')) premium += 5;
    if (name.includes('denver') || name.includes('phoenix')) premium += 3;
  }

  // AWD/SUV premiums in snow states
  if (report.bodyType.toLowerCase() === 'suv') {
    if (name.includes('seattle') || name.includes('denver') || name.includes('minneapolis') || name.includes('detroit') || name.includes('boston')) {
      premium += 4;
    }
  }

  // Convertible premiums in FL and CA
  if (report.bodyType.toLowerCase() === 'convertible') {
    if (name.includes('miami') || name.includes('tampa') || name.includes('los angeles') || name.includes('san diego')) {
      premium += 6;
    }
  }

  // Color premiums
  const color = report.color.toLowerCase();
  if (color === 'white' || color === 'black' || color === 'silver') {
    premium += 1; // neutral everywhere
  }
  if (color === 'red' && (name.includes('miami') || name.includes('los angeles'))) {
    premium += 2;
  }

  // EV/hybrid proxy (smaller cars in CA coastal cities)
  if (report.bodyType.toLowerCase() === 'sedan' && (name.includes('san francisco') || name.includes('seattle') || name.includes('portland'))) {
    premium += 2;
  }

  return premium;
}

export function calculateArbitrage(report: VehicleReport): {
  localMarket: MarketArbitrage;
  bestMarket: MarketArbitrage;
  allMarkets: MarketArbitrage[];
  spreadDelta: number;
} {
  const seed = hashString(report.vin);
  const dealerLocation = getDealerLocation(seed);
  const rng = new SeededRandom(seed + 1);

  const wholesale = report.wholesaleBook || report.marketValue.mid * 0.75;
  const baseRetail = report.marketValue.mid;

  const allMarkets: MarketArbitrage[] = MARKETS.map((m) => {
    const distance = haversine(dealerLocation.lat, dealerLocation.lng, m.lat, m.lng);
    const transportCost = Math.round(distance * 0.55 + 200);
    const specPremium = getSpecPremium(m.name, report);
    const totalPremium = m.basePremium + specPremium;
    const retailPrice = Math.round(baseRetail * (1 + totalPremium / 100));
    const daysToTurn = Math.max(7, Math.round(report.velocity?.daysToSellEstimate * (1 - totalPremium / 200) + rng.nextInt(-3, 3)));
    const netSpread = retailPrice - wholesale - transportCost;

    return {
      market: m.name,
      retailPremium: totalPremium,
      daysToTurn,
      transportCost,
      netSpread,
    };
  });

  // Sort by netSpread descending
  allMarkets.sort((a, b) => b.netSpread - a.netSpread);

  const bestMarket = allMarkets[0];
  const localMarket = allMarkets.find((m) => m.market === dealerLocation.name) || allMarkets[Math.floor(allMarkets.length / 2)];
  const spreadDelta = bestMarket.netSpread - localMarket.netSpread;

  return {
    localMarket,
    bestMarket,
    allMarkets,
    spreadDelta,
  };
}

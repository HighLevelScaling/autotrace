import { NextRequest, NextResponse } from 'next/server';

// Mock auction data simulating live feeds from Manheim, ADESA, Copart, IAAI
// PRODUCTION: Replace with real auction API integrations

interface AuctionVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: string;
  color: string;
  engine: string;
  transmission: string;
  auctionSource: 'manheim' | 'adesa' | 'copart' | 'iaai';
  auctionLocation: string;
  auctionDate: string;
  saleType: 'live' | 'online' | 'buy-now';
  status: 'upcoming' | 'live' | 'sold' | 'pending';
  currentBid?: number;
  buyNowPrice?: number;
  estimatedRetail: number;
  conditionScore: number;
  titleStatus: string;
  images: number;
  sellerType: string;
  runNumber: string;
  lane: string;
}

const MAKES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Nissan', 'Hyundai'];
const MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'RAV4', 'Highlander', 'Tacoma', 'Corolla'],
  Honda: ['Accord', 'CR-V', 'Civic', 'Pilot', 'Odyssey'],
  Ford: ['F-150', 'Escape', 'Explorer', 'Mustang', 'Edge'],
  Chevrolet: ['Silverado', 'Equinox', 'Malibu', 'Tahoe', 'Traverse'],
  BMW: ['X5', '3 Series', 'X3', '5 Series', 'X7'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  Audi: ['Q5', 'A4', 'Q7', 'A6', 'Q3'],
  Lexus: ['RX', 'ES', 'NX', 'GX', 'IS'],
  Nissan: ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Murano'],
  Hyundai: ['Tucson', 'Sonata', 'Santa Fe', 'Elantra', 'Palisade'],
};

const LOCATIONS: Record<string, string[]> = {
  manheim: ['Manheim Atlanta', 'Manheim Dallas', 'Manheim Los Angeles', 'Manheim Chicago', 'Manheim Phoenix'],
  adesa: ['ADESA Indianapolis', 'ADESA Jacksonville', 'ADESA San Diego', 'ADESA Denver', 'ADESA Tampa'],
  copart: ['Copart Sacramento', 'Copart Miami', 'Copart Houston', 'Copart Seattle', 'Copart Detroit'],
  iaai: ['IAAI Nashville', 'IAAI Orlando', 'IAAI Portland', 'IAAI Cleveland', 'IAAI Raleigh'],
};

function generateAuctionVehicles(count: number = 50): AuctionVehicle[] {
  const vehicles: AuctionVehicle[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const make = MAKES[Math.floor(Math.random() * MAKES.length)];
    const models = MODELS[make];
    const model = models[Math.floor(Math.random() * models.length)];
    const source = ['manheim', 'adesa', 'copart', 'iaai'][Math.floor(Math.random() * 4)] as AuctionVehicle['auctionSource'];
    const locations = LOCATIONS[source];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const year = 2019 + Math.floor(Math.random() * 6);
    const mileage = Math.floor(15000 + Math.random() * 80000);
    const conditionScore = Math.floor(50 + Math.random() * 50);
    const estimatedRetail = Math.floor(15000 + Math.random() * 45000);
    const currentBid = Math.floor(estimatedRetail * (0.4 + Math.random() * 0.3));
    const buyNowPrice = Math.floor(currentBid * 1.15);
    const auctionTime = new Date(now.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000));
    const status: AuctionVehicle['status'] = Math.random() > 0.7 ? 'live' : Math.random() > 0.5 ? 'pending' : 'upcoming';

    vehicles.push({
      id: `AUC-${source.toUpperCase()}-${10000 + i}`,
      vin: `1${['H','F','G','B','A'][Math.floor(Math.random()*5)]}GC${String.fromCharCode(65+Math.floor(Math.random()*26))}${String.fromCharCode(65+Math.floor(Math.random()*26))}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}${Math.floor(Math.random()*10)}`,
      year,
      make,
      model,
      trim: ['Base', 'SE', 'LE', 'XLE', 'Limited', 'Sport', 'Premium', 'Platinum'][Math.floor(Math.random() * 8)],
      mileage,
      condition: conditionScore >= 80 ? 'Excellent' : conditionScore >= 65 ? 'Good' : conditionScore >= 50 ? 'Fair' : 'Poor',
      color: ['White', 'Black', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Gold'][Math.floor(Math.random() * 8)],
      engine: ['2.0L I4', '2.5L I4', '3.5L V6', '2.0L Turbo', '3.0L V6', '5.0L V8', '2.5L Hybrid', '3.6L V6'][Math.floor(Math.random() * 8)],
      transmission: ['Automatic', 'CVT', 'Manual', 'Dual-Clutch'][Math.floor(Math.random() * 4)],
      auctionSource: source,
      auctionLocation: location,
      auctionDate: auctionTime.toISOString(),
      saleType: ['live', 'online', 'buy-now'][Math.floor(Math.random() * 3)] as AuctionVehicle['saleType'],
      status,
      currentBid: status === 'live' ? currentBid : undefined,
      buyNowPrice: Math.random() > 0.5 ? buyNowPrice : undefined,
      estimatedRetail,
      conditionScore,
      titleStatus: Math.random() > 0.85 ? 'Salvage' : Math.random() > 0.9 ? 'Rebuilt' : 'Clean',
      images: Math.floor(3 + Math.random() * 12),
      sellerType: ['Dealer', 'Fleet', 'Lease Return', 'Bank Repo', 'Insurance'][Math.floor(Math.random() * 5)],
      runNumber: `R${Math.floor(100 + Math.random() * 900)}`,
      lane: `L${Math.floor(1 + Math.random() * 8)}`,
    });
  }

  return vehicles.sort((a, b) => new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime());
}

let cache: { data: AuctionVehicle[]; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Generate or refresh cache
    if (!cache || Date.now() - cache.timestamp > CACHE_TTL) {
      cache = { data: generateAuctionVehicles(60), timestamp: Date.now() };
    }

    let filtered = [...cache.data];

    if (source !== 'all') {
      filtered = filtered.filter(v => v.auctionSource === source);
    }
    if (status !== 'all') {
      filtered = filtered.filter(v => v.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(v =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.year.toString().includes(q)
      );
    }

    return NextResponse.json({
      vehicles: filtered,
      total: filtered.length,
      lastUpdated: new Date(cache.timestamp).toISOString(),
      sources: ['manheim', 'adesa', 'copart', 'iaai'],
    });
  } catch (err) {
    console.error('[AuctionsAPI] Error:', err);
    return NextResponse.json({ error: 'Failed to load auction data' }, { status: 500 });
  }
}

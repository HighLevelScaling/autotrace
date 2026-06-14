import { VehicleReport, SearchType, TitleBrand, BulkReport, TitleHistoryEntry } from './types';
import { decodeVIN } from './vin-decoder';
import { calculateConditionScore } from './condition-score';
import { calculateVelocity } from './velocity-engine';
import { calculateFraud } from './fraud-engine';
import { detectPowertrain, calculateBatteryHealth } from './battery-engine';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
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

  pickWeighted<T>(items: { item: T; weight: number }[]): T {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let random = this.next() * total;
    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) return item;
    }
    return items[items.length - 1].item;
  }

  dateBetween(start: Date, end: Date): Date {
    const diff = end.getTime() - start.getTime();
    return new Date(start.getTime() + this.next() * diff);
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}

const COLORS = ['Black', 'White', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Gold', 'Brown', 'Orange'];
const BODY_TYPES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Hatchback', 'Wagon', 'Van', 'Convertible'];
const STATES = [
  'CA',
  'TX',
  'FL',
  'NY',
  'PA',
  'IL',
  'OH',
  'GA',
  'NC',
  'MI',
  'NJ',
  'VA',
  'WA',
  'AZ',
  'MA',
  'TN',
  'IN',
  'MO',
  'MD',
  'WI',
];
const FIRST_NAMES = [
  'James',
  'John',
  'Robert',
  'Michael',
  'William',
  'David',
  'Richard',
  'Joseph',
  'Thomas',
  'Charles',
  'Mary',
  'Patricia',
  'Jennifer',
  'Linda',
  'Elizabeth',
  'Barbara',
  'Susan',
  'Jessica',
  'Sarah',
  'Karen',
];
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
];

const VIOLATIONS = [
  { desc: 'Speeding - 15mph over', amount: 250, points: 2 },
  { desc: 'Running Red Light', amount: 400, points: 3 },
  { desc: 'Illegal Parking', amount: 75, points: 0 },
  { desc: 'Expired Registration', amount: 150, points: 0 },
  { desc: 'Failure to Yield', amount: 200, points: 2 },
  { desc: 'Seatbelt Violation', amount: 50, points: 0 },
  { desc: 'Using Mobile Phone', amount: 175, points: 1 },
  { desc: 'DUI / DWI', amount: 2500, points: 6 },
  { desc: 'Reckless Driving', amount: 800, points: 4 },
  { desc: 'Illegal U-Turn', amount: 125, points: 1 },
];

const CITIES = [
  'Los Angeles, CA',
  'Houston, TX',
  'Miami, FL',
  'New York, NY',
  'Chicago, IL',
  'Phoenix, AZ',
  'Philadelphia, PA',
  'San Antonio, TX',
  'San Diego, CA',
  'Dallas, TX',
  'San Jose, CA',
  'Austin, TX',
  'Jacksonville, FL',
  'Fort Worth, TX',
  'Columbus, OH',
];

const SERVICE_TYPES: Array<{ type: VehicleReport['serviceRecords'][0]['type']; desc: string }> = [
  { type: 'oil_change', desc: 'Synthetic Oil Change & Filter' },
  { type: 'inspection', desc: 'Annual Safety Inspection' },
  { type: 'tire_rotation', desc: 'Tire Rotation & Balance' },
  { type: 'brake_service', desc: 'Brake Pad Replacement' },
  { type: 'transmission', desc: 'Transmission Fluid Flush' },
  { type: 'engine_repair', desc: 'Check Engine Diagnosis & Repair' },
  { type: 'body_work', desc: 'Body Panel Repair & Paint' },
  { type: 'other', desc: 'General Maintenance' },
];

const SERVICE_SHOPS = [
  'Jiffy Lube',
  'Firestone Complete Auto Care',
  'Midas',
  'Pep Boys',
  'Valvoline Instant Oil Change',
  'Goodyear Auto Service',
  'NTB Tire & Service',
  'Meineke Car Care',
  'Dealership Service Center',
  'Independent Garage',
];

// Base market values by make (mid-range model, current year)
const BASE_VALUES: Record<string, number> = {
  Honda: 28500,
  Ford: 32000,
  Chevrolet: 31000,
  Jeep: 34000,
  Chrysler: 28000,
  Toyota: 30000,
  Kia: 26000,
  Hyundai: 27000,
  Subaru: 29000,
  Mitsubishi: 24000,
  BMW: 52000,
  'Mercedes-Benz': 58000,
  Volkswagen: 28000,
  Audi: 48000,
  'Land Rover': 65000,
  Jaguar: 55000,
  Maserati: 78000,
  Fiat: 22000,
  Ferrari: 280000,
  Volvo: 42000,
  Unknown: 25000,
};

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function generatePlate(rng: SeededRandom): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let plate = '';
  for (let i = 0; i < 3; i++) plate += letters[rng.nextInt(0, letters.length - 1)];
  for (let i = 0; i < 3; i++) plate += rng.nextInt(0, 9);
  return plate;
}

function generateDL(rng: SeededRandom): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let dl = '';
  for (let i = 0; i < 8; i++) dl += chars[rng.nextInt(0, chars.length - 1)];
  return dl;
}

function generateVIN(rng: SeededRandom, seed: number): string {
  const wmis = [
    '1HG',
    '1FA',
    '1FT',
    '1G1',
    '1GC',
    '1J4',
    '1C4',
    '2T1',
    '2F2',
    '5XY',
    'JHM',
    'JT2',
    'JF1',
    'WBA',
    'WVW',
  ];
  const wmi = wmis[seed % wmis.length];
  const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
  let vin = wmi;
  for (let i = 0; i < 14; i++) vin += chars[rng.nextInt(0, chars.length - 1)];
  return vin.slice(0, 17);
}

function generateTitleBrands(rng: SeededRandom, hasAccidents: boolean, hasTotalLoss: boolean): TitleBrand[] {
  const brands: TitleBrand[] = ['clean'];

  if (hasTotalLoss && rng.chance(0.7)) brands.push('salvage');
  if (brands.includes('salvage') && rng.chance(0.5)) brands.push('rebuilt');
  if (rng.chance(0.05)) brands.push('flood');
  if (rng.chance(0.03)) brands.push('lemon');
  if (rng.chance(0.04)) brands.push('theft');
  if (rng.chance(0.08)) brands.push('odometer_rollback');

  // Remove clean if any bad brands exist
  if (brands.length > 1) {
    return brands.filter((b) => b !== 'clean');
  }
  return brands;
}

function generateTitleHistory(
  rng: SeededRandom,
  initialState: string,
  finalBrands: TitleBrand[],
  purchaseDate: Date,
  now: Date
): TitleHistoryEntry[] {
  const history: TitleHistoryEntry[] = [];
  const states = ['CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI'];

  // Start with clean title at purchase
  history.push({
    date: formatDate(purchaseDate),
    state: initialState,
    brand: 'clean',
    mileage: rng.nextInt(5000, 25000),
    issuer: `${rng.pick(['DMV', 'County Clerk', 'Tag Agency'])} ${initialState}`,
  });

  // 15% chance of title wash pattern (bad brand → clean in different state)
  const hasWashPattern = rng.chance(0.15);

  if (hasWashPattern && finalBrands.some((b) => ['clean', 'rebuilt'].includes(b))) {
    // Add a bad title entry in a different state
    const badState = rng.pick(states.filter((s) => s !== initialState));
    const washDate = rng.dateBetween(
      purchaseDate,
      new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    );
    const badBrand = rng.pick(['salvage', 'flood'] as TitleBrand[]);

    history.push({
      date: formatDate(washDate),
      state: badState,
      brand: badBrand,
      mileage: rng.nextInt(50000, 100000),
      issuer: `${rng.pick(['DMV', 'County Clerk'])} ${badState}`,
    });

    // Then clean title back in original or another state
    const cleanState = rng.pick(states.filter((s) => s !== badState));
    const cleanDate = rng.dateBetween(washDate, now);
    history.push({
      date: formatDate(cleanDate),
      state: cleanState,
      brand: 'clean',
      mileage: rng.nextInt(60000, 110000),
      issuer: `${rng.pick(['DMV', 'County Clerk'])} ${cleanState}`,
    });
  }

  // Add 1-2 more normal transfers
  const extraEntries = rng.nextInt(1, 2);
  for (let i = 0; i < extraEntries; i++) {
    const lastEntry = history[history.length - 1];
    const nextDate = rng.dateBetween(new Date(lastEntry.date), now);
    if (nextDate <= new Date(lastEntry.date)) continue;

    history.push({
      date: formatDate(nextDate),
      state: rng.pick(states),
      brand: i === extraEntries - 1 ? finalBrands[0] || 'clean' : 'clean',
      mileage: lastEntry.mileage + rng.nextInt(10000, 40000),
      issuer: `${rng.pick(['DMV', 'County Clerk', 'Motor Vehicle'])} ${rng.pick(states)}`,
    });
  }

  // Sort by date
  return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateMarketValue(
  make: string,
  year: number,
  conditionScore: number
): { low: number; mid: number; high: number } {
  const base = BASE_VALUES[make] || 25000;
  const age = new Date().getFullYear() - year;
  const depreciation = Math.pow(0.88, age); // 12% annual depreciation
  const adjusted = base * depreciation * (conditionScore / 100);

  return {
    low: Math.round(adjusted * 0.85),
    mid: Math.round(adjusted),
    high: Math.round(adjusted * 1.15),
  };
}

function generateRedFlags(report: VehicleReport): string[] {
  const flags: string[] = [];

  if (report.titleBrands.includes('salvage')) flags.push('Salvage title on record');
  if (report.titleBrands.includes('flood')) flags.push('Flood damage reported');
  if (report.titleBrands.includes('lemon')) flags.push('Manufacturer buyback (lemon)');
  if (report.titleBrands.includes('odometer_rollback')) flags.push('Odometer rollback suspected');
  if (report.titleBrands.includes('theft')) flags.push('Prior theft recovery');
  if (report.accidents.some((a) => a.severity === 'total-loss')) flags.push('Total loss declared');
  if (report.tickets.filter((t) => t.status === 'unpaid').length >= 3) flags.push('Multiple unpaid citations');
  if (report.dmvValidation.status === 'suspended') flags.push('Suspended driver license');
  if (report.registration.status === 'suspended') flags.push('Suspended registration');
  if (report.transfers.length > 4) flags.push('Excessive ownership changes');
  if (report.serviceRecords.length < 3) flags.push('Minimal service history');

  return flags;
}

export function generateReport(type: SearchType, value: string, stateParam?: string): VehicleReport {
  const seed = hashString(`${type}:${value.toUpperCase()}`);
  const rng = new SeededRandom(seed);

  let vin: string;
  let make: string;
  let model: string;
  let year: number;
  let plateNumber: string;
  let dlNumber: string;
  let state: string;

  if (type === 'vin') {
    vin = value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
    if (vin.length < 10) {
      vin =
        '1HGC' +
        value
          .toUpperCase()
          .replace(/[^A-HJ-NPR-Z0-9]/g, '')
          .padEnd(13, '0')
          .slice(0, 13);
    }
    const decoded = decodeVIN(vin);
    make = decoded.make;
    model = decoded.model;
    year = decoded.year;
    plateNumber = generatePlate(rng);
    dlNumber = generateDL(rng);
    state = rng.pick(STATES);
  } else if (type === 'plate') {
    plateNumber = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    state = stateParam || rng.pick(STATES);
    vin = generateVIN(rng, seed);
    const decoded = decodeVIN(vin);
    make = decoded.make;
    model = decoded.model;
    year = decoded.year;
    dlNumber = generateDL(rng);
  } else {
    dlNumber = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    vin = generateVIN(rng, seed);
    const decoded = decodeVIN(vin);
    make = decoded.make;
    model = decoded.model;
    year = decoded.year;
    plateNumber = generatePlate(rng);
    state = rng.pick(STATES);
  }

  const color = rng.pick(COLORS);
  const bodyType = rng.pick(BODY_TYPES);
  const now = new Date();
  const purchaseDate = new Date(year, rng.nextInt(0, 11), rng.nextInt(1, 28));

  // Accidents (generate BEFORE title brands)
  const accidentCount = rng.pickWeighted([
    { item: 0, weight: 45 },
    { item: 1, weight: 35 },
    { item: 2, weight: 15 },
    { item: 3, weight: 5 },
  ]);
  const accidents: VehicleReport['accidents'] = [];
  const accidentDescriptions = [
    'Rear-end collision at intersection',
    'Side impact in parking lot',
    'Frontal collision on highway',
    'Hit stationary object',
    'Multi-vehicle pileup',
    'Sideswipe on freeway',
    'Backing collision',
    'Weather-related skid into ditch',
  ];
  let hasTotalLoss = false;
  for (let i = 0; i < accidentCount; i++) {
    const accidentDate = rng.dateBetween(purchaseDate, now);
    const severity = rng.pickWeighted([
      { item: 'minor' as const, weight: 40 },
      { item: 'moderate' as const, weight: 35 },
      { item: 'major' as const, weight: 20 },
      { item: 'total-loss' as const, weight: 5 },
    ]);
    if (severity === 'total-loss') hasTotalLoss = true;
    const damageMap = { minor: 1500, moderate: 7500, major: 25000, 'total-loss': 45000 };
    accidents.push({
      date: formatDate(accidentDate),
      severity,
      description: rng.pick(accidentDescriptions),
      damageEstimate: damageMap[severity] + rng.nextInt(-500, 2000),
      airbagDeployed: severity !== 'minor' && rng.next() > 0.3,
      injuries: severity === 'major' || severity === 'total-loss' || (severity === 'moderate' && rng.next() > 0.5),
      insuranceClaim: damageMap[severity] * 0.85 + rng.nextInt(-1000, 3000),
      location: rng.pick(CITIES),
    });
  }
  accidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Title Brands
  const titleBrands = generateTitleBrands(rng, accidentCount > 0, hasTotalLoss);

  // DMV
  const dmvStatus = rng.pickWeighted([
    { item: 'valid' as const, weight: 75 },
    { item: 'suspended' as const, weight: 15 },
    { item: 'invalid' as const, weight: 10 },
  ]);
  const dmvExpiry = new Date(now.getFullYear() + rng.nextInt(1, 5), rng.nextInt(0, 11), rng.nextInt(1, 28));
  const restrictions =
    dmvStatus === 'valid' && rng.next() > 0.7
      ? rng.pick([
          ['Corrective Lenses'],
          ['Daylight Driving Only'],
          ['Automatic Transmission'],
          ['Corrective Lenses', 'No Interstate'],
        ])
      : [];

  // Registration
  const regStatus = rng.pickWeighted([
    { item: 'active' as const, weight: 80 },
    { item: 'expired' as const, weight: 15 },
    { item: 'suspended' as const, weight: 5 },
  ]);
  const regIssue = new Date(now.getFullYear() - rng.nextInt(0, 3), rng.nextInt(0, 11), rng.nextInt(1, 28));
  const regExpiry = new Date(regIssue.getFullYear() + 1, regIssue.getMonth(), regIssue.getDate());
  const regRenewed = new Date(regIssue.getFullYear(), regIssue.getMonth() + 10, regIssue.getDate());

  // Tickets
  const ticketCount = rng.pickWeighted([
    { item: 0, weight: 30 },
    { item: 1, weight: 25 },
    { item: 2, weight: 20 },
    { item: 3, weight: 12 },
    { item: 4, weight: 8 },
    { item: 5, weight: 5 },
  ]);
  const tickets: VehicleReport['tickets'] = [];
  for (let i = 0; i < ticketCount; i++) {
    const violation = rng.pick(VIOLATIONS);
    const ticketDate = rng.dateBetween(purchaseDate, now);
    tickets.push({
      id: `TKT-${rng.nextInt(100000, 999999)}`,
      date: formatDate(ticketDate),
      violation: violation.desc,
      location: rng.pick(CITIES),
      amount: violation.amount + rng.nextInt(-20, 20),
      status: rng.pickWeighted([
        { item: 'paid' as const, weight: 70 },
        { item: 'unpaid' as const, weight: 20 },
        { item: 'disputed' as const, weight: 10 },
      ]),
      points: violation.points,
    });
  }
  tickets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Transfers
  const transferCount = rng.nextInt(1, 5);
  const transfers: VehicleReport['transfers'] = [];
  let currentMileage = rng.nextInt(5000, 25000);
  for (let i = 0; i < transferCount; i++) {
    const transferDate = i === 0 ? purchaseDate : rng.dateBetween(new Date(transfers[i - 1].date), now);
    const fromName = i === 0 ? 'Dealer' : `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    const toName =
      i === transferCount - 1
        ? `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`
        : `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
    currentMileage += rng.nextInt(15000, 60000);
    transfers.push({
      date: formatDate(transferDate),
      from: fromName,
      to: toName,
      type: i === 0 ? 'dealer' : rng.pick(['sale', 'gift', 'inheritance']),
      mileage: currentMileage,
    });
  }

  // Service Records
  const serviceCount = rng.nextInt(5, 16);
  const serviceRecords: VehicleReport['serviceRecords'] = [];
  let serviceMileage = rng.nextInt(3000, 8000);
  for (let i = 0; i < serviceCount; i++) {
    const serviceDate =
      i === 0
        ? new Date(purchaseDate.getFullYear(), purchaseDate.getMonth() + 3, purchaseDate.getDate())
        : rng.dateBetween(
            new Date(serviceRecords[i - 1].date),
            new Date(Math.min(now.getTime(), new Date(serviceRecords[i - 1].date).getTime() + 180 * 86400000))
          );
    if (serviceDate > now) break;
    const svc = rng.pick(SERVICE_TYPES);
    serviceMileage += rng.nextInt(3000, 8000);
    const costMap: Record<string, number> = {
      oil_change: 65,
      inspection: 45,
      tire_rotation: 55,
      brake_service: 350,
      transmission: 450,
      engine_repair: 1200,
      body_work: 2200,
      other: 150,
    };
    serviceRecords.push({
      date: formatDate(serviceDate),
      mileage: serviceMileage,
      type: svc.type,
      description: svc.desc,
      provider: rng.pick(SERVICE_SHOPS),
      cost: costMap[svc.type] + rng.nextInt(-15, 50),
    });
  }

  // Ownership & mechanical metadata
  const previousOwners = rng.nextInt(1, 5);
  const keysIncluded = rng.pickWeighted([
    { item: 1, weight: 25 },
    { item: 2, weight: 55 },
    { item: 3, weight: 20 },
  ]);
  const paintworkStatus = rng.pickWeighted([
    { item: 'original' as const, weight: 60 },
    { item: 'resprayed' as const, weight: 25 },
    { item: 'unknown' as const, weight: 15 },
  ]);
  const smogStatus = rng.pickWeighted([
    { item: 'pass' as const, weight: 75 },
    { item: 'fail' as const, weight: 15 },
    { item: 'unknown' as const, weight: 10 },
  ]);
  const runsAndDrives = rng.chance(0.85);

  // Paint meter readings
  const PANELS = [
    'Hood',
    'Front Left Fender',
    'Front Right Fender',
    'Driver Door',
    'Passenger Door',
    'Trunk Lid',
    'Roof',
    'Rear Bumper',
    'Front Bumper',
  ];
  const paintMeterReadings = PANELS.map((panel) => {
    const reading = rng.nextInt(80, 180);
    return { panel, reading, unit: 'μm' as const, flagged: reading > 150 };
  });

  const averageDaysOnLot = rng.nextInt(18, 45);
  const wholesaleBook = Math.round(
    (BASE_VALUES[make] || 25000) * Math.pow(0.88, new Date().getFullYear() - year) * (0.65 + rng.next() * 0.17)
  );

  // Title History (for fraud detection)
  const titleHistory = generateTitleHistory(rng, state, titleBrands, purchaseDate, now);

  // Build report object
  const report: VehicleReport = {
    vin,
    make,
    model,
    year,
    color,
    bodyType,
    conditionScore: 0, // placeholder, calculated below
    titleBrands,
    marketValue: { low: 0, mid: 0, high: 0 }, // placeholder
    redFlags: [], // placeholder
    previousOwners,
    keysIncluded,
    paintworkStatus,
    smogCheck: {
      status: smogStatus,
      date:
        smogStatus !== 'unknown' ? formatDate(rng.dateBetween(new Date(now.getFullYear() - 1, 0, 1), now)) : undefined,
    },
    runsAndDrives,
    paintMeterReadings: paintMeterReadings.slice(0, rng.nextInt(5, 9)),
    averageDaysOnLot,
    wholesaleBook,
    powertrain: 'ice',
    velocity: {
      velocityScore: 0,
      daysToSellEstimate: 0,
      liquidityTier: 'medium',
      seasonalityImpact: 0,
      curves: [],
      factors: [],
    },
    dmvValidation: {
      status: dmvStatus,
      validatedAt: formatDate(rng.dateBetween(new Date(now.getFullYear() - 1, 0, 1), now)),
      state,
      licenseNumber: dlNumber,
      expiryDate: formatDate(dmvExpiry),
      restrictions,
    },
    registration: {
      status: regStatus,
      plateNumber,
      state,
      issueDate: formatDate(regIssue),
      expiryDate: formatDate(regExpiry),
      lastRenewed: formatDate(regRenewed),
    },
    tickets,
    transfers,
    accidents,
    serviceRecords,
    titleHistory,
    fraud: {
      fraudScore: 0,
      riskLevel: 'low',
      titleWashDetected: false,
      odometerRollbackProbability: 0,
      totalLossDecision: 'uncertain',
      flags: [],
    },
  };

  // Calculate derived fields
  report.conditionScore = calculateConditionScore(report);
  report.marketValue = calculateMarketValue(make, year, report.conditionScore);
  report.redFlags = generateRedFlags(report);
  report.powertrain = detectPowertrain(make, model);
  report.velocity = calculateVelocity(report);
  report.fraud = calculateFraud(report);
  report.battery = calculateBatteryHealth(report);

  return report;
}

export function generateBulkReports(vins: string[]): BulkReport[] {
  return vins.map((vin) => {
    try {
      const report = generateReport('vin', vin);
      return {
        vin: report.vin,
        make: report.make,
        model: report.model,
        year: report.year,
        conditionScore: report.conditionScore,
        titleBrands: report.titleBrands,
        redFlags: report.redFlags,
        marketValueMid: report.marketValue.mid,
        accidentCount: report.accidents.length,
        ticketCount: report.tickets.length,
        registrationStatus: report.registration.status,
        status: 'success',
      };
    } catch {
      return {
        vin,
        make: '',
        model: '',
        year: 0,
        conditionScore: 0,
        titleBrands: [],
        redFlags: [],
        marketValueMid: 0,
        accidentCount: 0,
        ticketCount: 0,
        registrationStatus: '',
        status: 'error',
        error: 'Failed to generate report',
      };
    }
  });
}

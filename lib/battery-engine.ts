import { VehicleReport, BatteryReport } from './types';

const EV_MAKES = ['Tesla', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Chevrolet', 'Toyota', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Jaguar', 'Volvo'];

const EV_MODELS: Record<string, string[]> = {
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  BMW: ['i4', 'iX', 'i7', 'iX3'],
  'Mercedes-Benz': ['EQS', 'EQE', 'EQB', 'EQA'],
  Audi: ['e-tron', 'Q4 e-tron', 'e-tron GT'],
  Volkswagen: ['ID.4', 'ID.Buzz', 'e-Golf'],
  Ford: ['Mustang Mach-E', 'F-150 Lightning', 'E-Transit'],
  Chevrolet: ['Bolt EV', 'Bolt EUV', 'Equinox EV', 'Blazer EV'],
  Toyota: ['bZ4X', 'Prius Prime', 'RAV4 Prime'],
  Honda: ['Prologue'],
  Hyundai: ['Ioniq 5', 'Ioniq 6', 'Kona Electric'],
  Kia: ['EV6', 'EV9', 'Niro EV'],
  Nissan: ['Leaf', 'Ariya'],
  Jaguar: ['I-PACE'],
  Volvo: ['XC40 Recharge', 'C40 Recharge', 'EX30'],
};

const OEM_SOURCES: Record<string, string> = {
  Tesla: 'Tesla BMS API',
  BMW: 'BMW ConnectedDrive Battery',
  'Mercedes-Benz': 'Mercedes ME Battery Health',
  Audi: 'Audi Connect High-Voltage',
  Volkswagen: 'VW We Charge Battery',
  Ford: 'Ford Intelligent Power',
  Chevrolet: 'GM Ultium Battery Monitor',
  Toyota: 'Toyota Remote Connect EV',
  Honda: 'HondaLink EV Data',
  Hyundai: 'Hyundai Bluelink Battery',
  Kia: 'Kia Connect EV Status',
  Nissan: 'Nissan EV Connect Battery',
  Jaguar: 'Jaguar InControl Battery',
  Volvo: 'Volvo Cars App Battery',
};

export function isEV(make: string, model: string): boolean {
  if (!EV_MAKES.includes(make)) return false;
  const evModels = EV_MODELS[make] || [];
  return evModels.some((m) => model.toLowerCase().includes(m.toLowerCase()));
}

export function isHybrid(make: string, model: string): boolean {
  const hybridModels = ['Prius', 'RAV4 Prime', 'Camry Hybrid', 'Accord Hybrid', 'Ioniq', 'Niro', 'Kona'];
  return hybridModels.some((m) => model.toLowerCase().includes(m.toLowerCase()));
}

export function detectPowertrain(make: string, model: string): 'ice' | 'hybrid' | 'bev' | 'phev' {
  if (isEV(make, model)) return 'bev';
  if (isHybrid(make, model)) {
    if (model.toLowerCase().includes('prime') || model.toLowerCase().includes('phev')) return 'phev';
    return 'hybrid';
  }
  return 'ice';
}

export function calculateBatteryHealth(report: VehicleReport): BatteryReport | undefined {
  if (report.powertrain !== 'bev' && report.powertrain !== 'phev') {
    return undefined;
  }

  const age = new Date().getFullYear() - report.year;
  const mileage = report.serviceRecords.length > 0
    ? report.serviceRecords[report.serviceRecords.length - 1].mileage
    : age * 12000;

  // Base SOH degradation: ~2% per year + ~0.5% per 10k miles
  const ageDegradation = age * 2;
  const mileageDegradation = (mileage / 10000) * 0.5;
  let soh = 100 - ageDegradation - mileageDegradation;

  // Condition impact
  if (report.conditionScore < 50) soh -= 5;
  else if (report.conditionScore < 70) soh -= 2;

  // Climate impact based on state history
  const hotStates = ['TX', 'FL', 'AZ', 'NV', 'CA'];
  const coldStates = ['MN', 'WI', 'MI', 'OH', 'NY', 'MA'];
  const states = report.titleHistory.map((t) => t.state);
  const hotExposure = states.filter((s) => hotStates.includes(s)).length;
  const coldExposure = states.filter((s) => coldStates.includes(s)).length;

  let climateImpact: BatteryReport['climateImpact'] = 'minimal';
  if (hotExposure >= 3 || coldExposure >= 3) {
    soh -= 4;
    climateImpact = 'severe';
  } else if (hotExposure >= 2 || coldExposure >= 2) {
    soh -= 2;
    climateImpact = 'moderate';
  }

  // Charge cycles estimate: ~1 cycle per 200 miles
  const chargeCycles = Math.round(mileage / 200);

  // High cycle penalty
  if (chargeCycles > 500) soh -= 3;

  soh = Math.max(60, Math.min(100, Math.round(soh)));

  // Grade
  let grade: BatteryReport['grade'];
  if (soh >= 95) grade = 'A';
  else if (soh >= 85) grade = 'B';
  else if (soh >= 75) grade = 'C';
  else grade = 'D';

  // Range calculation (base range varies by make)
  const baseRange: Record<string, number> = {
    Tesla: 320,
    BMW: 300,
    'Mercedes-Benz': 340,
    Audi: 280,
    Volkswagen: 260,
    Ford: 270,
    Chevrolet: 250,
    Toyota: 220,
    Honda: 290,
    Hyundai: 310,
    Kia: 300,
    Nissan: 210,
    Jaguar: 230,
    Volvo: 270,
  };
  const base = baseRange[report.make] || 250;
  const currentRange = Math.round(base * (soh / 100));

  // Projected at 100k miles
  const degradationRate = (100 - soh) / (mileage / 10000);
  const projectedSOH100k = Math.max(60, 100 - degradationRate * 10);
  const projectedRange100k = Math.round(base * (projectedSOH100k / 100));

  // Warranty
  const warrantyMonthsTotal = report.powertrain === 'bev' ? 96 : 60; // 8yr for BEV, 5yr for PHEV
  const warrantyMilesTotal = report.powertrain === 'bev' ? 100000 : 60000;
  const warrantyMonthsRemaining = Math.max(0, warrantyMonthsTotal - age * 12);
  const warrantyMilesRemaining = Math.max(0, warrantyMilesTotal - mileage);

  // Transferability
  let warrantyTransferable = true;
  let warrantyTransferScore = 85;
  if (report.previousOwners > 2) {
    warrantyTransferable = false;
    warrantyTransferScore = 30;
  } else if (report.previousOwners > 1) {
    warrantyTransferScore = 60;
  }

  // Cell balance based on condition
  let cellBalance: BatteryReport['cellBalance'];
  if (soh >= 90 && report.conditionScore >= 75) cellBalance = 'excellent';
  else if (soh >= 80 && report.conditionScore >= 60) cellBalance = 'good';
  else if (soh >= 70) cellBalance = 'fair';
  else cellBalance = 'poor';

  // Replacement cost
  const estimatedReplacementCost = report.powertrain === 'bev'
    ? Math.round(8000 + (base - 200) * 30)
    : Math.round(4000 + (base - 200) * 15);

  return {
    stateOfHealth: soh,
    grade,
    currentRange,
    projectedRange100k,
    degradationRate: Math.round(degradationRate * 10) / 10,
    chargeCycles,
    warrantyMonthsRemaining,
    warrantyMilesRemaining,
    warrantyTransferable,
    warrantyTransferScore,
    climateImpact,
    oemDataSource: OEM_SOURCES[report.make] || 'OEM Battery Management System',
    estimatedReplacementCost,
    cellBalance,
  };
}

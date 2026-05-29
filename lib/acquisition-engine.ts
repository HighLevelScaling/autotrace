import { VehicleReport } from './types';

export interface AcquisitionAnalysis {
  vin: string;
  year: number;
  make: string;
  model: string;
  color: string;
  bodyType: string;
  conditionScore: number;

  recommendation: 'buy' | 'caution' | 'avoid';
  acquisitionScore: number;

  marketValueLow: number;
  marketValueMid: number;
  marketValueHigh: number;
  estimatedReconCost: number;
  maxBid: number;
  targetListedPrice: number;
  estimatedDaysToSell: number;
  floorPlanDailyRate: number;
  floorPlanTotalCost: number;
  marketingCost: number;
  trueNetProfit: number;
  netMarginPercent: number;

  riskFactors: string[];
  titleIssues: boolean;
  accidentHistory: boolean;
  hasTotalLoss: boolean;
}

// Configuration constants
const FLOOR_PLAN_DAILY_RATE = 18; // $18/day typical dealer floor plan
const MARKETING_COST_PER_CAR = 450; // Advertising, photos, listing fees
const TARGET_NET_MARGIN = 0.15; // 15% target net margin
const RECON_BASE_COST = 600;

export function analyzeAcquisition(report: VehicleReport): AcquisitionAnalysis {
  // 1. Calculate Acquisition Score (1-100)
  let score = 100;
  const riskFactors: string[] = [];

  // Title brand penalties
  const badBrands = ['salvage', 'rebuilt', 'flood', 'lemon', 'odometer_rollback'];
  for (const brand of report.titleBrands) {
    if (badBrands.includes(brand)) {
      score -= brand === 'salvage' ? 30 : brand === 'flood' ? 28 : brand === 'odometer_rollback' ? 25 : 20;
      riskFactors.push(`Title brand: ${brand.replace('_', ' ')}`);
    }
  }

  // Accident penalties
  let hasTotalLoss = false;
  for (const accident of report.accidents) {
    switch (accident.severity) {
      case 'minor': score -= 4; break;
      case 'moderate': score -= 10; riskFactors.push('Moderate accident history'); break;
      case 'major': score -= 18; riskFactors.push('Major accident on record'); break;
      case 'total-loss': score -= 35; hasTotalLoss = true; riskFactors.push('Total loss declared'); break;
    }
  }

  // Condition score factor
  if (report.conditionScore < 50) { score -= 20; riskFactors.push('Very poor condition score'); }
  else if (report.conditionScore < 60) { score -= 12; riskFactors.push('Poor condition score'); }
  else if (report.conditionScore < 70) { score -= 5; }

  // Ticket penalties
  if (report.tickets.length >= 5) { score -= 10; riskFactors.push('Excessive tickets'); }
  else if (report.tickets.length >= 3) { score -= 5; }

  // Registration/DMV issues
  if (report.registration.status === 'suspended') { score -= 12; riskFactors.push('Suspended registration'); }
  if (report.dmvValidation.status === 'suspended') { score -= 8; }

  // Service history gap
  if (report.serviceRecords.length < 3) { score -= 8; riskFactors.push('Minimal service history'); }

  // Ownership churn
  if (report.transfers.length > 4) { score -= 5; riskFactors.push('Excessive ownership changes'); }

  score = Math.max(1, Math.min(100, Math.round(score)));

  // 2. Recommendation
  let recommendation: 'buy' | 'caution' | 'avoid';
  if (score >= 80) recommendation = 'buy';
  else if (score >= 60) recommendation = 'caution';
  else recommendation = 'avoid';

  // 3. Estimated Reconditioning Cost
  let estimatedReconCost = RECON_BASE_COST;
  for (const accident of report.accidents) {
    switch (accident.severity) {
      case 'minor': estimatedReconCost += 350; break;
      case 'moderate': estimatedReconCost += 1200; break;
      case 'major': estimatedReconCost += 3500; break;
      case 'total-loss': estimatedReconCost += 8000; break;
    }
  }
  // Service gap penalty
  if (report.serviceRecords.length < 3) estimatedReconCost += 800;
  if (report.serviceRecords.length === 0) estimatedReconCost += 1500;

  // Title brand recon penalty
  if (report.titleBrands.includes('salvage')) estimatedReconCost += 5000;
  if (report.titleBrands.includes('flood')) estimatedReconCost += 6000;
  if (report.titleBrands.includes('rebuilt')) estimatedReconCost += 2000;

  estimatedReconCost = Math.round(estimatedReconCost);

  // 4. Estimated Days to Sell
  let daysToSell = 28; // Base
  // Condition factor
  if (report.conditionScore >= 85) daysToSell -= 8;
  else if (report.conditionScore >= 70) daysToSell -= 4;
  else if (report.conditionScore >= 55) daysToSell += 5;
  else daysToSell += 15;

  // Title factor
  if (report.titleBrands.some(b => ['salvage', 'flood'].includes(b))) daysToSell += 35;
  else if (report.titleBrands.some(b => ['rebuilt', 'lemon'].includes(b))) daysToSell += 18;

  // Accident factor
  const accidentCount = report.accidents.length;
  if (accidentCount === 0) daysToSell -= 3;
  else if (accidentCount >= 2) daysToSell += 10;

  // Make/model desirability
  const desirableMakes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Lexus'];
  if (desirableMakes.includes(report.make)) daysToSell -= 3;

  daysToSell = Math.max(7, Math.round(daysToSell));

  // 5. Max Bid Calculation
  // Max bid = market value mid - recon - marketing - (floor plan × days) - target profit margin
  const floorPlanTotal = daysToSell * FLOOR_PLAN_DAILY_RATE;
  const totalCosts = estimatedReconCost + floorPlanTotal + MARKETING_COST_PER_CAR;
  const desiredProfit = report.marketValue.mid * TARGET_NET_MARGIN;
  const maxBid = Math.round(report.marketValue.mid - totalCosts - desiredProfit);
  const safeMaxBid = Math.max(1000, maxBid);

  // 6. Target Listed Price (market value mid, adjusted)
  const targetListedPrice = report.marketValue.mid;

  // 7. True Net Profit (if bought at max bid and sold at market value mid)
  const trueNetProfit = Math.round(targetListedPrice - safeMaxBid - estimatedReconCost - floorPlanTotal - MARKETING_COST_PER_CAR);
  const netMarginPercent = safeMaxBid > 0 ? (trueNetProfit / (safeMaxBid + estimatedReconCost)) * 100 : 0;

  return {
    vin: report.vin,
    year: report.year,
    make: report.make,
    model: report.model,
    color: report.color,
    bodyType: report.bodyType,
    conditionScore: report.conditionScore,
    recommendation,
    acquisitionScore: score,
    marketValueLow: report.marketValue.low,
    marketValueMid: report.marketValue.mid,
    marketValueHigh: report.marketValue.high,
    estimatedReconCost,
    maxBid: safeMaxBid,
    targetListedPrice,
    estimatedDaysToSell: daysToSell,
    floorPlanDailyRate: FLOOR_PLAN_DAILY_RATE,
    floorPlanTotalCost: floorPlanTotal,
    marketingCost: MARKETING_COST_PER_CAR,
    trueNetProfit,
    netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    riskFactors,
    titleIssues: report.titleBrands.some(b => b !== 'clean'),
    accidentHistory: report.accidents.length > 0,
    hasTotalLoss,
  };
}

export function analyzeBulkAcquisitions(reports: VehicleReport[]): AcquisitionAnalysis[] {
  return reports.map(r => analyzeAcquisition(r));
}

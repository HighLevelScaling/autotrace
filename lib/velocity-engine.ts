import { VehicleReport, VelocityReport, VelocityCurve, VelocityFactor } from './types';
import { BRAND_LIQUIDITY, COLOR_DEMAND, SEASONAL_MULTIPLIERS, DEFAULT_SEASONAL } from './velocity-data';

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getBaseProbabilities(score: number) {
  if (score >= 85) return { days7: 0.25, days14: 0.55, days30: 0.85, days60: 0.96, days90: 0.99 };
  if (score >= 70) return { days7: 0.12, days14: 0.3, days30: 0.6, days60: 0.82, days90: 0.93 };
  if (score >= 50) return { days7: 0.05, days14: 0.15, days30: 0.35, days60: 0.58, days90: 0.75 };
  if (score >= 30) return { days7: 0.02, days14: 0.06, days30: 0.18, days60: 0.32, days90: 0.48 };
  return { days7: 0.005, days14: 0.02, days30: 0.07, days60: 0.15, days90: 0.25 };
}

function mapScoreToDays(score: number): number {
  if (score >= 85) return 10 + (100 - score) * 0.5;
  if (score >= 70) return 18 + (85 - score) * 0.8;
  if (score >= 50) return 30 + (70 - score) * 1.5;
  if (score >= 30) return 60 + (50 - score) * 2.5;
  return 110 + (30 - score) * 3;
}

function generateCurves(score: number, marketValue: { low: number; mid: number; high: number }): VelocityCurve[] {
  const prices = [
    { label: `Low ($${marketValue.low.toLocaleString()})`, price: marketValue.low },
    { label: `Mid ($${marketValue.mid.toLocaleString()})`, price: marketValue.mid },
    { label: `High ($${marketValue.high.toLocaleString()})`, price: marketValue.high },
  ];

  return prices.map(({ label, price }) => {
    const priceRatio = price / marketValue.mid;
    const priceDecay = Math.pow(priceRatio, -1.8);
    const base = getBaseProbabilities(score);
    return {
      label,
      price,
      probabilities: {
        days7: Math.min(0.99, base.days7 * priceDecay * 0.7),
        days14: Math.min(0.99, base.days14 * priceDecay * 0.8),
        days30: Math.min(0.99, base.days30 * priceDecay),
        days60: Math.min(0.99, base.days60 * priceDecay * 1.05),
        days90: Math.min(0.99, base.days90 * priceDecay * 1.1),
      },
    };
  });
}

export function calculateCustomCurve(
  score: number,
  marketValue: { low: number; mid: number; high: number },
  customPrice: number
): VelocityCurve {
  const priceRatio = customPrice / marketValue.mid;
  const priceDecay = Math.pow(priceRatio, -1.8);
  const base = getBaseProbabilities(score);
  return {
    label: `Your Price ($${customPrice.toLocaleString()})`,
    price: customPrice,
    probabilities: {
      days7: Math.min(0.99, base.days7 * priceDecay * 0.7),
      days14: Math.min(0.99, base.days14 * priceDecay * 0.8),
      days30: Math.min(0.99, base.days30 * priceDecay),
      days60: Math.min(0.99, base.days60 * priceDecay * 1.05),
      days90: Math.min(0.99, base.days90 * priceDecay * 1.1),
    },
  };
}

export function calculateVelocity(report: VehicleReport): VelocityReport {
  const factors: VelocityFactor[] = [];
  let score = 50;
  const age = new Date().getFullYear() - report.year;

  // 1. Brand Liquidity
  const brandScore = BRAND_LIQUIDITY[report.make.toLowerCase()] ?? 0;
  score += brandScore;
  factors.push({
    name: 'Brand Liquidity',
    impact: brandScore,
    direction: brandScore >= 0 ? 'positive' : 'negative',
    description: `${report.make} ${brandScore >= 10 ? 'is a fast mover' : brandScore <= -10 ? 'has limited buyer pool' : 'has average liquidity'}`,
  });

  // 2. Age Penalty
  let agePenalty = 0;
  if (age <= 3) agePenalty = 0;
  else if (age <= 7) agePenalty = -5 - (age - 3) * 2.5;
  else if (age <= 12) agePenalty = -15 - (age - 7) * 4;
  else agePenalty = -35 - (age - 12) * 1.5;
  agePenalty = Math.max(-50, agePenalty);
  score += agePenalty;
  factors.push({
    name: 'Vehicle Age',
    impact: agePenalty,
    direction: agePenalty >= 0 ? 'positive' : 'negative',
    description: `${age} years old — ${age <= 5 ? 'near-peak demand' : age <= 10 ? 'mature market' : 'limited buyer pool'}`,
  });

  // 3. Condition Score
  const conditionBoost = (report.conditionScore / 100) * 20;
  score += conditionBoost;
  factors.push({
    name: 'Condition Score',
    impact: conditionBoost,
    direction: 'positive',
    description: `${report.conditionScore}/100 — ${report.conditionScore >= 80 ? 'above average' : report.conditionScore >= 60 ? 'average wear' : 'below average'}`,
    severity: report.conditionScore < 50 ? 'high' : undefined,
  });

  // 4. Title Friction
  let titlePenalty = 0;
  let titleDesc = 'Clean title';
  if (report.titleBrands.includes('salvage')) {
    titlePenalty = -35;
    titleDesc = 'Salvage title — major buyer resistance';
  } else if (report.titleBrands.includes('rebuilt')) {
    titlePenalty = -20;
    titleDesc = 'Rebuilt title — requires disclosure';
  } else if (report.titleBrands.includes('flood')) {
    titlePenalty = -40;
    titleDesc = 'Flood title — severe buyer resistance';
  } else if (report.titleBrands.includes('lemon')) {
    titlePenalty = -45;
    titleDesc = 'Lemon title — very limited buyer pool';
  } else if (report.titleBrands.includes('odometer_rollback')) {
    titlePenalty = -30;
    titleDesc = 'Odometer discrepancy — trust issue';
  } else if (report.titleBrands.includes('theft')) {
    titlePenalty = -25;
    titleDesc = 'Theft recovery — insurance complications';
  } else {
    titlePenalty = +10;
  }
  score += titlePenalty;
  factors.push({
    name: 'Title Brands',
    impact: titlePenalty,
    direction: titlePenalty >= 0 ? 'positive' : 'negative',
    description: titleDesc,
    severity: titlePenalty <= -30 ? 'high' : titlePenalty <= -15 ? 'medium' : undefined,
  });

  // 5. Mileage Penalty
  const expectedMileage = age * 12000;
  const lastService = report.serviceRecords.length > 0 ? report.serviceRecords[report.serviceRecords.length - 1] : null;
  const currentMileage = lastService ? lastService.mileage : expectedMileage;
  const mileageRatio = expectedMileage > 0 ? currentMileage / expectedMileage : 1;
  let mileagePenalty = 0;
  if (mileageRatio > 1.5) mileagePenalty = -15;
  else if (mileageRatio > 1.2) mileagePenalty = -8;
  else if (mileageRatio > 1.0) mileagePenalty = -3;
  else if (mileageRatio < 0.7) mileagePenalty = +3;
  score += mileagePenalty;
  factors.push({
    name: 'Mileage',
    impact: mileagePenalty,
    direction: mileagePenalty >= 0 ? 'positive' : 'negative',
    description:
      mileageRatio > 1.2 ? 'High mileage for age' : mileageRatio < 0.8 ? 'Low miles — desirable' : 'Average mileage',
  });

  // 6. Color Demand
  const colorScore = COLOR_DEMAND[report.color.toLowerCase()] ?? 0;
  score += colorScore;
  factors.push({
    name: 'Color Demand',
    impact: colorScore,
    direction: colorScore >= 0 ? 'positive' : 'negative',
    description: `${report.color} — ${colorScore >= 3 ? 'high demand neutral' : colorScore <= -2 ? 'niche appeal' : 'average demand'}`,
  });

  // 7. Accident History
  let accidentPenalty = 0;
  const totalLossCount = report.accidents.filter((a) => a.insuranceClaim > 15000).length;
  if (totalLossCount > 0) accidentPenalty = -15;
  accidentPenalty += report.accidents.length * -3;
  accidentPenalty = Math.max(-20, accidentPenalty);
  score += accidentPenalty;
  factors.push({
    name: 'Accident History',
    impact: accidentPenalty,
    direction: accidentPenalty >= 0 ? 'positive' : 'negative',
    description: `${report.accidents.length} accidents${totalLossCount > 0 ? ' including total loss' : ''}`,
    severity: totalLossCount > 0 ? 'high' : report.accidents.length > 2 ? 'medium' : undefined,
  });

  // 8. Ownership History
  let ownerPenalty = 0;
  if (report.previousOwners > 3) ownerPenalty = -10;
  else if (report.previousOwners > 2) ownerPenalty = -5;
  else if (report.previousOwners === 1) ownerPenalty = +5;
  score += ownerPenalty;
  factors.push({
    name: 'Ownership History',
    impact: ownerPenalty,
    direction: ownerPenalty >= 0 ? 'positive' : 'negative',
    description: `${report.previousOwners} previous owner${report.previousOwners === 1 ? '' : 's'} — ${report.previousOwners === 1 ? 'single owner premium' : report.previousOwners > 3 ? 'high turnover concern' : 'normal'}`,
    severity: report.previousOwners > 4 ? 'high' : undefined,
  });

  // 9. Paintwork
  let paintScore = 0;
  let paintDesc = '';
  if (report.paintworkStatus === 'original') {
    paintScore = +5;
    paintDesc = 'Original factory paint';
  } else if (report.paintworkStatus === 'resprayed') {
    paintScore = -5;
    paintDesc = 'Resprayed panels detected';
  } else {
    paintScore = 0;
    paintDesc = 'Paint condition unknown';
  }
  score += paintScore;
  factors.push({
    name: 'Paintwork',
    impact: paintScore,
    direction: paintScore >= 0 ? 'positive' : 'negative',
    description: paintDesc,
  });

  // 10. Smog Check
  let smogScore = 0;
  let smogDesc = '';
  if (report.smogCheck.status === 'pass') {
    smogScore = +5;
    smogDesc = 'Smog check passed';
  } else if (report.smogCheck.status === 'fail') {
    smogScore = -10;
    smogDesc = 'Failed smog — registration blocker';
  } else {
    smogScore = 0;
    smogDesc = 'Smog status unknown';
  }
  score += smogScore;
  factors.push({
    name: 'Smog Check',
    impact: smogScore,
    direction: smogScore >= 0 ? 'positive' : 'negative',
    description: smogDesc,
    severity: smogScore < 0 ? 'high' : undefined,
  });

  // 11. Service Records
  let serviceScore = 0;
  const dealerServices = report.serviceRecords.filter((s) => s.provider?.toLowerCase().includes('dealer')).length;
  if (report.serviceRecords.length >= 10 && dealerServices >= 5) serviceScore = +8;
  else if (report.serviceRecords.length >= 5) serviceScore = +4;
  else if (report.serviceRecords.length >= 1) serviceScore = +1;
  score += serviceScore;
  factors.push({
    name: 'Service History',
    impact: serviceScore,
    direction: serviceScore >= 0 ? 'positive' : 'negative',
    description: `${report.serviceRecords.length} records${dealerServices > 0 ? ` (${dealerServices} at dealership)` : ''}`,
  });

  // 12. Runs & Drives
  const runsScore = report.runsAndDrives ? +10 : -20;
  score += runsScore;
  factors.push({
    name: 'Runs & Drives',
    impact: runsScore,
    direction: runsScore >= 0 ? 'positive' : 'negative',
    description: report.runsAndDrives ? 'Confirmed operational' : 'Non-running — major reconditioning needed',
    severity: !report.runsAndDrives ? 'high' : undefined,
  });

  // 13. Keys Included
  let keyScore = 0;
  if (report.keysIncluded >= 2) keyScore = +2;
  else if (report.keysIncluded === 1) keyScore = 0;
  else keyScore = -5;
  score += keyScore;
  factors.push({
    name: 'Keys Included',
    impact: keyScore,
    direction: keyScore >= 0 ? 'positive' : 'negative',
    description: `${report.keysIncluded} key${report.keysIncluded === 1 ? '' : 's'} — ${report.keysIncluded >= 2 ? 'full set' : report.keysIncluded === 1 ? 'single key' : 'no keys'}`,
  });

  // 14. Paint Meter
  let paintMeterPenalty = 0;
  if (report.paintMeterReadings && report.paintMeterReadings.length > 0) {
    const flaggedPanels = report.paintMeterReadings.filter((r) => r.flagged).length;
    paintMeterPenalty = flaggedPanels * -2;
    paintMeterPenalty = Math.max(-8, paintMeterPenalty);
  }
  score += paintMeterPenalty;
  factors.push({
    name: 'Paint Meter',
    impact: paintMeterPenalty,
    direction: paintMeterPenalty >= 0 ? 'positive' : 'negative',
    description:
      report.paintMeterReadings && report.paintMeterReadings.length > 0
        ? `${report.paintMeterReadings.filter((r) => r.flagged).length} panels flagged`
        : 'No paint meter data',
  });

  // 15. Seasonality
  const month = new Date().getMonth();
  const seasonalMult = SEASONAL_MULTIPLIERS[report.bodyType.toLowerCase()] ?? DEFAULT_SEASONAL;
  const seasonalImpact = (seasonalMult[month] - 1) * 100;
  score = score * seasonalMult[month];
  factors.push({
    name: 'Seasonality',
    impact: Math.round(seasonalImpact),
    direction: seasonalImpact >= 0 ? 'positive' : 'negative',
    description: `${seasonalImpact >= 0 ? '+' : ''}${Math.round(seasonalImpact)}% — ${report.bodyType} demand this month`,
  });

  score = clampScore(score);
  const liquidityTier = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  const daysToSell = Math.round(mapScoreToDays(score));
  const curves = generateCurves(score, report.marketValue);

  factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return {
    velocityScore: score,
    daysToSellEstimate: daysToSell,
    liquidityTier,
    seasonalityImpact: Math.round(seasonalImpact),
    curves,
    factors,
  };
}

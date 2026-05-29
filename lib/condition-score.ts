import { VehicleReport, TitleBrand } from './types';

/**
 * Calculate a 1-100 condition score based on vehicle history.
 * 100 = pristine, 1 = scrap
 */
export function calculateConditionScore(report: VehicleReport): number {
  let score = 100;

  // Accident penalties
  for (const accident of report.accidents) {
    switch (accident.severity) {
      case 'minor': score -= 5; break;
      case 'moderate': score -= 12; break;
      case 'major': score -= 20; break;
      case 'total-loss': score -= 35; break;
    }
  }

  // Title brand penalties
  const brandPenalties: Record<TitleBrand, number> = {
    clean: 0,
    salvage: 30,
    rebuilt: 20,
    flood: 25,
    lemon: 20,
    theft: 10,
    odometer_rollback: 25,
  };
  for (const brand of report.titleBrands) {
    score -= brandPenalties[brand] || 0;
  }

  // Ticket penalties
  const totalPoints = report.tickets.reduce((sum, t) => sum + t.points, 0);
  score -= totalPoints * 2;
  score -= report.tickets.filter(t => t.status === 'unpaid').length * 3;

  // Registration penalties
  if (report.registration.status === 'suspended') score -= 10;
  if (report.registration.status === 'expired') score -= 5;

  // DMV penalties
  if (report.dmvValidation.status === 'suspended') score -= 10;
  if (report.dmvValidation.status === 'invalid') score -= 15;

  // Service gap penalty
  if (report.serviceRecords.length > 0) {
    const lastService = new Date(report.serviceRecords[report.serviceRecords.length - 1].date);
    const monthsSinceService = (Date.now() - lastService.getTime()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceService > 18) score -= 8;
    else if (monthsSinceService > 12) score -= 4;
  } else {
    score -= 10; // No service history at all
  }

  // Ownership churn penalty
  if (report.transfers.length > 4) score -= 5;

  return Math.max(1, Math.min(100, Math.round(score)));
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent', color: 'text-emerald-400' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-400' };
  if (score >= 55) return { label: 'Fair', color: 'text-amber-400' };
  if (score >= 40) return { label: 'Poor', color: 'text-orange-400' };
  return { label: 'Critical', color: 'text-red-400' };
}

export function getScoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-500/15 border-emerald-500/20';
  if (score >= 70) return 'bg-blue-500/15 border-blue-500/20';
  if (score >= 55) return 'bg-amber-500/15 border-amber-500/20';
  if (score >= 40) return 'bg-orange-500/15 border-orange-500/20';
  return 'bg-red-500/15 border-red-500/20';
}

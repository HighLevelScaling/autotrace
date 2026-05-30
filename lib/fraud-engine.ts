import { VehicleReport, FraudReport, TitleHistoryEntry } from './types';

export function calculateFraud(report: VehicleReport): FraudReport {
  let fraudScore = 0;
  const flags: string[] = [];

  // 1. Title Wash Detection
  let titleWashDetected = false;
  let titleWashDetails: string | undefined;

  if (report.titleHistory && report.titleHistory.length >= 2) {
    // Sort by date ascending
    const sorted = [...report.titleHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      // If bad brand followed by clean brand in different state = title wash
      const badBrands = ['salvage', 'flood', 'rebuilt', 'lemon'];
      if (
        badBrands.includes(current.brand) &&
        next.brand === 'clean' &&
        current.state !== next.state
      ) {
        titleWashDetected = true;
        titleWashDetails = `${current.brand} title in ${current.state} washed to clean in ${next.state} (${next.date})`;
        fraudScore += 40;
        flags.push(`Title wash: ${current.brand} → clean across state lines`);
        break;
      }

      // If bad brand followed by rebuilt in different state = possible wash
      if (
        current.brand === 'salvage' &&
        next.brand === 'rebuilt' &&
        current.state !== next.state
      ) {
        fraudScore += 15;
        flags.push(`Cross-state rebuilt title: ${current.state} → ${next.state}`);
      }
    }

    // Rapid state hopping (3+ states in 2 years)
    const states = new Set(sorted.map((t) => t.state)).size;
    const timeSpan =
      (new Date(sorted[sorted.length - 1].date).getTime() -
        new Date(sorted[0].date).getTime()) /
      (365 * 24 * 60 * 60 * 1000);

    if (states >= 3 && timeSpan <= 2) {
      fraudScore += 20;
      flags.push(`Rapid state hopping: ${states} states in ${Math.round(timeSpan * 12)} months`);
    }
  }

  // 2. Odometer Rollback Detection
  let odometerRollbackProbability = 0;
  let odometerRollbackDetails: string | undefined;

  if (report.serviceRecords.length >= 2) {
    const sortedServices = [...report.serviceRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sortedServices.length - 1; i++) {
      const current = sortedServices[i];
      const next = sortedServices[i + 1];

      if (next.mileage < current.mileage) {
        const rollback = current.mileage - next.mileage;
        odometerRollbackProbability = Math.min(95, 60 + rollback / 1000);
        odometerRollbackDetails = `Mileage dropped from ${current.mileage.toLocaleString()} to ${next.mileage.toLocaleString()} (${rollback.toLocaleString()} mi rollback)`;
        fraudScore += 35;
        flags.push(`Odometer rollback: ${rollback.toLocaleString()} miles`);
        break;
      }
    }

    // Check for unrealistic mileage gaps
    for (let i = 0; i < sortedServices.length - 1; i++) {
      const current = sortedServices[i];
      const next = sortedServices[i + 1];
      const daysDiff =
        (new Date(next.date).getTime() - new Date(current.date).getTime()) /
        (1000 * 60 * 60 * 24);
      const milesDiff = next.mileage - current.mileage;

      if (daysDiff > 30 && milesDiff / daysDiff > 500) {
        // Over 500 miles/day average
        fraudScore += 10;
        flags.push(`Unrealistic mileage accumulation: ${Math.round(milesDiff / daysDiff)} mi/day`);
        break;
      }
    }
  }

  // If no service records, higher uncertainty for rollback
  if (report.serviceRecords.length < 2) {
    odometerRollbackProbability = Math.max(odometerRollbackProbability, 25);
  }

  // 3. Insurance Total-Loss vs Repairable Decision
  let totalLossDecision: 'total-loss' | 'repairable' | 'uncertain' = 'uncertain';
  let totalLossDetails: string | undefined;

  if (report.accidents.length > 0) {
    const totalLossAccidents = report.accidents.filter(
      (a) => a.severity === 'total-loss' || a.insuranceClaim > report.marketValue.mid * 0.7
    );

    if (totalLossAccidents.length > 0) {
      const worst = totalLossAccidents.reduce((max, a) =>
        a.insuranceClaim > max.insuranceClaim ? a : max
      );

      if (worst.severity === 'total-loss') {
        totalLossDecision = 'total-loss';
        totalLossDetails = `Declared total loss (${worst.insuranceClaim.toLocaleString()} claim vs $${report.marketValue.mid.toLocaleString()} value)`;
        fraudScore += 25;
        flags.push('Insurance declared total loss');
      } else if (worst.insuranceClaim > report.marketValue.mid * 0.7) {
        totalLossDecision = 'total-loss';
        totalLossDetails = `Repair cost ${Math.round((worst.insuranceClaim / report.marketValue.mid) * 100)}% of value — should have been totaled`;
        fraudScore += 20;
        flags.push('Total-loss threshold crossed but not declared');
      } else {
        totalLossDecision = 'repairable';
        totalLossDetails = `Repairable (${Math.round((worst.insuranceClaim / report.marketValue.mid) * 100)}% of value)`;
      }
    } else {
      totalLossDecision = 'repairable';
      totalLossDetails = 'All accidents below total-loss threshold';
    }
  }

  // 4. Additional fraud indicators
  // Title brands that don't match accident history
  if (
    report.titleBrands.includes('salvage') &&
    !report.accidents.some((a) => a.severity === 'total-loss' || a.insuranceClaim > 15000)
  ) {
    fraudScore += 15;
    flags.push('Salvage title without matching major accident');
  }

  // Excessive ownership changes
  if (report.previousOwners > 4) {
    fraudScore += 10;
    flags.push('Excessive ownership turnover');
  }

  // Mismatched paint meter readings
  if (report.paintMeterReadings && report.paintMeterReadings.some((r) => r.flagged)) {
    if (!report.accidents.some((a) => a.severity !== 'minor')) {
      fraudScore += 10;
      flags.push('Bodywork detected without reported accident');
    }
  }

  // Determine risk level
  fraudScore = Math.min(100, Math.round(fraudScore));
  let riskLevel: FraudReport['riskLevel'];
  if (fraudScore >= 60) riskLevel = 'critical';
  else if (fraudScore >= 40) riskLevel = 'high';
  else if (fraudScore >= 20) riskLevel = 'medium';
  else riskLevel = 'low';

  return {
    fraudScore,
    riskLevel,
    titleWashDetected,
    titleWashDetails,
    odometerRollbackProbability,
    odometerRollbackDetails,
    totalLossDecision,
    totalLossDetails,
    flags,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateBulkReports } from '@/lib/mock-engine';
import { calculateVelocity } from '@/lib/velocity-engine';
import { analyzeBulkAcquisitions } from '@/lib/acquisition-engine';
import { SearchType, VehicleReport } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { validateVIN, validatePlate, validateDL, validateState, validateVINs } from '@/lib/validation';
import { deductCredits } from '@/lib/credits';
import { corsHeaders } from '@/lib/cors';
import { enrichReportWithNHTSA } from '@/lib/nhtsa';
import { enrichReportWithVinAudit } from '@/lib/vinaudit';
import { applyRealTitleHistory } from '@/lib/vinaudit-history';
import { calculateFraud } from '@/lib/fraud-engine';

const COST_PER_PULL = 0.5;
// Real-data enrichment is on by default (NHTSA is free + keyless). Set
// DISABLE_NHTSA=1 to force fully deterministic/synthetic reports for demos.
const NHTSA_ENABLED = process.env.DISABLE_NHTSA !== '1';
const MAX_BODY_SIZE = 1024 * 1024; // 1MB

interface MinimalReport {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;
  conditionScore: number;
  titleBrands: string[];
  redFlags: string[];
  marketValue: { low: number; mid: number; high: number };
  accidents: VehicleReport['accidents'];
  tickets: VehicleReport['tickets'];
  serviceRecords: VehicleReport['serviceRecords'];
  transfers: VehicleReport['transfers'];
  registration: VehicleReport['registration'];
  dmvValidation: VehicleReport['dmvValidation'];
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders(req.headers.get('origin')) });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  // Payload size check
  const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: 'Payload too large. Max 1MB.' },
      { status: 413, headers: cors }
    );
  }

  // Rate limiting
  const rateLimit = checkRateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
          ...cors,
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetAt / 1000)),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const { type, value, state, bulk, vins, analyze } = body;

    // Acquisition analysis endpoint
    if (analyze && Array.isArray(vins)) {
      const validation = validateVINs(vins);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: cors });
      }
      const cost = validation.sanitized.length * COST_PER_PULL;
      const creditResult = deductCredits(req, cost, `Bulk analysis: ${validation.sanitized.length} vehicles`);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: 'Insufficient credits', balance: creditResult.balance, cost, message: `Need $${cost.toFixed(2)} for ${validation.sanitized.length} pulls` },
          { status: 402, headers: cors }
        );
      }
      const reports = generateBulkReports(validation.sanitized);
      const successfulReports: MinimalReport[] = reports
        .filter(r => r.status === 'success')
        .map(r => ({
          vin: r.vin,
          make: r.make,
          model: r.model,
          year: r.year,
          color: '',
          bodyType: '',
          conditionScore: r.conditionScore,
          titleBrands: r.titleBrands,
          redFlags: r.redFlags,
          marketValue: { low: Math.round(r.marketValueMid * 0.85), mid: r.marketValueMid, high: Math.round(r.marketValueMid * 1.15) },
          accidents: [],
          tickets: [],
          serviceRecords: [],
          transfers: [],
          registration: { status: r.registrationStatus as VehicleReport['registration']['status'], plateNumber: '', state: '', issueDate: '', expiryDate: '', lastRenewed: '' },
          dmvValidation: { status: 'valid', validatedAt: '', state: '', licenseNumber: '', expiryDate: '', restrictions: [] },
        }));
      const analyses = analyzeBulkAcquisitions(successfulReports as unknown as VehicleReport[]);
      return NextResponse.json(
        { success: true, data: analyses, count: analyses.length, remainingCredits: creditResult.balance },
        { headers: cors }
      );
    }

    // Bulk upload endpoint
    if (bulk && Array.isArray(vins)) {
      const validation = validateVINs(vins);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400, headers: cors });
      }
      const cost = validation.sanitized.length * COST_PER_PULL;
      const creditResult = deductCredits(req, cost, `Bulk lookup: ${validation.sanitized.length} vehicles`);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: 'Insufficient credits', balance: creditResult.balance, cost, message: `Need $${cost.toFixed(2)} for ${validation.sanitized.length} pulls` },
          { status: 402, headers: cors }
        );
      }
      const reports = generateBulkReports(validation.sanitized);
      return NextResponse.json(
        { success: true, data: reports, count: reports.length, remainingCredits: creditResult.balance },
        { headers: cors }
      );
    }

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing type or value' }, { status: 400, headers: cors });
    }

    if (!['vin', 'plate', 'dl'].includes(type)) {
      return NextResponse.json({ error: 'Invalid search type' }, { status: 400, headers: cors });
    }

    // Validate and sanitize inputs
    let sanitizedValue: string;
    let sanitizedState: string | undefined;

    if (type === 'vin') {
      const result = validateVIN(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
      sanitizedValue = result.sanitized;
    } else if (type === 'plate') {
      const result = validatePlate(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
      sanitizedValue = result.sanitized;
    } else {
      const result = validateDL(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
      sanitizedValue = result.sanitized;
    }

    if (state) {
      const result = validateState(state);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400, headers: cors });
      sanitizedState = result.sanitized;
    }

    // Paywall: deduct credits for single lookup
    const creditResult = deductCredits(req, COST_PER_PULL, `Lookup: ${sanitizedValue}`);
    if (!creditResult.success) {
      return NextResponse.json(
        { error: 'Insufficient credits', balance: creditResult.balance, cost: COST_PER_PULL, message: `Need $${COST_PER_PULL} per pull. Current balance: $${creditResult.balance.toFixed(2)}` },
        { status: 402, headers: cors }
      );
    }

    const report = generateReport(type as SearchType, sanitizedValue, sanitizedState);

    // Layer authoritative NHTSA data over the synthetic base for VIN lookups.
    // Plate/DL paths have no VIN to decode, so they stay fully synthetic.
    // enrichReportWithNHTSA never throws — a network/API failure silently
    // leaves the mock report intact.
    if (NHTSA_ENABLED && type === 'vin') {
      // NHTSA first (authoritative make/model/year + recalls), then VinAudit
      // refines with trim/engine/transmission/equipment when a key is present.
      // Both are sequential because VinAudit's powertrain refinement reads the
      // value NHTSA may have set. enrichReportWithVinAudit is a no-op without
      // VINAUDIT_API_KEY, so this stays free until the key is configured.
      await enrichReportWithNHTSA(report);
      await enrichReportWithVinAudit(report);

      // Billable NMVTIS history pull (the user already paid COST_PER_PULL).
      // Returns true only when real title records were applied; in that case
      // re-run fraud scoring so titleWash/odometer analysis reflects real
      // titles + odometer instead of the synthetic ones generateReport set.
      const realHistory = await applyRealTitleHistory(report);
      if (realHistory) {
        report.fraud = calculateFraud(report);
      }
    }

    // Velocity runs AFTER enrichment so it scores real make/model/recalls.
    report.velocity = calculateVelocity(report);
    return NextResponse.json(
      { success: true, data: report, remainingCredits: creditResult.balance },
      { headers: cors }
    );
  } catch (err) {
    console.error('[API/Lookup] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: cors }
    );
  }
}

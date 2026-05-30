import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateBulkReports } from '@/lib/mock-engine';
import { calculateVelocity } from '@/lib/velocity-engine';
import { analyzeBulkAcquisitions } from '@/lib/acquisition-engine';
import { SearchType, VehicleReport } from '@/lib/types';
import { checkRateLimit } from '@/lib/rate-limiter';
import { validateVIN, validatePlate, validateDL, validateState, validateVINs } from '@/lib/validation';
import { deductCredits } from '@/lib/credits';

const COST_PER_PULL = 0.5;

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

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimit = checkRateLimit(req, { windowMs: 60_000, maxRequests: 30 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      {
        status: 429,
        headers: {
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
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      const cost = validation.sanitized.length * COST_PER_PULL;
      const creditResult = deductCredits(req, cost, `Bulk analysis: ${validation.sanitized.length} vehicles`);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: 'Insufficient credits', balance: creditResult.balance, cost, message: `Need $${cost.toFixed(2)} for ${validation.sanitized.length} pulls` },
          { status: 402 }
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
      return NextResponse.json({ success: true, data: analyses, count: analyses.length, remainingCredits: creditResult.balance });
    }

    // Bulk upload endpoint
    if (bulk && Array.isArray(vins)) {
      const validation = validateVINs(vins);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      const cost = validation.sanitized.length * COST_PER_PULL;
      const creditResult = deductCredits(req, cost, `Bulk lookup: ${validation.sanitized.length} vehicles`);
      if (!creditResult.success) {
        return NextResponse.json(
          { error: 'Insufficient credits', balance: creditResult.balance, cost, message: `Need $${cost.toFixed(2)} for ${validation.sanitized.length} pulls` },
          { status: 402 }
        );
      }
      const reports = generateBulkReports(validation.sanitized);
      return NextResponse.json({ success: true, data: reports, count: reports.length, remainingCredits: creditResult.balance });
    }

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });
    }

    if (!['vin', 'plate', 'dl'].includes(type)) {
      return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // Validate and sanitize inputs
    let sanitizedValue: string;
    let sanitizedState: string | undefined;

    if (type === 'vin') {
      const result = validateVIN(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
      sanitizedValue = result.sanitized;
    } else if (type === 'plate') {
      const result = validatePlate(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
      sanitizedValue = result.sanitized;
    } else {
      const result = validateDL(value);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
      sanitizedValue = result.sanitized;
    }

    if (state) {
      const result = validateState(state);
      if (!result.valid) return NextResponse.json({ error: result.error }, { status: 400 });
      sanitizedState = result.sanitized;
    }

    // Paywall: deduct credits for single lookup
    const creditResult = deductCredits(req, COST_PER_PULL, `Lookup: ${sanitizedValue}`);
    if (!creditResult.success) {
      return NextResponse.json(
        { error: 'Insufficient credits', balance: creditResult.balance, cost: COST_PER_PULL, message: `Need $${COST_PER_PULL} per pull. Current balance: $${creditResult.balance.toFixed(2)}` },
        { status: 402 }
      );
    }

    const report = generateReport(type as SearchType, sanitizedValue, sanitizedState);
    report.velocity = calculateVelocity(report);
    return NextResponse.json({ success: true, data: report, remainingCredits: creditResult.balance });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

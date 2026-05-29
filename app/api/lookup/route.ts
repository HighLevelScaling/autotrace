import { NextRequest, NextResponse } from 'next/server';
import { generateReport, generateBulkReports } from '@/lib/mock-engine';
import { analyzeBulkAcquisitions } from '@/lib/acquisition-engine';
import { SearchType } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, value, state, bulk, vins, analyze } = body;

    // Acquisition analysis endpoint
    if (analyze && Array.isArray(vins)) {
      if (vins.length > 1000) {
        return NextResponse.json({ error: 'Maximum 1000 VINs per batch' }, { status: 400 });
      }
      const reports = generateBulkReports(vins.slice(0, 1000));
      const successfulReports = reports
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
          marketValue: { low: r.marketValueMid * 0.85, mid: r.marketValueMid, high: r.marketValueMid * 1.15 },
          accidents: [] as any[],
          tickets: [] as any[],
          serviceRecords: [] as any[],
          transfers: [] as any[],
          registration: { status: r.registrationStatus } as any,
          dmvValidation: { status: 'valid' } as any,
        }));
      const analyses = analyzeBulkAcquisitions(successfulReports as any);
      return NextResponse.json({ success: true, data: analyses, count: analyses.length });
    }

    // Bulk upload endpoint
    if (bulk && Array.isArray(vins)) {
      if (vins.length > 1000) {
        return NextResponse.json({ error: 'Maximum 1000 VINs per batch' }, { status: 400 });
      }
      const reports = generateBulkReports(vins.slice(0, 1000));
      return NextResponse.json({ success: true, data: reports, count: reports.length });
    }

    if (!type || !value) {
      return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });
    }

    if (!['vin', 'plate', 'dl'].includes(type)) {
      return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    const report = generateReport(type as SearchType, value, state);
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    console.error('Lookup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

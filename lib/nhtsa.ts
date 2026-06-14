import type { NHTSAEnrichment, NHTSARecall, VehicleReport } from '@/lib/types';

/**
 * NHTSA public APIs — free, no key, no signup.
 *
 * Two distinct hosts (do not mix):
 *   - VIN decoding:        vpic.nhtsa.dot.gov
 *   - Recalls/safety/etc:  api.nhtsa.gov
 *
 * All calls are server-side only and cached for a day (vehicle facts are
 * static per VIN/model-year). Every function is defensive: on any failure it
 * returns null so callers can fall back to synthetic data.
 */

const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const API = 'https://api.nhtsa.gov';
const DAY = 86_400;

// vPIC returns one flat object per VIN under Results[0]. Fields are strings;
// missing/unknown values come back as "" or "Not Applicable".
interface VpicResult {
  Make: string;
  Model: string;
  ModelYear: string;
  Trim: string;
  BodyClass: string;
  FuelTypePrimary: string;
  EngineCylinders: string;
  DriveType: string;
  PlantCountry: string;
  ErrorCode: string;
}

function clean(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t || /^not applicable$/i.test(t)) return undefined;
  return t;
}

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface DecodedVin {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  bodyClass?: string;
  fuelType?: string;
  engineCylinders?: string;
  driveType?: string;
  plantCountry?: string;
}

export async function decodeVinNHTSA(vin: string, modelYear?: number): Promise<DecodedVin | null> {
  const qs = modelYear ? `?format=json&modelyear=${modelYear}` : '?format=json';
  const data = await getJSON<{ Results: VpicResult[] }>(
    `${VPIC}/DecodeVinValues/${encodeURIComponent(vin)}${qs}`
  );
  const r = data?.Results?.[0];
  if (!r) return null;
  // ErrorCode "0" means a fully successful decode; anything else is partial.
  const make = clean(r.Make);
  const model = clean(r.Model);
  // A VIN that decodes to no make/model is useless — signal failure.
  if (!make && !model) return null;

  const yearNum = clean(r.ModelYear) ? parseInt(r.ModelYear, 10) : undefined;
  return {
    make,
    model,
    year: Number.isFinite(yearNum) ? yearNum : undefined,
    trim: clean(r.Trim),
    bodyClass: clean(r.BodyClass),
    fuelType: clean(r.FuelTypePrimary),
    engineCylinders: clean(r.EngineCylinders),
    driveType: clean(r.DriveType),
    plantCountry: clean(r.PlantCountry),
  };
}

interface RecallApiItem {
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
}

export async function getRecalls(make: string, model: string, modelYear: number): Promise<NHTSARecall[]> {
  const url =
    `${API}/recalls/recallsByVehicle` +
    `?make=${encodeURIComponent(make)}` +
    `&model=${encodeURIComponent(model)}` +
    `&modelYear=${modelYear}`;
  // Note: api.nhtsa.gov uses lowercase `results` (vPIC uses `Results`).
  const data = await getJSON<{ results?: RecallApiItem[] }>(url);
  if (!data?.results) return [];
  return data.results.map((r) => ({
    campaignNumber: r.NHTSACampaignNumber,
    component: r.Component,
    summary: r.Summary,
    consequence: r.Consequence,
    remedy: r.Remedy,
    reportDate: r.ReportReceivedDate,
  }));
}

/**
 * Map NHTSA's free-text fuel type onto the app's powertrain enum.
 * vPIC strings look like: "Gasoline", "Diesel", "Electric",
 * "Flexible Fuel Vehicle (FFV)", "Fuel Cell". Hybrids are usually only
 * detectable via a secondary fuel field, so we treat "Electric" as BEV and
 * leave hybrid/phev detection to the richer (paid) providers later.
 */
function fuelToPowertrain(fuel?: string): VehicleReport['powertrain'] | undefined {
  if (!fuel) return undefined;
  const f = fuel.toLowerCase();
  if (f.includes('electric') || f.includes('fuel cell')) return 'bev';
  if (f.includes('gas') || f.includes('diesel') || f.includes('flex')) return 'ice';
  return undefined;
}

/**
 * Enrich a synthetic VehicleReport in place with authoritative NHTSA data.
 * Returns the same report. Never throws — partial failures simply leave the
 * corresponding mock fields untouched.
 */
export async function enrichReportWithNHTSA(report: VehicleReport): Promise<VehicleReport> {
  const decoded = await decodeVinNHTSA(report.vin, report.year);
  if (!decoded) return report; // total decode failure → keep mock as-is

  // Override synthetic identity with real manufacturer values where present.
  if (decoded.make) report.make = decoded.make;
  if (decoded.model) report.model = decoded.model;
  if (decoded.year) report.year = decoded.year;
  if (decoded.bodyClass) report.bodyType = decoded.bodyClass;

  const powertrain = fuelToPowertrain(decoded.fuelType);
  if (powertrain) report.powertrain = powertrain;

  // Recalls require a resolved make+model+year. Use the real values.
  const recalls =
    decoded.make && decoded.model && decoded.year
      ? await getRecalls(decoded.make, decoded.model, decoded.year)
      : [];

  const enrichment: NHTSAEnrichment = {
    source: 'nhtsa-vpic',
    decodedAt: new Date().toISOString(),
    trim: decoded.trim,
    bodyClass: decoded.bodyClass,
    fuelType: decoded.fuelType,
    engineCylinders: decoded.engineCylinders,
    driveType: decoded.driveType,
    plantCountry: decoded.plantCountry,
    recalls,
    recallCount: recalls.length,
  };
  report.nhtsa = enrichment;

  // Surface open recalls as red flags so existing UI/engines react to them.
  if (recalls.length > 0) {
    report.redFlags = [
      ...report.redFlags,
      `${recalls.length} open NHTSA recall${recalls.length > 1 ? 's' : ''}`,
    ];
  }
  return report;
}

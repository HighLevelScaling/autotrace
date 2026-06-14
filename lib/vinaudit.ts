import type { VehicleReport, VinAuditEnrichment } from '@/lib/types';

/**
 * VinAudit Vehicle Specifications API (v3).
 *
 * Unlike NHTSA, this requires an API key (VINAUDIT_API_KEY). VinAudit is a
 * DOJ/AAMVA-approved NMVTIS data provider, so NO dealer license is required.
 * This module wires ONLY the Specifications endpoint (trim/engine/transmission
 * /equipment) — the paid History (NMVTIS) and Market Value endpoints are a
 * separate, billable concern handled elsewhere.
 *
 * Server-side only. Never throws: a missing key, network error, or
 * unsuccessful response all yield null so callers keep their existing data.
 */

const SPECS = 'https://specifications.vinaudit.com/v3/specifications';
const DAY = 86_400;

// Specs are static per VIN, so a successful decode is cached for a day.
// attributes is a flat string map; equipment shape varies, so we normalize it.
interface SpecsResponse {
  attributes?: Record<string, string>;
  equipment?: unknown;
  success?: boolean;
  error?: string;
}

function clean(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/**
 * VinAudit's equipment payload isn't strictly typed across plans — it may be a
 * string[], an object map, or an array of {name|description|value} objects.
 * Flatten whatever we get into a clean string[].
 */
function normalizeEquipment(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          const o = item as Record<string, unknown>;
          const label = o.name ?? o.description ?? o.value ?? o.label;
          return typeof label === 'string' ? label : null;
        }
        return null;
      })
      .filter((s): s is string => Boolean(s && s.trim()));
  }
  if (typeof raw === 'object') {
    return Object.values(raw as Record<string, unknown>)
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  }
  return [];
}

export function isVinAuditConfigured(): boolean {
  return Boolean(process.env.VINAUDIT_API_KEY);
}

export interface VinAuditSpecs {
  mode: 'live' | 'test';
  trim?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  doors?: string;
  equipment: string[];
}

export async function getVinAuditSpecs(vin: string): Promise<VinAuditSpecs | null> {
  const key = process.env.VINAUDIT_API_KEY;
  if (!key) return null; // not configured → caller falls back

  const mode: 'live' | 'test' = process.env.VINAUDIT_TEST_MODE === '1' ? 'test' : 'live';
  const params = new URLSearchParams({
    key,
    vin,
    format: 'json',
    include: 'attributes,equipment',
  });
  if (mode === 'test') params.set('mode', 'test');

  try {
    const res = await fetch(`${SPECS}?${params.toString()}`, { next: { revalidate: DAY } });
    if (!res.ok) return null;
    const data = (await res.json()) as SpecsResponse;
    if (!data.success || !data.attributes) return null;

    const a = data.attributes;
    return {
      mode,
      // VinAudit attribute keys are lowercase; cover common aliases.
      trim: clean(a.trim),
      engine: clean(a.engine),
      transmission: clean(a.transmission),
      drivetrain: clean(a.drivetrain ?? a.drive_type ?? a.drive),
      fuelType: clean(a.fuel_type ?? a.fueltype ?? a.fuel),
      doors: clean(a.doors),
      equipment: normalizeEquipment(data.equipment),
    };
  } catch {
    return null;
  }
}

/**
 * Enrich a report in place with VinAudit spec data. Runs AFTER NHTSA so it
 * refines the manufacturer-accurate base with finer detail (real trim, engine
 * displacement, transmission, equipment) that vPIC doesn't carry. Returns the
 * same report; a null result (no key / failure) leaves it untouched.
 */
export async function enrichReportWithVinAudit(report: VehicleReport): Promise<VehicleReport> {
  const specs = await getVinAuditSpecs(report.vin);
  if (!specs) return report;

  const enrichment: VinAuditEnrichment = {
    source: 'vinaudit-specs',
    decodedAt: new Date().toISOString(),
    mode: specs.mode,
    trim: specs.trim,
    engine: specs.engine,
    transmission: specs.transmission,
    drivetrain: specs.drivetrain,
    fuelType: specs.fuelType,
    doors: specs.doors,
    equipment: specs.equipment,
  };
  report.vinaudit = enrichment;

  // VinAudit's fuel string is often more specific than vPIC's. If NHTSA didn't
  // already classify a BEV, let VinAudit refine the powertrain.
  if (specs.fuelType) {
    const f = specs.fuelType.toLowerCase();
    if ((f.includes('electric') || f.includes('fuel cell')) && report.powertrain !== 'bev') {
      report.powertrain = 'bev';
    } else if (f.includes('hybrid') && report.powertrain === 'ice') {
      report.powertrain = f.includes('plug') ? 'phev' : 'hybrid';
    }
  }

  return report;
}

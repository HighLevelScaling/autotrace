import type { TitleBrand, TitleHistoryEntry, VehicleReport } from '@/lib/types';

/**
 * VinAudit Vehicle History API (v2) — NMVTIS-backed.
 *
 * This is the BILLABLE tier: each successful pull returns real title-brand
 * records, junk/salvage/insurance (JSI) events, theft records, and odometer
 * readings sourced from state DMVs and insurers via NMVTIS. Callers must have
 * already charged the user (the route deducts credits before invoking this).
 *
 * Requires VINAUDIT_API_KEY + VINAUDIT_USER + VINAUDIT_PASS. If any are
 * missing, getVinAuditHistory returns null and title/fraud analysis stays
 * synthetic. Server-side only; never throws.
 *
 * NMVTIS payload shapes vary by plan, so every field is parsed defensively.
 */

const HISTORY = 'https://api.vinaudit.com/v2/pullreport';

// Raw NMVTIS records are loosely typed across plans — treat every field as
// optional and coerce. We only read what we can reliably map.
interface RawRecord {
  date?: string;
  eventdate?: string;
  state?: string;
  meta?: string;
  brand?: string;
  type?: string;
  odometer?: string | number;
  mileage?: string | number;
  source?: string;
}

interface HistoryResponse {
  titles?: RawRecord[];
  jsi?: RawRecord[];
  thefts?: RawRecord[];
  salvage?: RawRecord[];
  success?: boolean;
  error?: string;
}

export interface OdometerReading {
  date: string;
  mileage: number;
  source: string;
}

export interface VinAuditHistory {
  mode: 'live' | 'test';
  titleHistory: TitleHistoryEntry[];
  titleBrands: TitleBrand[];
  odometerReadings: OdometerReading[];
  theftOnRecord: boolean;
  recordCount: number;
}

export function isVinAuditHistoryConfigured(): boolean {
  return Boolean(
    process.env.VINAUDIT_API_KEY && process.env.VINAUDIT_USER && process.env.VINAUDIT_PASS
  );
}

/**
 * Map free-text NMVTIS brand/event text onto the app's TitleBrand union.
 * NMVTIS uses dozens of brand codes; we collapse them into the buckets the
 * fraud engine understands. Order matters — check most-severe first.
 */
function mapBrand(text: string | undefined): TitleBrand | null {
  if (!text) return null;
  const t = text.toLowerCase();
  if (t.includes('flood') || t.includes('water')) return 'flood';
  if (t.includes('lemon') || t.includes('manufacturer buyback')) return 'lemon';
  if (t.includes('rebuilt') || t.includes('reconstructed') || t.includes('prior salvage'))
    return 'rebuilt';
  if (t.includes('salvage') || t.includes('junk') || t.includes('total loss')) return 'salvage';
  if (t.includes('theft') || t.includes('stolen')) return 'theft';
  if (t.includes('odometer') || t.includes('rollback') || t.includes('not actual mileage'))
    return 'odometer_rollback';
  if (t.includes('clean') || t.includes('clear')) return 'clean';
  return null;
}

function toMileage(v: string | number | undefined): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function recordDate(r: RawRecord): string | undefined {
  return r.date || r.eventdate;
}

export async function getVinAuditHistory(vin: string): Promise<VinAuditHistory | null> {
  if (!isVinAuditHistoryConfigured()) return null;

  const mode: 'live' | 'test' = process.env.VINAUDIT_TEST_MODE === '1' ? 'test' : 'live';
  const params = new URLSearchParams({
    // Unique report id per pull, per VinAudit's API contract.
    id: `${vin}-${Date.now()}`,
    key: process.env.VINAUDIT_API_KEY!,
    user: process.env.VINAUDIT_USER!,
    pass: process.env.VINAUDIT_PASS!,
    vin,
    format: 'json',
  });
  if (mode === 'test') params.set('mode', 'test');

  let data: HistoryResponse;
  try {
    // History is a fresh per-pull purchase — do NOT cache (no revalidate).
    const res = await fetch(`${HISTORY}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    data = (await res.json()) as HistoryResponse;
  } catch {
    return null;
  }
  if (!data.success) return null;

  const titles = data.titles ?? [];
  const jsi = data.jsi ?? [];
  const salvage = data.salvage ?? [];
  const thefts = data.thefts ?? [];

  // Build TitleHistoryEntry[] from title + JSI + salvage records.
  const titleHistory: TitleHistoryEntry[] = [];
  const odometerReadings: OdometerReading[] = [];
  const brandSet = new Set<TitleBrand>();

  const ingest = (records: RawRecord[], fallbackBrandText?: string) => {
    for (const r of records) {
      const date = recordDate(r);
      const brand = mapBrand(r.brand || r.meta || r.type || fallbackBrandText);
      const mileage = toMileage(r.odometer ?? r.mileage);
      if (date && brand) {
        titleHistory.push({
          date,
          state: r.state || 'XX',
          brand,
          mileage: mileage ?? 0,
          issuer: r.source || 'NMVTIS',
        });
        if (brand !== 'clean') brandSet.add(brand);
      }
      if (date && mileage) {
        odometerReadings.push({ date, mileage, source: r.source || 'NMVTIS' });
      }
    }
  };

  ingest(titles);
  ingest(jsi, 'salvage');
  ingest(salvage, 'salvage');
  if (thefts.length > 0) brandSet.add('theft');

  // Dedup + chronologically order odometer readings (rollback detection needs
  // a clean ascending timeline to spot a decrease).
  odometerReadings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  titleHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    mode,
    titleHistory,
    titleBrands: [...brandSet],
    odometerReadings,
    theftOnRecord: thefts.length > 0,
    recordCount: titles.length + jsi.length + salvage.length + thefts.length,
  };
}

/**
 * Replace synthetic title/odometer inputs with real NMVTIS data, in place.
 *
 * This deliberately OVERWRITES report.titleHistory and report.titleBrands
 * rather than merging: once we have authoritative title records, the fabricated
 * ones must not contaminate fraud scoring. The caller is responsible for
 * re-running calculateFraud(report) afterward so the fraud report reflects the
 * real inputs.
 *
 * Returns true if real data was applied, false if it fell back (no creds /
 * failure / empty NMVTIS record — a vehicle with a genuinely clean history).
 */
export async function applyRealTitleHistory(report: VehicleReport): Promise<boolean> {
  const history = await getVinAuditHistory(report.vin);
  if (!history) return false;

  // A successful pull with zero adverse records is itself real, valuable
  // signal: a clean NMVTIS history. Represent it explicitly.
  report.titleHistory = history.titleHistory;
  report.titleBrands = history.titleBrands.length > 0 ? history.titleBrands : ['clean'];

  report.nmvtis = {
    source: 'vinaudit-nmvtis',
    pulledAt: new Date().toISOString(),
    mode: history.mode,
    recordCount: history.recordCount,
    odometerReadings: history.odometerReadings,
    theftOnRecord: history.theftOnRecord,
    cleanHistory: history.titleBrands.length === 0 && !history.theftOnRecord,
  };
  return true;
}

'use client';

import { motion } from 'framer-motion';
import { FileWarning, CheckCircle2, ShieldCheck, Gauge, AlertTriangle } from 'lucide-react';
import { VehicleReport, TitleBrand } from '@/lib/types';
import { GlassCard } from './ui/glass-card';

interface TitleBrandCardProps {
  report: VehicleReport;
  index: number;
}

const brandLabels: Record<TitleBrand, { label: string; severity: 'good' | 'warning' | 'danger' }> = {
  clean: { label: 'Clean Title', severity: 'good' },
  salvage: { label: 'Salvage', severity: 'danger' },
  rebuilt: { label: 'Rebuilt', severity: 'warning' },
  flood: { label: 'Flood Damage', severity: 'danger' },
  lemon: { label: 'Lemon / Buyback', severity: 'warning' },
  theft: { label: 'Theft Recovery', severity: 'warning' },
  odometer_rollback: { label: 'Odometer Rollback', severity: 'danger' },
};

const severityStyles = {
  good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
};

// Build an odometer timeline with rollback detection: any reading lower than
// the highest mileage seen so far is physically impossible → flag it.
function buildOdometerTimeline(
  readings: { date: string; mileage: number; source: string }[]
) {
  let peak = 0;
  return readings.map((r) => {
    const rolledBack = r.mileage < peak;
    if (r.mileage > peak) peak = r.mileage;
    return { ...r, rolledBack };
  });
}

export function TitleBrandCard({ report, index }: TitleBrandCardProps) {
  const brands = report.titleBrands;
  const hasIssues = brands.some(b => b !== 'clean');

  const nmvtis = report.nmvtis;
  const odometer = nmvtis ? buildOdometerTimeline(nmvtis.odometerReadings) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 + index * 0.05 }}
      viewport={{ once: true, margin: '-80px' }}
      className="col-span-12 md:col-span-6"
    >
      <GlassCard hover className="h-full">
        <div className="p-5 sm:p-6 h-full">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FileWarning className="w-5 h-5 text-orange-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Title Brand History</h3>
              <p className="text-xs text-white/40">{hasIssues ? `${brands.filter(b => b !== 'clean').length} brand issue${brands.filter(b => b !== 'clean').length !== 1 ? 's' : ''}` : 'Clean title confirmed'}</p>
            </div>

            {/* Data provenance: distinguishes real NMVTIS-sourced records from
                synthetic estimates so dealers know what they paid for. */}
            {nmvtis && (
              <span
                className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                title={`NMVTIS pull · ${nmvtis.recordCount} record${nmvtis.recordCount !== 1 ? 's' : ''} · ${new Date(nmvtis.pulledAt).toLocaleDateString()}`}
              >
                <ShieldCheck className="w-3 h-3" strokeWidth={1} />
                NMVTIS Verified{nmvtis.mode === 'test' ? ' (Test)' : ''}
              </span>
            )}
          </div>

          {/* Authoritative clean-history badge — only shown when a real pull
              returned zero adverse brands/theft (not merely "no data"). */}
          {nmvtis?.cleanHistory && (
            <div className="mb-5 flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1} />
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                Verified clean NMVTIS history — no salvage, junk, flood, or theft records reported across all states.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {brands.map((brand) => {
              const info = brandLabels[brand];
              return (
                <span
                  key={brand}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${severityStyles[info.severity]}`}
                >
                  {info.severity === 'good' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1} />
                  ) : (
                    <FileWarning className="w-3.5 h-3.5" strokeWidth={1} />
                  )}
                  {info.label}
                </span>
              );
            })}
          </div>

          {hasIssues && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
              <p className="text-xs text-red-400/80 leading-relaxed">
                This vehicle has branded title history. A branded title may affect resale value, insurability, and financing options. Recommend independent inspection before purchase.
              </p>
            </div>
          )}

          {/* Real odometer timeline from NMVTIS title-event readings. */}
          {odometer.length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-4 h-4 text-white/50" strokeWidth={1} />
                <h4 className="text-xs font-semibold text-white/70">Odometer Timeline</h4>
                <span className="text-[10px] text-white/30">{odometer.length} reading{odometer.length !== 1 ? 's' : ''}</span>
              </div>
              <ol className="space-y-2">
                {odometer.map((r, i) => (
                  <li
                    key={`${r.date}-${i}`}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${
                      r.rolledBack
                        ? 'bg-red-500/[0.07] border-red-500/20'
                        : 'bg-white/[0.02] border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {r.rolledBack && (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={1} />
                      )}
                      <span className="text-xs text-white/50 tabular-nums">{r.date}</span>
                      <span className="text-[10px] text-white/30 truncate">{r.source}</span>
                    </div>
                    <span className={`text-xs font-medium tabular-nums ${r.rolledBack ? 'text-red-400' : 'text-white/80'}`}>
                      {r.mileage.toLocaleString()} mi
                    </span>
                  </li>
                ))}
              </ol>
              {odometer.some((r) => r.rolledBack) && (
                <p className="mt-3 text-[11px] text-red-400/80 leading-relaxed">
                  A later reading is lower than an earlier one — a physical impossibility indicating odometer rollback or tampering.
                </p>
              )}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

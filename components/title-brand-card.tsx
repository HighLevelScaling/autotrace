'use client';

import { motion } from 'framer-motion';
import { FileWarning, CheckCircle2 } from 'lucide-react';
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

export function TitleBrandCard({ report, index }: TitleBrandCardProps) {
  const brands = report.titleBrands;
  const hasIssues = brands.some(b => b !== 'clean');

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
          </div>

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
        </div>
      </GlassCard>
    </motion.div>
  );
}

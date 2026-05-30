'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { GlassCard } from './ui/glass-card';

interface RedFlagsBannerProps {
  report: VehicleReport;
}

export function RedFlagsBanner({ report }: RedFlagsBannerProps) {
  const flags = report.redFlags;

  if (flags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        viewport={{ once: true, margin: '-80px' }}
        className="col-span-12"
      >
        <GlassCard>
          <div className="p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">No Red Flags Detected</h3>
              <p className="text-xs text-emerald-400/60 mt-0.5">This vehicle has a clean history with no major concerns identified.</p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      className="col-span-12"
    >
      <GlassCard innerClassName="rounded-[calc(2rem-0.375rem)] bg-red-500/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-400">
                {flags.length} Red Flag{flags.length !== 1 ? 's' : ''} Detected
              </h3>
              <p className="text-xs text-red-400/60 mt-0.5">Review carefully before purchase or financing.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20"
              >
                <AlertTriangle className="w-3 h-3" strokeWidth={1} />
                {flag}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

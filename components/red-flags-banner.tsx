'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { VehicleReport } from '@/lib/types';

interface RedFlagsBannerProps {
  report: VehicleReport;
}

export function RedFlagsBanner({ report }: RedFlagsBannerProps) {
  const flags = report.redFlags;

  if (flags.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="col-span-12"
      >
        <div className="p-1.5 rounded-[2rem] glass-card">
          <div className="rounded-[calc(2rem-0.375rem)] bg-emerald-500/5 border border-emerald-500/10 p-4 sm:p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-400">No Red Flags Detected</h3>
              <p className="text-xs text-emerald-400/60 mt-0.5">This vehicle has a clean history with no major concerns identified.</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="col-span-12"
    >
      <div className="p-1.5 rounded-[2rem] glass-card">
        <div className="rounded-[calc(2rem-0.375rem)] bg-red-500/5 border border-red-500/10 p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1.5} />
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
                <AlertTriangle className="w-3 h-3" />
                {flag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

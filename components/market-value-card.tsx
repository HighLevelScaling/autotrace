'use client';

import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { GlassCard } from './ui/glass-card';

interface MarketValueCardProps {
  report: VehicleReport;
  index: number;
}

export function MarketValueCard({ report, index }: MarketValueCardProps) {
  const { low, mid, high } = report.marketValue;

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
              <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Market Value Estimate</h3>
              <p className="text-xs text-white/40">Based on condition & history</p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-white/40" strokeWidth={1} />
            <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {mid.toLocaleString()}
            </span>
            <span className="text-sm text-white/40">estimated</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/40">Range</span>
                <span className="text-white/80">${low.toLocaleString()} — ${high.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-400 via-amber-400 to-emerald-400 relative">
                  <div
                    className="absolute top-0 w-1 h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    style={{ left: `${((mid - low) / (high - low)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-red-400/60">Wholesale</span>
                <span className="text-[10px] text-emerald-400/60">Retail</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
              <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-white/25 uppercase tracking-wider">Low</p>
                <p className="text-sm font-semibold text-white/40 mt-0.5">${low.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.03] border border-white/10">
                <p className="text-[10px] text-white/25 uppercase tracking-wider">Mid</p>
                <p className="text-sm font-semibold text-white/80 mt-0.5">${mid.toLocaleString()}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-white/[0.03]">
                <p className="text-[10px] text-white/25 uppercase tracking-wider">High</p>
                <p className="text-sm font-semibold text-white/40 mt-0.5">${high.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

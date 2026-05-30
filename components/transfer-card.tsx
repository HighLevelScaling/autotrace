'use client';

import { motion } from 'framer-motion';
import { ArrowRightLeft, Calendar, Gauge } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { GlassCard } from './ui/glass-card';

interface TransferCardProps {
  report: VehicleReport;
  index: number;
}

export function TransferCard({ report, index }: TransferCardProps) {
  const transfers = report.transfers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 + index * 0.05 }}
      viewport={{ once: true, margin: '-80px' }}
      className="col-span-12 md:col-span-4"
    >
      <GlassCard hover className="h-full">
        <div className="p-5 sm:p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-blue-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Transfer History</h3>
              <p className="text-xs text-white/40">{transfers.length} ownership change{transfers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {transfers.map((transfer, i) => (
              <div key={i} className="relative pl-5">
                {i < transfers.length - 1 && (
                  <div className="absolute left-[7px] top-6 bottom-[-12px] w-px bg-white/10" />
                )}
                <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white/10 border-2 border-white/20" />
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={transfer.type} />
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1} />
                      {transfer.date}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-white/40">{transfer.from}</span>
                    <span className="text-white/20 mx-2">→</span>
                    <span className="text-white/80">{transfer.to}</span>
                  </div>
                  <div className="mt-1 text-xs text-white/40 flex items-center gap-1">
                    <Gauge className="w-3 h-3" strokeWidth={1} />
                    {transfer.mileage.toLocaleString()} mi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

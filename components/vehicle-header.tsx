'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { ConditionScoreBadge } from './condition-score-badge';

interface VehicleHeaderProps {
  report: VehicleReport;
}

export function VehicleHeader({ report }: VehicleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="col-span-12"
    >
      <div className="p-1.5 rounded-[2rem] glass-card">
        <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Car className="w-7 h-7 sm:w-8 sm:h-8 text-white/60" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {report.year} {report.make} {report.model}
              </h1>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/50">
                <span>VIN: <span className="text-white/70 font-mono">{report.vin}</span></span>
                <span>Color: <span className="text-white/70">{report.color}</span></span>
                <span>Body: <span className="text-white/70">{report.bodyType}</span></span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ConditionScoreBadge score={report.conditionScore} size="md" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

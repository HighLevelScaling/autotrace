'use client';

import { motion } from 'framer-motion';
import { Car } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { ConditionScoreBadge } from './condition-score-badge';
import { GlassCard } from './ui/glass-card';

interface VehicleHeaderProps {
  report: VehicleReport;
}

export function VehicleHeader({ report }: VehicleHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      className="col-span-12"
    >
      <GlassCard>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Car className="w-7 h-7 sm:w-8 sm:h-8 text-white/40" strokeWidth={1} />
            </div>
            <div className="flex-1 min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
                viewport={{ once: true, margin: '-80px' }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
              >
                {report.year} {report.make} {report.model}
              </motion.h1>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/40">
                <span>VIN: <span className="text-white/80 font-mono">{report.vin}</span></span>
                <span>Color: <span className="text-white/80">{report.color}</span></span>
                <span>Body: <span className="text-white/80">{report.bodyType}</span></span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ConditionScoreBadge score={report.conditionScore} size="lg" />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

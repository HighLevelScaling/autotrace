'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { GlassCard } from './ui/glass-card';

interface DMVCardProps {
  report: VehicleReport;
  index: number;
}

export function DMVCard({ report, index }: DMVCardProps) {
  const dmv = report.dmvValidation;

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
              <ShieldCheck className="w-5 h-5 text-indigo-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">DMV Validation</h3>
              <p className="text-xs text-white/40">Driver&apos;s License Status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Status</span>
              <StatusBadge status={dmv.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">License #</span>
              <span className="text-sm font-mono text-white/80">{dmv.licenseNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">State</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                <span className="text-sm text-white/80">{dmv.state}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Valid Until</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                <span className="text-sm text-white/80">{dmv.expiryDate}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Last Validated</span>
              <span className="text-sm text-white/80">{dmv.validatedAt}</span>
            </div>
            {dmv.restrictions.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" strokeWidth={1} />
                  <div>
                    <span className="text-xs text-white/40">Restrictions:</span>
                    <p className="text-xs text-amber-400/80 mt-0.5">{dmv.restrictions.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { FileCheck, Calendar, MapPin } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { GlassCard } from './ui/glass-card';

interface RegistrationCardProps {
  report: VehicleReport;
  index: number;
}

export function RegistrationCard({ report, index }: RegistrationCardProps) {
  const reg = report.registration;

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
              <FileCheck className="w-5 h-5 text-emerald-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Registration</h3>
              <p className="text-xs text-white/40">Vehicle Registration Status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Status</span>
              <StatusBadge status={reg.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Plate #</span>
              <span className="text-sm font-mono text-white/80">{reg.plateNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">State</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                <span className="text-sm text-white/80">{reg.state}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Issued</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                <span className="text-sm text-white/80">{reg.issueDate}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Expires</span>
              <span className="text-sm text-white/80">{reg.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Last Renewed</span>
              <span className="text-sm text-white/80">{reg.lastRenewed}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

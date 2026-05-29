'use client';

import { motion } from 'framer-motion';
import { FileCheck, Calendar, MapPin } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';

interface RegistrationCardProps {
  report: VehicleReport;
  index: number;
}

export function RegistrationCard({ report, index }: RegistrationCardProps) {
  const reg = report.registration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 + index * 0.05 }}
      className="col-span-12 md:col-span-6"
    >
      <div className="p-1.5 rounded-[2rem] glass-card h-full">
        <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-5 sm:p-6 h-full">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90">Registration</h3>
              <p className="text-xs text-white/40">Vehicle Registration Status</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Status</span>
              <StatusBadge status={reg.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Plate #</span>
              <span className="text-sm font-mono text-white/80">{reg.plateNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">State</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/30" />
                <span className="text-sm text-white/80">{reg.state}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Issued</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-white/30" />
                <span className="text-sm text-white/80">{reg.issueDate}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Expires</span>
              <span className="text-sm text-white/80">{reg.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/50">Last Renewed</span>
              <span className="text-sm text-white/80">{reg.lastRenewed}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

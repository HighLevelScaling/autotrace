'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Calendar, DollarSign, ShieldAlert, Activity } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { GlassCard } from './ui/glass-card';

interface AccidentCardProps {
  report: VehicleReport;
  index: number;
}

export function AccidentCard({ report, index }: AccidentCardProps) {
  const accidents = report.accidents;

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
              <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Accident History</h3>
              <p className="text-xs text-white/40">{accidents.length} incident{accidents.length !== 1 ? 's' : ''} reported</p>
            </div>
          </div>

          {accidents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-white/25">No accidents on record</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-thin space-y-3 pr-1">
              {accidents.map((accident, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={accident.severity} />
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1} />
                      {accident.date}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/40">{accident.description}</p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" strokeWidth={1} />
                      {accident.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" strokeWidth={1} />
                      ${accident.damageEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-3">
                    <span className={`flex items-center gap-1 text-xs ${accident.airbagDeployed ? 'text-red-400/70' : 'text-white/25'}`}>
                      <ShieldAlert className="w-3 h-3" strokeWidth={1} />
                      Airbag {accident.airbagDeployed ? 'Deployed' : 'OK'}
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${accident.injuries ? 'text-red-400/70' : 'text-white/25'}`}>
                      <Activity className="w-3 h-3" strokeWidth={1} />
                      {accident.injuries ? 'Injuries Reported' : 'No Injuries'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

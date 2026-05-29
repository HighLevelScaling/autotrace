'use client';

import { motion } from 'framer-motion';
import { Wrench, Calendar, Gauge, DollarSign, Store } from 'lucide-react';
import { VehicleReport } from '@/lib/types';

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Oil Change',
  inspection: 'Inspection',
  tire_rotation: 'Tire Rotation',
  brake_service: 'Brake Service',
  transmission: 'Transmission',
  engine_repair: 'Engine Repair',
  body_work: 'Body Work',
  other: 'Maintenance',
};

interface ServiceCardProps {
  report: VehicleReport;
  index: number;
}

export function ServiceCard({ report, index }: ServiceCardProps) {
  const records = report.serviceRecords;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 + index * 0.05 }}
      className="col-span-12"
    >
      <div className="p-1.5 rounded-[2rem] glass-card">
        <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/90">Service History</h3>
              <p className="text-xs text-white/40">{records.length} maintenance record{records.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Date</th>
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Mileage</th>
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Service</th>
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:table-cell">Description</th>
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Provider</th>
                  <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {records.map((record, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 text-sm text-white/70">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white/20" />
                        {record.date}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-white/70">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-white/20" />
                        {record.mileage.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/70 border border-white/10">
                        {serviceTypeLabels[record.type]}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-white/50 hidden sm:table-cell">{record.description}</td>
                    <td className="py-3 text-sm text-white/50 hidden md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-white/20" />
                        {record.provider}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-white/70 text-right">
                      <span className="flex items-center justify-end gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-white/20" />
                        {record.cost.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

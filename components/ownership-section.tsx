'use client';

import { motion } from 'framer-motion';
import { VehicleReport } from '@/lib/types';
import { Users, Key, Clock, BookOpen, Paintbrush } from 'lucide-react';

interface OwnershipSectionProps {
  report: VehicleReport;
}

export function OwnershipSection({ report }: OwnershipSectionProps) {
  const flaggedPanels = report.paintMeterReadings
    ? report.paintMeterReadings.filter((r) => r.flagged).length
    : 0;

  return (
    <div className="col-span-12">
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-indigo-400" strokeWidth={1} />
            <div>
              <h3 className="text-white font-semibold text-lg tracking-tight">
                Ownership & Market Context
              </h3>
              <p className="text-white/40 text-sm">Key details affecting resale value</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <InfoCard
              icon={<Users className="w-4 h-4" strokeWidth={1} />}
              label="Previous Owners"
              value={String(report.previousOwners)}
              sub={
                report.previousOwners === 1
                  ? 'Single owner'
                  : report.previousOwners > 3
                    ? 'High turnover'
                    : 'Normal'
              }
              status={report.previousOwners === 1 ? 'good' : report.previousOwners > 3 ? 'bad' : 'neutral'}
            />
            <InfoCard
              icon={<Key className="w-4 h-4" strokeWidth={1} />}
              label="Keys Included"
              value={String(report.keysIncluded)}
              sub={
                report.keysIncluded >= 2
                  ? 'Full set'
                  : report.keysIncluded === 1
                    ? 'Single key'
                    : 'Missing'
              }
              status={report.keysIncluded >= 2 ? 'good' : report.keysIncluded === 0 ? 'bad' : 'neutral'}
            />
            <InfoCard
              icon={<Clock className="w-4 h-4" strokeWidth={1} />}
              label="Avg Days on Lot"
              value={`${report.averageDaysOnLot}d`}
              sub="Segment average"
              status="neutral"
            />
            <InfoCard
              icon={<BookOpen className="w-4 h-4" strokeWidth={1} />}
              label="Wholesale Book"
              value={`$${report.wholesaleBook.toLocaleString()}`}
              sub="Auction estimate"
              status="neutral"
            />
            <InfoCard
              icon={<Paintbrush className="w-4 h-4" strokeWidth={1} />}
              label="Paint Meter"
              value={report.paintMeterReadings ? `${flaggedPanels} flagged` : 'No data'}
              sub={
                report.paintMeterReadings && flaggedPanels > 0
                  ? 'Bodywork detected'
                  : 'Clean readings'
              }
              status={flaggedPanels > 0 ? 'bad' : 'good'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  sub,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  status: 'good' | 'bad' | 'neutral';
}) {
  const dotColor =
    status === 'good' ? 'bg-emerald-400' : status === 'bad' ? 'bg-rose-400' : 'bg-white/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="text-white/40">{icon}</div>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className="text-white font-semibold text-lg">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
      <div className="text-white/25 text-[11px] mt-1">{sub}</div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { BatteryReport } from '@/lib/types';
import { Battery, BatteryCharging, BatteryWarning, Thermometer, Gauge, Shield, RefreshCw, Zap } from 'lucide-react';

interface BatterySectionProps {
  battery: BatteryReport;
  make: string;
  model: string;
}

export function BatterySection({ battery, make, model }: BatterySectionProps) {
  const gradeColor =
    battery.grade === 'A'
      ? 'text-emerald-400'
      : battery.grade === 'B'
        ? 'text-blue-400'
        : battery.grade === 'C'
          ? 'text-amber-400'
          : 'text-rose-400';

  const gradeBg =
    battery.grade === 'A'
      ? 'bg-emerald-500/10'
      : battery.grade === 'B'
        ? 'bg-blue-500/10'
        : battery.grade === 'C'
          ? 'bg-amber-500/10'
          : 'bg-rose-500/10';

  return (
    <div className="col-span-12">
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Battery className="w-5 h-5 text-emerald-400" strokeWidth={1} />
              <div>
                <h3 className="text-white font-semibold text-lg tracking-tight">Battery Health Report</h3>
                <p className="text-white/40 text-sm">{make} {model} — {battery.oemDataSource}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${gradeBg} flex items-center justify-center`}>
                <span className={`text-xl font-bold ${gradeColor}`}>{battery.grade}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white tracking-tight">{battery.stateOfHealth}%</span>
                <span className={`text-[11px] font-semibold uppercase tracking-widest ${gradeColor}`}>
                  State of Health
                </span>
              </div>
            </div>
          </div>

          {/* Main stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<Gauge className="w-4 h-4" strokeWidth={1} />}
              label="Current Range"
              value={`${battery.currentRange} mi`}
              sub={`EPA adjusted`}
            />
            <StatCard
              icon={<RefreshCw className="w-4 h-4" strokeWidth={1} />}
              label="Range at 100k mi"
              value={`${battery.projectedRange100k} mi`}
              sub={`Projected`}
            />
            <StatCard
              icon={<BatteryCharging className="w-4 h-4" strokeWidth={1} />}
              label="Charge Cycles"
              value={battery.chargeCycles.toLocaleString()}
              sub={`Estimated`}
            />
            <StatCard
              icon={<BatteryWarning className="w-4 h-4" strokeWidth={1} />}
              label="Degradation"
              value={`${battery.degradationRate}% / 10k`}
              sub={`Rate`}
            />
          </div>

          {/* Warranty & Climate row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <DetailCard
              icon={<Shield className="w-4 h-4" strokeWidth={1} />}
              label="Warranty Status"
              status={battery.warrantyTransferable ? 'good' : 'bad'}
              value={battery.warrantyTransferable ? 'Transferable' : 'Non-transferable'}
              sub={`${battery.warrantyMonthsRemaining} months / ${battery.warrantyMilesRemaining.toLocaleString()} mi remaining · Transfer score: ${battery.warrantyTransferScore}/100`}
            />
            <DetailCard
              icon={<Thermometer className="w-4 h-4" strokeWidth={1} />}
              label="Climate Impact"
              status={
                battery.climateImpact === 'minimal'
                  ? 'good'
                  : battery.climateImpact === 'moderate'
                    ? 'medium'
                    : 'bad'
              }
              value={battery.climateImpact.charAt(0).toUpperCase() + battery.climateImpact.slice(1)}
              sub={
                battery.climateImpact === 'minimal'
                  ? 'Minimal thermal stress on battery'
                  : battery.climateImpact === 'moderate'
                    ? 'Moderate climate exposure detected'
                    : 'Severe heat/cold exposure history'
              }
            />
            <DetailCard
              icon={<Zap className="w-4 h-4" strokeWidth={1} />}
              label="Cell Balance"
              status={
                battery.cellBalance === 'excellent'
                  ? 'good'
                  : battery.cellBalance === 'good'
                    ? 'good'
                    : battery.cellBalance === 'fair'
                      ? 'medium'
                      : 'bad'
              }
              value={battery.cellBalance.charAt(0).toUpperCase() + battery.cellBalance.slice(1)}
              sub={`Replacement cost: ~$${battery.estimatedReplacementCost.toLocaleString()}`}
            />
          </div>

          {/* SOH Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Battery Capacity</span>
              <span>{battery.stateOfHealth}% remaining</span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${battery.stateOfHealth}%` }}
                transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
                className={`h-full rounded-full ${
                  battery.stateOfHealth >= 90
                    ? 'bg-emerald-400'
                    : battery.stateOfHealth >= 80
                      ? 'bg-blue-400'
                      : battery.stateOfHealth >= 70
                        ? 'bg-amber-400'
                        : 'bg-rose-400'
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/20">0%</span>
              <span className="text-[10px] text-white/20">50%</span>
              <span className="text-[10px] text-white/20">100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="flex items-center gap-2 mb-2 text-white/40">{icon}</div>
      <div className="text-white font-semibold text-lg">{value}</div>
      <div className="text-white/30 text-xs mt-0.5">{label}</div>
      <div className="text-white/20 text-[11px] mt-1">{sub}</div>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  status,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  status: 'good' | 'bad' | 'medium';
  value: string;
  sub: string;
}) {
  const dotColor = status === 'good' ? 'bg-emerald-400' : status === 'bad' ? 'bg-rose-400' : 'bg-amber-400';
  const valueColor = status === 'good' ? 'text-emerald-400' : status === 'bad' ? 'text-rose-400' : 'text-amber-400';

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
      <div className={`text-sm font-semibold ${valueColor}`}>{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
      <div className="text-white/25 text-[11px] mt-1">{sub}</div>
    </motion.div>
  );
}

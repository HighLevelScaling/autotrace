'use client';

import { motion } from 'framer-motion';
import { FraudReport } from '@/lib/types';
import { Shield, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Gauge, FileText, MapPin } from 'lucide-react';

interface FraudSectionProps {
  fraud: FraudReport;
}

export function FraudSection({ fraud }: FraudSectionProps) {
  const ShieldIcon =
    fraud.riskLevel === 'critical'
      ? ShieldX
      : fraud.riskLevel === 'high'
        ? ShieldAlert
        : fraud.riskLevel === 'medium'
          ? ShieldAlert
          : ShieldCheck;

  const shieldColor =
    fraud.riskLevel === 'critical'
      ? 'text-rose-400'
      : fraud.riskLevel === 'high'
        ? 'text-orange-400'
        : fraud.riskLevel === 'medium'
          ? 'text-amber-400'
          : 'text-emerald-400';

  const shieldBg =
    fraud.riskLevel === 'critical'
      ? 'bg-rose-500/10'
      : fraud.riskLevel === 'high'
        ? 'bg-orange-500/10'
        : fraud.riskLevel === 'medium'
          ? 'bg-amber-500/10'
          : 'bg-emerald-500/10';

  return (
    <div className="col-span-12">
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-indigo-400" strokeWidth={1} />
              <div>
                <h3 className="text-white font-semibold text-lg tracking-tight">Fraud Detection</h3>
                <p className="text-white/40 text-sm">Title wash, odometer, and insurance analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${shieldBg} flex items-center justify-center`}>
                <ShieldIcon className={`w-6 h-6 ${shieldColor}`} strokeWidth={1} />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white tracking-tight">{fraud.fraudScore}</span>
                <span className={`text-[11px] font-semibold uppercase tracking-widest ${shieldColor}`}>
                  {fraud.riskLevel} RISK
                </span>
              </div>
            </div>
          </div>

          {/* Fraud flags */}
          {fraud.flags.length > 0 && (
            <div className="mb-6 space-y-2">
              {fraud.flags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/5 border border-rose-500/10"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" strokeWidth={1} />
                  <span className="text-sm text-rose-300">{flag}</span>
                </motion.div>
              ))}
            </div>
          )}

          {fraud.flags.length === 0 && (
            <div className="mb-6 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" strokeWidth={1} />
              <span className="text-sm text-emerald-300">No fraud indicators detected</span>
            </div>
          )}

          {/* Detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Title Wash */}
            <DetailCard
              icon={<FileText className="w-4 h-4" strokeWidth={1} />}
              label="Title Wash Check"
              status={fraud.titleWashDetected ? 'bad' : 'good'}
              value={fraud.titleWashDetected ? 'DETECTED' : 'Clean'}
              sub={fraud.titleWashDetails || 'No cross-state title anomalies found'}
            />

            {/* Odometer */}
            <DetailCard
              icon={<Gauge className="w-4 h-4" strokeWidth={1} />}
              label="Odometer Rollback"
              status={
                fraud.odometerRollbackProbability > 50
                  ? 'bad'
                  : fraud.odometerRollbackProbability > 25
                    ? 'medium'
                    : 'good'
              }
              value={`${fraud.odometerRollbackProbability}% probability`}
              sub={fraud.odometerRollbackDetails || 'No mileage inconsistencies detected'}
            />

            {/* Insurance Decision */}
            <DetailCard
              icon={<MapPin className="w-4 h-4" strokeWidth={1} />}
              label="Insurance Decision"
              status={
                fraud.totalLossDecision === 'total-loss'
                  ? 'bad'
                  : fraud.totalLossDecision === 'uncertain'
                    ? 'medium'
                    : 'good'
              }
              value={
                fraud.totalLossDecision === 'total-loss'
                  ? 'Should be totaled'
                  : fraud.totalLossDecision === 'repairable'
                    ? 'Repairable'
                    : 'Uncertain'
              }
              sub={fraud.totalLossDetails || 'Insufficient accident data'}
            />
          </div>
        </div>
      </div>
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

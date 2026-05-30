'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useInventory } from '@/lib/dashboard/inventory-context';
import {
  Car,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Clock,
  AlertTriangle,
  Gauge,
  Package,
  Wrench,
  Target,
} from 'lucide-react';

const ease = [0.32, 0.72, 0, 1] as const;
const FLOOR_PLAN_DAILY = 18;

// ─── KPI Targets & Benchmarks ───
const TARGETS = {
  avgConditionScore: 75,
  maxDaysOnLot: 45,
  targetProfitMargin: 0.15,
  maxFloorPlanPct: 0.08,
  maxRedFlagRate: 0.10,
  targetReconditioningPct: 0.08,
};

function getDaysOnLot(dateAcquired: string): number {
  const acquired = new Date(dateAcquired);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24)));
}

function getDaysToSell(dateAcquired: string, dateSold?: string): number {
  const acquired = new Date(dateAcquired);
  const sold = dateSold ? new Date(dateSold) : new Date();
  return Math.max(0, Math.floor((sold.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24)));
}

// ─── KPI Card Component ───
interface KPICardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  health?: 'good' | 'warning' | 'critical';
  icon: React.ElementType;
  index: number;
  onClick?: () => void;
}

function KPICard({ label, value, subValue, trend, trendValue, health, icon: Icon, index, onClick }: KPICardProps) {
  const healthColors = {
    good: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    critical: 'border-red-500/20 bg-red-500/5',
    undefined: 'border-white/[0.08] bg-transparent',
  };

  const trendIcons = {
    up: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1} />,
    down: <TrendingDown className="w-3.5 h-3.5 text-rose-400" strokeWidth={1} />,
    neutral: <Minus className="w-3.5 h-3.5 text-white/30" strokeWidth={1} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease, delay: index * 0.06 }}
      onClick={onClick}
      className={`p-1.5 rounded-[2rem] bg-white/[0.03] border backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        health ? healthColors[health] : 'border-white/[0.08]'
      } ${onClick ? 'cursor-pointer hover:bg-white/[0.05]' : ''}`}
    >
      <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              health === 'good' ? 'bg-emerald-500/10' :
              health === 'warning' ? 'bg-amber-500/10' :
              health === 'critical' ? 'bg-red-500/10' :
              'bg-white/5'
            }`}>
              <Icon className={`w-4 h-4 ${
                health === 'good' ? 'text-emerald-400' :
                health === 'warning' ? 'text-amber-400' :
                health === 'critical' ? 'text-red-400' :
                'text-white/40'
              }`} strokeWidth={1} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">{label}</span>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
              trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
              'bg-white/5 text-white/30'
            }`}>
              {trendIcons[trend]}
              {trendValue}
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight">{value}</p>
        {subValue && <p className="mt-1 text-xs text-white/30">{subValue}</p>}
      </div>
    </motion.div>
  );
}

// ─── Section Header ───
function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease }}
      className="mb-6"
    >
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
        <Target className="w-3 h-3" strokeWidth={1} />
        {eyebrow}
      </span>
      <h2 className="mt-3 text-xl sm:text-2xl font-bold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
    </motion.div>
  );
}

// ─── Progress Bar ───
function ProgressBar({ label, current, target, unit = '' }: { label: string; current: number; target: number; unit?: string }) {
  const pct = Math.min(100, Math.max(0, (current / target) * 100));
  const health = pct >= 100 ? 'critical' : pct >= 80 ? 'warning' : 'good';
  const barColor = health === 'critical' ? 'bg-red-400' : health === 'warning' ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">{label}</span>
        <span className="text-xs text-white/40">
          {current.toFixed(1)}{unit} / {target.toFixed(1)}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className={`h-full rounded-full ${barColor} opacity-70`}
        />
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function AnalyticsPage() {
  const router = useRouter();
  const { vehicles } = useInventory();

  // ─── Calculations ───
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status !== 'sold' && v.status !== 'wholesaled');
  const soldVehicles = vehicles.filter(v => v.status === 'sold');
  const listedVehicles = vehicles.filter(v => v.status === 'listed');

  // Financials
  const totalInvestment = vehicles.reduce((sum, v) => sum + v.purchasePrice + v.reconditioningCost, 0);
  const totalListedValue = vehicles.reduce((sum, v) => sum + (v.listedPrice || v.marketValueMid), 0);
  const totalPotentialProfit = totalListedValue - totalInvestment;
  const profitMargin = totalInvestment > 0 ? totalPotentialProfit / totalInvestment : 0;

  // Per-vehicle metrics
  const avgConditionScore = totalVehicles > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + v.conditionScore, 0) / totalVehicles)
    : 0;

  const avgReconditioning = totalVehicles > 0
    ? vehicles.reduce((sum, v) => sum + v.reconditioningCost, 0) / totalVehicles
    : 0;

  const avgPurchasePrice = totalVehicles > 0
    ? vehicles.reduce((sum, v) => sum + v.purchasePrice, 0) / totalVehicles
    : 0;

  const reconditioningPct = avgPurchasePrice > 0 ? avgReconditioning / avgPurchasePrice : 0;

  // Aging
  const avgDaysOnLot = activeVehicles.length > 0
    ? Math.round(activeVehicles.reduce((sum, v) => sum + getDaysOnLot(v.dateAcquired), 0) / activeVehicles.length)
    : 0;

  const agingVehicles = activeVehicles.filter(v => getDaysOnLot(v.dateAcquired) >= 45);
  const agingRate = activeVehicles.length > 0 ? agingVehicles.length / activeVehicles.length : 0;

  // Floor plan
  const totalFloorPlanCost = activeVehicles.reduce((sum, v) => sum + getDaysOnLot(v.dateAcquired) * FLOOR_PLAN_DAILY, 0);
  const floorPlanPct = totalInvestment > 0 ? totalFloorPlanCost / totalInvestment : 0;

  // Risk
  const redFlagVehicles = vehicles.filter(v => v.redFlags.length > 0);
  const redFlagRate = totalVehicles > 0 ? redFlagVehicles.length / totalVehicles : 0;

  // Velocity
  const avgDaysToSell = soldVehicles.length > 0
    ? Math.round(soldVehicles.reduce((sum, v) => sum + getDaysToSell(v.dateAcquired, v.dateSold), 0) / soldVehicles.length)
    : 0;

  const sellThroughRate = totalVehicles > 0 ? soldVehicles.length / totalVehicles : 0;

  // Status distribution
  const statusCounts = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusColors: Record<string, string> = {
    acquired: 'bg-white/10',
    reconditioning: 'bg-amber-500/20',
    listed: 'bg-emerald-500/20',
    sold: 'bg-blue-500/20',
    wholesaled: 'bg-purple-500/20',
  };

  // Condition distribution
  const scoreRanges = [
    { label: '90-100', min: 90, max: 100, color: 'bg-emerald-500' },
    { label: '80-89', min: 80, max: 89, color: 'bg-emerald-400' },
    { label: '70-79', min: 70, max: 79, color: 'bg-blue-400' },
    { label: '60-69', min: 60, max: 69, color: 'bg-amber-400' },
    { label: '50-59', min: 50, max: 59, color: 'bg-orange-400' },
    { label: '<50', min: 0, max: 49, color: 'bg-red-400' },
  ];
  const maxScoreCount = Math.max(...scoreRanges.map(r => vehicles.filter(v => v.conditionScore >= r.min && v.conditionScore <= r.max).length), 1);

  // ─── Health Determination ───
  const conditionHealth = avgConditionScore >= TARGETS.avgConditionScore ? 'good' : avgConditionScore >= 60 ? 'warning' : 'critical';
  const profitHealth = profitMargin >= TARGETS.targetProfitMargin ? 'good' : profitMargin >= 0.08 ? 'warning' : 'critical';
  const agingHealth = agingRate <= 0.15 ? 'good' : agingRate <= 0.30 ? 'warning' : 'critical';
  const floorPlanHealth = floorPlanPct <= TARGETS.maxFloorPlanPct ? 'good' : floorPlanPct <= 0.12 ? 'warning' : 'critical';

  return (
    <div className="py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-sm text-white/40 mt-2">KPI dashboard with targets and health indicators</p>
      </motion.div>

      {totalVehicles === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="mt-10 p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 text-center">
            <Gauge className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1} />
            <p className="text-white/40 text-sm">Add vehicles to see KPI analytics</p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* ─── EXECUTIVE SUMMARY ─── */}
          <div className="mt-8">
            <SectionHeader
              eyebrow="Executive Summary"
              title="Headline KPIs"
              subtitle="Real-time snapshot of dealership performance vs targets"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Total Inventory"
                value={totalVehicles.toString()}
                subValue={`${activeVehicles.length} active · ${soldVehicles.length} sold`}
                icon={Package}
                index={0}
                onClick={() => router.push('/dashboard/inventory')}
              />
              <KPICard
                label="Avg Condition"
                value={`${avgConditionScore}/100`}
                subValue={`Target: ${TARGETS.avgConditionScore}`}
                health={conditionHealth}
                icon={Gauge}
                index={1}
              />
              <KPICard
                label="Profit Margin"
                value={`${(profitMargin * 100).toFixed(1)}%`}
                subValue={`Target: ${(TARGETS.targetProfitMargin * 100).toFixed(0)}% · $${totalPotentialProfit.toLocaleString()}`}
                health={profitHealth}
                icon={DollarSign}
                index={2}
              />
              <KPICard
                label="Aging Rate"
                value={`${(agingRate * 100).toFixed(0)}%`}
                subValue={`${agingVehicles.length} of ${activeVehicles.length} vehicles ≥ 45 days`}
                health={agingHealth}
                icon={Clock}
                index={3}
              />
            </div>
          </div>

          {/* ─── OPERATIONAL METRICS ─── */}
          <div className="mt-12">
            <SectionHeader
              eyebrow="Operational"
              title="Day-to-Day Performance"
              subtitle="Metrics that drive immediate action"
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                label="Avg Days on Lot"
                value={avgDaysOnLot.toString()}
                subValue={`Target: < ${TARGETS.maxDaysOnLot} days`}
                health={avgDaysOnLot <= TARGETS.maxDaysOnLot ? 'good' : avgDaysOnLot <= 60 ? 'warning' : 'critical'}
                icon={Clock}
                index={0}
              />
              <KPICard
                label="Sell-Through Rate"
                value={`${(sellThroughRate * 100).toFixed(0)}%`}
                subValue={`${soldVehicles.length} sold / ${totalVehicles} total`}
                icon={TrendingUp}
                index={1}
              />
              <KPICard
                label="Floor Plan Cost"
                value={`$${totalFloorPlanCost.toLocaleString()}`}
                subValue={`${(floorPlanPct * 100).toFixed(1)}% of investment`}
                health={floorPlanHealth}
                icon={DollarSign}
                index={2}
              />
              <KPICard
                label="Red Flag Rate"
                value={`${(redFlagRate * 100).toFixed(0)}%`}
                subValue={`${redFlagVehicles.length} vehicles with issues`}
                health={redFlagRate <= TARGETS.maxRedFlagRate ? 'good' : redFlagRate <= 0.20 ? 'warning' : 'critical'}
                icon={AlertTriangle}
                index={3}
              />
            </div>
          </div>

          {/* ─── TARGET TRACKING ─── */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
                <h3 className="text-sm font-semibold text-white/90 mb-6">Target vs Actual</h3>
                <div className="space-y-5">
                  <ProgressBar label="Condition Score" current={avgConditionScore} target={TARGETS.avgConditionScore} unit="" />
                  <ProgressBar label="Profit Margin" current={profitMargin * 100} target={TARGETS.targetProfitMargin * 100} unit="%" />
                  <ProgressBar label="Floor Plan %" current={floorPlanPct * 100} target={TARGETS.maxFloorPlanPct * 100} unit="%" />
                  <ProgressBar label="Reconditioning %" current={reconditioningPct * 100} target={TARGETS.targetReconditioningPct * 100} unit="%" />
                </div>
              </div>
            </motion.div>

            {/* Status Pipeline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
                <h3 className="text-sm font-semibold text-white/90 mb-5">Inventory Pipeline</h3>
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-white/60 capitalize">{status}</span>
                        <span className="text-white/40">{count} vehicle{count !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(count / totalVehicles) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease, delay: 0.2 }}
                          className={`h-full rounded-full ${statusColors[status] || 'bg-white/10'}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">Listed / Total</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {listedVehicles.length} / {totalVehicles}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── CONDITION & VELOCITY ─── */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Condition Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease }}
              className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
                <h3 className="text-sm font-semibold text-white/90 mb-5">Condition Score Distribution</h3>
                <div className="flex items-end gap-3 h-40">
                  {scoreRanges.map((range, i) => {
                    const count = vehicles.filter(v => v.conditionScore >= range.min && v.conditionScore <= range.max).length;
                    const height = count > 0 ? (count / maxScoreCount) * 100 : 0;
                    return (
                      <div key={range.label} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-white/40">{count}</span>
                        <div className="w-full flex-1 bg-white/5 rounded-t-lg relative overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease, delay: i * 0.05 }}
                            className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${range.color} opacity-60`}
                          />
                        </div>
                        <span className="text-[10px] text-white/30">{range.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Velocity Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease, delay: 0.1 }}
              className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
                <h3 className="text-sm font-semibold text-white/90 mb-5">Sales Velocity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-emerald-400" strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Avg Days to Sell</p>
                        <p className="text-[10px] text-white/30">From acquisition to sale</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${avgDaysToSell <= TARGETS.maxDaysOnLot ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {avgDaysToSell} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-blue-400" strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Avg Reconditioning</p>
                        <p className="text-[10px] text-white/30">Per vehicle cost</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">${Math.round(avgReconditioning).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-amber-400" strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Avg Purchase Price</p>
                        <p className="text-[10px] text-white/30">Per vehicle acquisition</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">${Math.round(avgPurchasePrice).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-purple-400" strokeWidth={1} />
                      </div>
                      <div>
                        <p className="text-sm text-white/80">Listed / Total Ratio</p>
                        <p className="text-[10px] text-white/30">Ready-for-sale inventory</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {totalVehicles > 0 ? Math.round((listedVehicles.length / totalVehicles) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── RISK SUMMARY ─── */}
          <div className="mt-12">
            <SectionHeader
              eyebrow="Risk Management"
              title="Inventory Risk Profile"
              subtitle="Vehicles requiring immediate attention"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease }}
                className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1} />
                    <span className="text-sm font-semibold text-white/80">Critical Aging</span>
                  </div>
                  <p className="text-3xl font-bold text-red-400">{agingVehicles.filter(v => getDaysOnLot(v.dateAcquired) >= 75).length}</p>
                  <p className="text-xs text-white/30 mt-1">Vehicles ≥ 75 days on lot</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease, delay: 0.1 }}
                className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" strokeWidth={1} />
                    <span className="text-sm font-semibold text-white/80">Warning Aging</span>
                  </div>
                  <p className="text-3xl font-bold text-amber-400">{agingVehicles.filter(v => getDaysOnLot(v.dateAcquired) >= 45 && getDaysOnLot(v.dateAcquired) < 75).length}</p>
                  <p className="text-xs text-white/30 mt-1">Vehicles 45-74 days on lot</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.8, ease, delay: 0.2 }}
                className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" strokeWidth={1} />
                    <span className="text-sm font-semibold text-white/80">Red Flags</span>
                  </div>
                  <p className="text-3xl font-bold text-red-400">{redFlagVehicles.length}</p>
                  <p className="text-xs text-white/30 mt-1">Vehicles with title or history issues</p>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

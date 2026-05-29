'use client';

import { motion } from 'framer-motion';
import { useInventory } from '@/lib/dashboard/inventory-context';
import { BarChart3, Car, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const { vehicles } = useInventory();

  const totalVehicles = vehicles.length;
  const avgScore = totalVehicles > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + v.conditionScore, 0) / totalVehicles)
    : 0;
  const totalInvestment = vehicles.reduce((sum, v) => sum + v.purchasePrice + v.reconditioningCost, 0);
  const totalListedValue = vehicles.reduce((sum, v) => sum + (v.listedPrice || v.marketValueMid), 0);
  const totalPotentialProfit = totalListedValue - totalInvestment;
  const redFlagVehicles = vehicles.filter(v => v.redFlags.length > 0).length;

  // Status breakdown
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

  // Score distribution
  const scoreRanges = [
    { label: '90-100', min: 90, max: 100, color: 'bg-emerald-500' },
    { label: '80-89', min: 80, max: 89, color: 'bg-emerald-400' },
    { label: '70-79', min: 70, max: 79, color: 'bg-blue-400' },
    { label: '60-69', min: 60, max: 69, color: 'bg-amber-400' },
    { label: '50-59', min: 50, max: 59, color: 'bg-orange-400' },
    { label: '0-49', min: 0, max: 49, color: 'bg-red-400' },
  ];
  const maxScoreCount = Math.max(...scoreRanges.map(r => vehicles.filter(v => v.conditionScore >= r.min && v.conditionScore <= r.max).length), 1);

  // Profit by status
  const profitByStatus = Object.entries(statusCounts).map(([status, count]) => {
    const statusVehicles = vehicles.filter(v => v.status === status);
    const investment = statusVehicles.reduce((sum, v) => sum + v.purchasePrice + v.reconditioningCost, 0);
    const listed = statusVehicles.reduce((sum, v) => sum + (v.listedPrice || v.marketValueMid), 0);
    return { status, count, profit: listed - investment };
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-white/40 mt-1">Inventory performance and insights</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Inventory', value: totalVehicles, icon: Car, color: 'text-indigo-400' },
          { label: 'Avg Condition', value: `${avgScore}/100`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Total Investment', value: `$${totalInvestment.toLocaleString()}`, icon: DollarSign, color: 'text-amber-400' },
          { label: 'Est. Profit', value: `$${totalPotentialProfit.toLocaleString()}`, icon: BarChart3, color: 'text-blue-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
                <Icon className={`w-5 h-5 ${stat.color} mb-2`} strokeWidth={1.5} />
                <p className="text-xs text-white/40">{stat.label}</p>
                <p className="text-lg font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {totalVehicles === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          className="mt-8 p-1.5 rounded-[2rem] glass-card"
        >
          <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-8 text-center">
            <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Add vehicles to see analytics</p>
          </div>
        </motion.div>
      ) : (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
            className="p-1.5 rounded-[2rem] glass-card"
          >
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <h3 className="text-sm font-semibold text-white/90 mb-5">Inventory by Status</h3>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white/60 capitalize">{status}</span>
                      <span className="text-white/40">{count} vehicle{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[status] || 'bg-white/10'}`}
                        style={{ width: `${(count / totalVehicles) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Condition Score Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
            className="p-1.5 rounded-[2rem] glass-card"
          >
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <h3 className="text-sm font-semibold text-white/90 mb-5">Condition Score Distribution</h3>
              <div className="flex items-end gap-3 h-40">
                {scoreRanges.map((range) => {
                  const count = vehicles.filter(v => v.conditionScore >= range.min && v.conditionScore <= range.max).length;
                  const height = count > 0 ? (count / maxScoreCount) * 100 : 0;
                  return (
                    <div key={range.label} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] text-white/40">{count}</span>
                      <div className="w-full flex-1 bg-white/5 rounded-t-lg relative overflow-hidden">
                        <div
                          className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${range.color} opacity-60`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-white/30">{range.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Profit by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
            className="p-1.5 rounded-[2rem] glass-card"
          >
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <h3 className="text-sm font-semibold text-white/90 mb-5">Profit by Status</h3>
              <div className="space-y-3">
                {profitByStatus.map(({ status, profit }) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-white/60 capitalize">{status}</span>
                    <span className={`text-sm font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Red Flag Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
            className="p-1.5 rounded-[2rem] glass-card"
          >
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <h3 className="text-sm font-semibold text-white/90 mb-5">Risk Summary</h3>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-red-500/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-red-400">{redFlagVehicles}</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">vehicle{redFlagVehicles !== 1 ? 's' : ''} with red flags</p>
                  <p className="text-xs text-white/30 mt-1">
                    {totalVehicles > 0 ? Math.round((redFlagVehicles / totalVehicles) * 100) : 0}% of inventory
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

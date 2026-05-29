'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Car,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Gauge,
  DollarSign,
  PlusCircle,
  Clock,
  TrendingDown,
} from 'lucide-react';
import { useInventory } from '@/lib/dashboard/inventory-context';

export default function DashboardHome() {
  const router = useRouter();
  const { vehicles } = useInventory();

  const totalVehicles = vehicles.length;
  const avgScore = totalVehicles > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + v.conditionScore, 0) / totalVehicles)
    : 0;
  const redFlagCount = vehicles.filter(v => v.redFlags.length > 0).length;
  const totalInvestment = vehicles.reduce((sum, v) => sum + v.purchasePrice + v.reconditioningCost, 0);
  const totalListedValue = vehicles.reduce((sum, v) => sum + (v.listedPrice || v.marketValueMid), 0);
  const potentialProfit = totalListedValue - totalInvestment;

  const recentVehicles = vehicles.slice(0, 5);

  // Aging calculations
  const FLOOR_PLAN_DAILY = 18;
  const getDaysOnLot = (dateAcquired: string) => {
    const acquired = new Date(dateAcquired);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const activeVehicles = vehicles.filter(v => v.status !== 'sold' && v.status !== 'wholesaled');
  const agingVehicles = activeVehicles
    .map(v => ({ ...v, days: getDaysOnLot(v.dateAcquired) }))
    .filter(v => v.days >= 45)
    .sort((a, b) => b.days - a.days);
  const totalFloorPlanCost = activeVehicles.reduce((sum, v) => sum + getDaysOnLot(v.dateAcquired) * FLOOR_PLAN_DAILY, 0);

  const stats = [
    { label: 'Total Inventory', value: totalVehicles.toString(), icon: Car, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Avg Condition', value: avgScore.toString(), icon: Gauge, color: 'text-emerald-400', bg: 'bg-emerald-500/10', suffix: '/100' },
    { label: 'Red Flags', value: redFlagCount.toString(), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Est. Profit', value: `$${potentialProfit.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Overview of your inventory and performance</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-white/40">{stat.label}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stat.value}
                  {stat.suffix && <span className="text-sm text-white/40 ml-1">{stat.suffix}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Aging Summary */}
      {activeVehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.15 }}
          className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <div className="p-1.5 rounded-[1.5rem] glass-card">
            <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-white/40">Aging Vehicles (45+ days)</span>
              </div>
              <p className="text-2xl font-bold text-white">{agingVehicles.length}</p>
              <p className="text-[10px] text-white/30 mt-1">of {activeVehicles.length} active inventory</p>
            </div>
          </div>
          <div className="p-1.5 rounded-[1.5rem] glass-card">
            <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-red-400" />
                <span className="text-xs text-white/40">Total Floor Plan Cost</span>
              </div>
              <p className="text-2xl font-bold text-red-400">${totalFloorPlanCost.toLocaleString()}</p>
              <p className="text-[10px] text-white/30 mt-1">${FLOOR_PLAN_DAILY}/day per vehicle</p>
            </div>
          </div>
          <div className="p-1.5 rounded-[1.5rem] glass-card">
            <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/40">Avg Days on Lot</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {activeVehicles.length > 0 ? Math.round(activeVehicles.reduce((sum, v) => sum + getDaysOnLot(v.dateAcquired), 0) / activeVehicles.length) : 0}
              </p>
              <p className="text-[10px] text-white/30 mt-1">Target: under 30 days</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Inventory */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
        className="mt-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Additions</h2>
          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentVehicles.length === 0 ? (
          <div className="p-1.5 rounded-[2rem] glass-card">
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-8 text-center">
              <Car className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-white/40 text-sm">No vehicles in inventory yet</p>
              <button
                onClick={() => router.push('/dashboard/add')}
                className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentVehicles.map((vehicle, i) => (
              <div
                key={vehicle.vin}
                onClick={() => router.push(`/dashboard/vehicle/${encodeURIComponent(vehicle.vin)}`)}
                className="p-1.5 rounded-[1.5rem] glass-card cursor-pointer hover:bg-white/[0.04] transition-colors"
              >
                <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    vehicle.conditionScore >= 70 ? 'bg-emerald-500/10' :
                    vehicle.conditionScore >= 55 ? 'bg-amber-500/10' : 'bg-red-500/10'
                  }`}>
                    <span className={`text-sm font-bold ${
                      vehicle.conditionScore >= 70 ? 'text-emerald-400' :
                      vehicle.conditionScore >= 55 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {vehicle.conditionScore}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-xs text-white/40 font-mono truncate">{vehicle.vin}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-white/70">${vehicle.listedPrice?.toLocaleString() || vehicle.marketValueMid.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30">listed</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      vehicle.status === 'listed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      vehicle.status === 'sold' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      vehicle.status === 'reconditioning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-white/5 text-white/40 border-white/10'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  {vehicle.redFlags.length > 0 && (
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

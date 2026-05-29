'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Car,
  AlertTriangle,
  Search,
  Trash2,
  Clock,
  DollarSign,
  TrendingDown,
} from 'lucide-react';
import { useInventory } from '@/lib/dashboard/inventory-context';

const FLOOR_PLAN_DAILY_RATE = 18;

function getDaysOnLot(dateAcquired: string): number {
  const acquired = new Date(dateAcquired);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - acquired.getTime()) / (1000 * 60 * 60 * 24)));
}

function getWholesaleAlert(days: number): { level: 'none' | 'warning' | 'urgent' | 'critical'; message: string } {
  if (days >= 75) return { level: 'critical', message: 'Wholesale NOW' };
  if (days >= 60) return { level: 'urgent', message: 'Wholesale soon' };
  if (days >= 45) return { level: 'warning', message: 'Aging — consider drop' };
  return { level: 'none', message: '' };
}

function getSuggestedPriceDrop(listedPrice: number, days: number): number {
  if (days >= 60) return Math.round(listedPrice * 0.05);
  if (days >= 45) return Math.round(listedPrice * 0.03);
  if (days >= 30) return Math.round(listedPrice * 0.02);
  return 0;
}

export default function InventoryPage() {
  const router = useRouter();
  const { vehicles, removeVehicle } = useInventory();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'value' | 'days'>('date');

  const filtered = vehicles
    .filter(v => {
      const matchesSearch =
        v.vin.toLowerCase().includes(search.toLowerCase()) ||
        v.make.toLowerCase().includes(search.toLowerCase()) ||
        v.model.toLowerCase().includes(search.toLowerCase()) ||
        v.year.toString().includes(search);
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.dateAcquired).getTime() - new Date(a.dateAcquired).getTime();
      if (sortBy === 'score') return b.conditionScore - a.conditionScore;
      if (sortBy === 'value') return (b.listedPrice || b.marketValueMid) - (a.listedPrice || a.marketValueMid);
      if (sortBy === 'days') return getDaysOnLot(b.dateAcquired) - getDaysOnLot(a.dateAcquired);
      return 0;
    });

  const agingVehicles = vehicles.filter(v => {
    const days = getDaysOnLot(v.dateAcquired);
    return days >= 45 && v.status !== 'sold' && v.status !== 'wholesaled';
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Inventory</h1>
            <p className="text-sm text-white/40 mt-1">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/add')}
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <Car className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>
      </motion.div>

      {/* Aging Alert Banner */}
      {agingVehicles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.05 }}
          className="mb-6 p-1.5 rounded-[2rem] glass-card"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-amber-500/5 border border-amber-500/10 p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-400">{agingVehicles.length} vehicle{agingVehicles.length !== 1 ? 's' : ''} aging on lot</p>
              <p className="text-xs text-amber-400/60">Review inventory for price drops or wholesale decisions</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="mb-6 space-y-3"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by VIN, make, model, or year..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'acquired', 'reconditioning', 'listed', 'sold', 'wholesaled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === status
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'bg-white/5 text-white/40 border border-transparent hover:bg-white/[0.07]'
              }`}
            >
              {status === 'all' ? 'All Statuses' : status}
            </button>
          ))}
          <div className="flex-1" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'value' | 'days')}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none"
          >
            <option value="date">Sort: Date Added</option>
            <option value="score">Sort: Condition Score</option>
            <option value="value">Sort: Listed Value</option>
            <option value="days">Sort: Days on Lot</option>
          </select>
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
      >
        {filtered.length === 0 ? (
          <div className="p-1.5 rounded-[2rem] glass-card">
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-8 text-center">
              <Car className="w-10 h-10 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-white/40 text-sm">No vehicles match your filters</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] glass-card">
            <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 pl-2 text-xs font-medium text-white/40 uppercase">Vehicle</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase">Score</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-center hidden md:table-cell">
                      <Clock className="w-3 h-3 inline" /> Days
                    </th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell">Inv. Cost</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell">Listed</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden sm:table-cell">Est. Profit</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-center">Status</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-center hidden xl:table-cell">Floor Plan</th>
                    <th className="pb-3 pr-2 text-xs font-medium text-white/40 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filtered.map((v) => {
                    const investment = v.purchasePrice + v.reconditioningCost;
                    const listed = v.listedPrice || v.marketValueMid;
                    const profit = listed - investment;
                    const days = getDaysOnLot(v.dateAcquired);
                    const floorPlanCost = days * FLOOR_PLAN_DAILY_RATE;
                    const alert = getWholesaleAlert(days);
                    const priceDrop = getSuggestedPriceDrop(listed, days);

                    return (
                      <tr
                        key={v.vin}
                        onClick={() => router.push(`/dashboard/vehicle/${encodeURIComponent(v.vin)}`)}
                        className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      >
                        <td className="py-3 pl-2">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-white/20 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-white/80">{v.year} {v.make} {v.model}</p>
                              <p className="text-[10px] text-white/30 font-mono">{v.vin}</p>
                              {alert.level !== 'none' && (
                                <span className={`inline-flex items-center gap-1 text-[10px] mt-0.5 ${
                                  alert.level === 'critical' ? 'text-red-400' :
                                  alert.level === 'urgent' ? 'text-orange-400' :
                                  'text-amber-400'
                                }`}>
                                  <AlertTriangle className="w-3 h-3" />
                                  {alert.message}
                                </span>
                              )}
                              {priceDrop > 0 && alert.level !== 'critical' && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-blue-400/70 mt-0.5">
                                  <TrendingDown className="w-3 h-3" />
                                  Drop ${priceDrop.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                            v.conditionScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                            v.conditionScore >= 55 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {v.conditionScore}
                          </span>
                        </td>
                        <td className="py-3 text-center hidden md:table-cell">
                          <div>
                            <span className={`text-sm font-medium ${
                              days >= 75 ? 'text-red-400' :
                              days >= 60 ? 'text-orange-400' :
                              days >= 45 ? 'text-amber-400' :
                              'text-white/60'
                            }`}>
                              {days}
                            </span>
                            <p className="text-[10px] text-white/30">days</p>
                          </div>
                        </td>
                        <td className="py-3 text-right text-sm text-white/60 hidden lg:table-cell">${investment.toLocaleString()}</td>
                        <td className="py-3 text-right text-sm text-white/80 hidden lg:table-cell">${listed.toLocaleString()}</td>
                        <td className="py-3 text-right hidden sm:table-cell">
                          <span className={`text-sm font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${
                            v.status === 'listed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            v.status === 'sold' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            v.status === 'reconditioning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-white/5 text-white/40 border-white/10'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="py-3 text-center hidden xl:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            <DollarSign className="w-3 h-3 text-white/20" />
                            <span className="text-xs text-white/40">${floorPlanCost.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Remove this vehicle from inventory?')) {
                                removeVehicle(v.vin);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

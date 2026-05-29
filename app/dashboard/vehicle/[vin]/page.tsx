'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
  DollarSign,
  Wrench,
  Tag,
  Calendar,
  Edit3,
  Printer,
  AlertTriangle,
  Save,
  X,
  Eye,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useState } from 'react';
import { useInventory } from '@/lib/dashboard/inventory-context';
import { ConditionScoreBadge } from '@/components/condition-score-badge';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { vehicles, updateVehicle } = useInventory();
  const [editing, setEditing] = useState(false);

  const vin = decodeURIComponent(params.vin as string);
  const vehicle = vehicles.find(v => v.vin === vin);

  // Edit form state
  const [editPurchase, setEditPurchase] = useState('');
  const [EditRecon, setEditRecon] = useState('');
  const [editListed, setEditListed] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <Car className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/40">Vehicle not found in inventory</p>
        <button
          onClick={() => router.push('/dashboard/inventory')}
          className="mt-4 inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </button>
      </div>
    );
  }

  const investment = vehicle.purchasePrice + vehicle.reconditioningCost;
  const listed = vehicle.listedPrice || vehicle.marketValueMid;
  const profit = listed - investment;
  const margin = investment > 0 ? (profit / investment) * 100 : 0;

  // Mock competitive market data
  function generateCompetitorData() {
    if (!vehicle) return { competitors: [] as any[], avgPrice: 0, avgDays: 0, competitorCount: 0, ourPosition: 'at' as const, priceTrend: 'stable' as const };
    const basePrice = vehicle.marketValueMid;
    const competitorCount = 3 + Math.floor(Math.abs(vehicle.vin.charCodeAt(0) + vehicle.vin.charCodeAt(5)) % 8);
    const competitors = [];
    for (let i = 0; i < competitorCount; i++) {
      const priceVariance = (Math.random() - 0.5) * 0.15;
      const daysListed = 5 + Math.floor(Math.random() * 75);
      const distance = 2 + Math.floor(Math.random() * 48);
      competitors.push({
        id: i,
        dealer: ['Premier Auto', 'City Motors', 'Highway Sales', 'Diamond Cars', 'Elite Autos', 'Star Dealer', 'Metro Cars'][i % 7],
        price: Math.round(basePrice * (1 + priceVariance)),
        daysListed,
        distance,
        isNewer: daysListed < 14,
      });
    }
    competitors.sort((a, b) => a.price - b.price);

    const avgPrice = Math.round(competitors.reduce((s, c) => s + c.price, 0) / competitors.length);
    const avgDays = Math.round(competitors.reduce((s, c) => s + c.daysListed, 0) / competitors.length);
    const ourPosition = listed > avgPrice ? 'above' : listed < avgPrice * 0.95 ? 'below' : 'at';
    const priceTrend = competitorCount > 5 ? 'falling' : competitorCount < 3 ? 'rising' : 'stable';

    return { competitors: competitors.slice(0, 5), avgPrice, avgDays, competitorCount, ourPosition, priceTrend };
  }

  const marketData = generateCompetitorData();

  function startEdit() {
    if (!vehicle) return;
    setEditPurchase(vehicle.purchasePrice.toString());
    setEditRecon(vehicle.reconditioningCost.toString());
    setEditListed((vehicle.listedPrice || vehicle.marketValueMid).toString());
    setEditStatus(vehicle.status);
    setEditNotes(vehicle.notes);
    setEditing(true);
  }

  function saveEdit() {
    if (!vehicle) return;
    updateVehicle(vehicle.vin, {
      purchasePrice: Number(editPurchase) || 0,
      reconditioningCost: Number(EditRecon) || 0,
      listedPrice: Number(editListed) || 0,
      status: editStatus as any,
      notes: editNotes,
    });
    setEditing(false);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
            <p className="text-xs text-white/40 font-mono">{vehicle.vin}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('vin', vehicle.vin);
                  window.open(`/report/print?${params.toString()}`, '_blank');
                }}
                className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print Report
              </button>
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/90 transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Top Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div className="p-1.5 rounded-[1.5rem] glass-card">
          <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Condition Score</p>
            <div className="mt-2">
              <ConditionScoreBadge score={vehicle.conditionScore} size="sm" />
            </div>
          </div>
        </div>
        <div className="p-1.5 rounded-[1.5rem] glass-card">
          <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Investment</p>
            <p className="text-lg font-bold text-white mt-1">${investment.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-1.5 rounded-[1.5rem] glass-card">
          <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Listed Price</p>
            <p className="text-lg font-bold text-white mt-1">${listed.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-1.5 rounded-[1.5rem] glass-card">
          <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Est. Profit</p>
            <p className={`text-lg font-bold mt-1 ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Dealer Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="p-1.5 rounded-[2rem] glass-card">
          <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
            <h3 className="text-sm font-semibold text-white/90 mb-4">Dealer Data</h3>
            <div className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Purchase Price</label>
                    <input
                      type="number"
                      value={editPurchase}
                      onChange={(e) => setEditPurchase(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Reconditioning</label>
                    <input
                      type="number"
                      value={EditRecon}
                      onChange={(e) => setEditRecon(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Listed Price</label>
                    <input
                      type="number"
                      value={editListed}
                      onChange={(e) => setEditListed(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20"
                    >
                      <option value="acquired" className="bg-[#0a0a0a]">Acquired</option>
                      <option value="reconditioning" className="bg-[#0a0a0a]">Reconditioning</option>
                      <option value="listed" className="bg-[#0a0a0a]">Listed</option>
                      <option value="sold" className="bg-[#0a0a0a]">Sold</option>
                      <option value="wholesaled" className="bg-[#0a0a0a]">Wholesaled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Purchase Price</span>
                    <span className="text-white/80">${vehicle.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Reconditioning</span>
                    <span className="text-white/80">${vehicle.reconditioningCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Listed Price</span>
                    <span className="text-white/80">${(vehicle.listedPrice || vehicle.marketValueMid).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Status</span>
                    <span className="capitalize text-white/80">{vehicle.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Source</span>
                    <span className="text-white/80">{vehicle.source || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Date Acquired</span>
                    <span className="text-white/80">{vehicle.dateAcquired}</span>
                  </div>
                  {vehicle.notes && (
                    <div className="pt-3 border-t border-white/5">
                      <span className="text-xs text-white/40">Notes</span>
                      <p className="text-sm text-white/70 mt-1">{vehicle.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title & History Summary */}
          <div className="p-1.5 rounded-[2rem] glass-card">
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <h3 className="text-sm font-semibold text-white/90 mb-4">History Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Title Brands</span>
                  <div className="flex gap-1">
                    {vehicle.titleBrands.map((b: string) => (
                      <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        b === 'clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {b.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Accidents</span>
                  <span className="text-white/80">{vehicle.accidentCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Tickets</span>
                  <span className="text-white/80">{vehicle.ticketCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Registration</span>
                  <span className="capitalize text-white/80">{vehicle.registrationStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Red Flags */}
          {vehicle.redFlags.length > 0 && (
            <div className="p-1.5 rounded-[2rem] glass-card">
              <div className="rounded-[calc(2rem-0.375rem)] bg-red-500/5 border border-red-500/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-semibold text-red-400">Red Flags</h3>
                </div>
                <ul className="space-y-1.5">
                  {vehicle.redFlags.map((flag, i) => (
                    <li key={i} className="text-xs text-red-400/80 flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Competitive Market Lens */}
          <div className="p-1.5 rounded-[2rem] glass-card">
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white/90">Market Lens</h3>
                <span className="text-[10px] text-white/30 ml-auto">{marketData.competitorCount} similar listings within 50 mi</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-[10px] text-white/40 uppercase">Avg Price</p>
                  <p className="text-sm font-bold text-white mt-0.5">${marketData.avgPrice.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-[10px] text-white/40 uppercase">Avg Days Listed</p>
                  <p className="text-sm font-bold text-white mt-0.5">{marketData.avgDays}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/[0.03]">
                  <p className="text-[10px] text-white/40 uppercase">Price Trend</p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    {marketData.priceTrend === 'rising' ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">Rising</span>
                      </>
                    ) : marketData.priceTrend === 'falling' ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-sm font-bold text-red-400">Falling</span>
                      </>
                    ) : (
                      <>
                        <Minus className="w-3.5 h-3.5 text-white/40" />
                        <span className="text-sm font-bold text-white/60">Stable</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Your position vs market</span>
                  <span className={`text-xs font-medium ${
                    marketData.ourPosition === 'below' ? 'text-emerald-400' :
                    marketData.ourPosition === 'above' ? 'text-amber-400' :
                    'text-white/60'
                  }`}>
                    {marketData.ourPosition === 'below' ? 'Priced below average' :
                     marketData.ourPosition === 'above' ? 'Priced above average' :
                     'Priced at market average'}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500 relative">
                    <div
                      className="absolute top-0 w-1.5 h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                      style={{ left: `${Math.min(95, Math.max(5, ((listed - marketData.avgPrice * 0.85) / (marketData.avgPrice * 0.3)) * 100))}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-white/20">Low</span>
                  <span className="text-[10px] text-white/20">Market Avg</span>
                  <span className="text-[10px] text-white/20">High</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">Competitor Listings</p>
                {marketData.competitors.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.isNewer ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-xs text-white/70">{c.dealer}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" />
                            {c.distance} mi
                          </span>
                          <span>{c.daysListed} days listed</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white/80">${c.price.toLocaleString()}</p>
                      <p className={`text-[10px] ${c.price > listed ? 'text-amber-400' : c.price < listed ? 'text-emerald-400' : 'text-white/30'}`}>
                        {c.price > listed ? '+' : ''}${(c.price - listed).toLocaleString()} vs yours
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Car,
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
import { useInventory, InventoryVehicle } from '@/lib/dashboard/inventory-context';
import { ConditionScoreBadge } from '@/components/condition-score-badge';

const ease = [0.32, 0.72, 0, 1] as const;

interface Competitor {
  id: number;
  dealer: string;
  price: number;
  daysListed: number;
  distance: number;
  isNewer: boolean;
}

interface MarketData {
  competitors: Competitor[];
  avgPrice: number;
  avgDays: number;
  competitorCount: number;
  ourPosition: 'below' | 'at' | 'above';
  priceTrend: 'rising' | 'falling' | 'stable';
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function generateCompetitorData(vin: string, basePrice: number, listedPrice: number): MarketData {
  const seedBase = vin.split('').reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0);
  const competitorCount = 3 + Math.floor(seededRandom(seedBase) * 8);
  const competitors: Competitor[] = [];

  for (let i = 0; i < competitorCount; i++) {
    const priceVariance = (seededRandom(seedBase + i * 7) - 0.5) * 0.15;
    const daysListed = 5 + Math.floor(seededRandom(seedBase + i * 13) * 75);
    const distance = 2 + Math.floor(seededRandom(seedBase + i * 19) * 48);
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
  const ourPosition = listedPrice > avgPrice ? 'above' : listedPrice < avgPrice * 0.95 ? 'below' : 'at';
  const priceTrend = competitorCount > 5 ? 'falling' : competitorCount < 3 ? 'rising' : 'stable';

  return { competitors: competitors.slice(0, 5), avgPrice, avgDays, competitorCount, ourPosition, priceTrend };
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { vehicles, updateVehicle } = useInventory();
  const [editing, setEditing] = useState(false);

  const vin = decodeURIComponent(params.vin as string);
  const vehicle = vehicles.find(v => v.vin === vin);

  const [editPurchase, setEditPurchase] = useState('');
  const [editRecon, setEditRecon] = useState('');
  const [editListed, setEditListed] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!vehicle) {
    return (
      <div className="text-center py-24">
        <Car className="w-12 h-12 text-white/20 mx-auto mb-4" strokeWidth={1} />
        <p className="text-white/40">Vehicle not found in inventory</p>
        <button
          onClick={() => router.push('/dashboard/inventory')}
          className="mt-6 inline-flex items-center gap-2 bg-white text-black pl-4 pr-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 active:scale-[0.98] transition-all"
          style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          Back to Inventory
        </button>
      </div>
    );
  }

  const investment = vehicle.purchasePrice + vehicle.reconditioningCost;
  const listed = vehicle.listedPrice || vehicle.marketValueMid;
  const profit = listed - investment;

  const marketData = generateCompetitorData(vehicle.vin, vehicle.marketValueMid, listed);

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
      reconditioningCost: Number(editRecon) || 0,
      listedPrice: Number(editListed) || 0,
      status: editStatus as InventoryVehicle['status'],
      notes: editNotes,
    });
    setEditing(false);
  }

  return (
    <div className="py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/inventory')}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
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
                className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-all"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
              >
                <Printer className="w-4 h-4" strokeWidth={1} />
                Print Report
              </button>
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
              >
                <Edit3 className="w-4 h-4" strokeWidth={1} />
                Edit
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-all"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
              >
                <X className="w-4 h-4" strokeWidth={1} />
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-all"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
              >
                <Save className="w-4 h-4" strokeWidth={1} />
                Save
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Top Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: 'Condition Score', value: <ConditionScoreBadge score={vehicle.conditionScore} size="sm" /> },
          { label: 'Total Investment', value: `$${investment.toLocaleString()}`, raw: true },
          { label: 'Listed Price', value: `$${listed.toLocaleString()}`, raw: true },
          { label: 'Est. Profit', value: `${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}`, profit: true },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease, delay: i * 0.05 }}
            className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-4">
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{card.label}</p>
              <div className={`mt-2 ${card.profit ? (profit >= 0 ? 'text-emerald-400' : 'text-red-400') : ''}`}>
                {card.raw || card.profit ? (
                  <p className={`text-lg font-bold ${card.profit ? '' : 'text-white'}`}>{card.value}</p>
                ) : (
                  card.value
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Dealer Details */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
            <h3 className="text-sm font-semibold text-white/90 mb-4">Dealer Data</h3>
            <div className="space-y-4">
              {editing ? (
                <>
                  {[
                    { label: 'Purchase Price', value: editPurchase, setter: setEditPurchase },
                    { label: 'Reconditioning', value: editRecon, setter: setEditRecon },
                    { label: 'Listed Price', value: editListed, setter: setEditListed },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs text-white/40 mb-1">{field.label}</label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                        style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}
                      />
                    </div>
                  ))}
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-white/20 resize-none transition-colors"
                      style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  {[
                    { label: 'Purchase Price', value: `$${vehicle.purchasePrice.toLocaleString()}` },
                    { label: 'Reconditioning', value: `$${vehicle.reconditioningCost.toLocaleString()}` },
                    { label: 'Listed Price', value: `$${(vehicle.listedPrice || vehicle.marketValueMid).toLocaleString()}` },
                    { label: 'Status', value: vehicle.status, capitalize: true },
                    { label: 'Source', value: vehicle.source || '—' },
                    { label: 'Date Acquired', value: vehicle.dateAcquired },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-white/40">{item.label}</span>
                      <span className={`text-white/80 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</span>
                    </div>
                  ))}
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
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
          </motion.div>

          {/* Red Flags */}
          {vehicle.redFlags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
            >
              <div className="rounded-[calc(2rem-0.375rem)] bg-red-500/5 border border-red-500/10 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" strokeWidth={1} />
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
            </motion.div>
          )}

          {/* Competitive Market Lens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-blue-400" strokeWidth={1} />
                <h3 className="text-sm font-semibold text-white/90">Market Lens</h3>
                <span className="text-[10px] text-white/30 ml-auto">{marketData.competitorCount} similar listings within 50 mi</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Avg Price', value: `$${marketData.avgPrice.toLocaleString()}` },
                  { label: 'Avg Days Listed', value: `${marketData.avgDays}` },
                  {
                    label: 'Price Trend',
                    value: marketData.priceTrend === 'rising' ? (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1} />
                        <span className="text-sm font-bold text-emerald-400">Rising</span>
                      </span>
                    ) : marketData.priceTrend === 'falling' ? (
                      <span className="flex items-center justify-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-400" strokeWidth={1} />
                        <span className="text-sm font-bold text-red-400">Falling</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1">
                        <Minus className="w-3.5 h-3.5 text-white/40" strokeWidth={1} />
                        <span className="text-sm font-bold text-white/60">Stable</span>
                      </span>
                    ),
                  },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.03]">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                    <div className="mt-0.5">{typeof stat.value === 'string' ? <p className="text-sm font-bold text-white">{stat.value}</p> : stat.value}</div>
                  </div>
                ))}
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
                  <div key={c.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${c.isNewer ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      <div>
                        <p className="text-xs text-white/70">{c.dealer}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/30">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5" strokeWidth={1} />
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

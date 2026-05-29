'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Car,
  Loader2,
  Search,
  DollarSign,
  ClipboardList,
  Tag,
  Wrench,
  Save,
  AlertCircle,
} from 'lucide-react';
import { useInventory } from '@/lib/dashboard/inventory-context';
import { ConditionScoreBadge } from '@/components/condition-score-badge';

export default function AddVehiclePage() {
  const router = useRouter();
  const { addVehicle } = useInventory();
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);

  // Dealer fields
  const [purchasePrice, setPurchasePrice] = useState('');
  const [reconditioningCost, setReconditioningCost] = useState('');
  const [listedPrice, setListedPrice] = useState('');
  const [status, setStatus] = useState<'acquired' | 'reconditioning' | 'listed' | 'sold' | 'wholesaled'>('acquired');
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');

  async function fetchVehicle() {
    if (!vin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'vin', value: vin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport(data.data);
      setListedPrice(data.data.marketValue.mid.toString());
    } catch (err) {
      setError('Failed to fetch vehicle data');
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!report) return;
    const vehicle = {
      vin: report.vin,
      make: report.make,
      model: report.model,
      year: report.year,
      color: report.color,
      bodyType: report.bodyType,
      conditionScore: report.conditionScore,
      titleBrands: report.titleBrands,
      redFlags: report.redFlags,
      marketValueMid: report.marketValue.mid,
      accidentCount: report.accidents.length,
      ticketCount: report.tickets.length,
      registrationStatus: report.registration.status,
      purchasePrice: Number(purchasePrice) || 0,
      reconditioningCost: Number(reconditioningCost) || 0,
      listedPrice: Number(listedPrice) || report.marketValue.mid,
      status,
      dateAcquired: new Date().toISOString().split('T')[0],
      source,
      notes,
    };
    addVehicle(vehicle);
    router.push('/dashboard/inventory');
  }

  const investment = (Number(purchasePrice) || 0) + (Number(reconditioningCost) || 0);
  const listed = Number(listedPrice) || report?.marketValue?.mid || 0;
  const profit = listed - investment;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <h1 className="text-xl sm:text-2xl font-bold text-white">Add Vehicle</h1>
        <p className="text-sm text-white/40 mt-1">Look up a VIN and add it to your inventory</p>
      </motion.div>

      {/* VIN Lookup */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
        className="mt-6"
      >
        <div className="p-1.5 rounded-[2rem] glass-card">
          <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Vehicle VIN</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter 17-character VIN"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm font-mono uppercase"
                maxLength={17}
              />
              <button
                onClick={fetchVehicle}
                disabled={loading || vin.length < 10}
                className="bg-white text-black px-5 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Look Up
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Report Preview + Dealer Form */}
      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mt-6 space-y-6"
        >
          {/* Vehicle Summary */}
          <div className="p-1.5 rounded-[2rem] glass-card">
            <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Car className="w-7 h-7 text-white/60" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">{report.year} {report.make} {report.model}</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-white/50">
                    <span>VIN: <span className="text-white/70 font-mono">{report.vin}</span></span>
                    <span>Color: <span className="text-white/70">{report.color}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <ConditionScoreBadge score={report.conditionScore} size="sm" />
                    {report.redFlags.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertCircle className="w-3 h-3" />
                        {report.redFlags.length} red flag{report.redFlags.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {report.titleBrands.map((b: string) => (
                      <span key={b} className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        b === 'clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {b.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Market Value</p>
                  <p className="text-xl font-bold text-white">${report.marketValue.mid.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Input Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-1.5 rounded-[2rem] glass-card">
              <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
                <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Pricing & Costs
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Purchase Price</label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Reconditioning Cost</label>
                    <input
                      type="number"
                      value={reconditioningCost}
                      onChange={(e) => setReconditioningCost(e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Listed Price</label>
                    <input
                      type="number"
                      value={listedPrice}
                      onChange={(e) => setListedPrice(e.target.value)}
                      placeholder={report.marketValue.mid.toString()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1.5">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/20 text-sm"
                    >
                      <option value="acquired" className="bg-[#0a0a0a]">Acquired</option>
                      <option value="reconditioning" className="bg-[#0a0a0a]">Reconditioning</option>
                      <option value="listed" className="bg-[#0a0a0a]">Listed</option>
                      <option value="sold" className="bg-[#0a0a0a]">Sold</option>
                      <option value="wholesaled" className="bg-[#0a0a0a]">Wholesaled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-1.5 rounded-[2rem] glass-card">
                <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-400" />
                    Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Source</label>
                      <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        placeholder="Auction, trade-in, wholesale..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1.5">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profit Preview */}
              <div className="p-1.5 rounded-[2rem] glass-card">
                <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-6">
                  <h3 className="text-sm font-semibold text-white/90 mb-4">Profit Preview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Total Investment</span>
                      <span className="text-white/70">${investment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Listed Price</span>
                      <span className="text-white/70">${listed.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 flex justify-between">
                      <span className="text-white/40">Est. Profit</span>
                      <span className={`font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}${profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Margin</span>
                      <span className={`font-medium ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {investment > 0 ? ((profit / investment) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4" />
              Add to Inventory
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

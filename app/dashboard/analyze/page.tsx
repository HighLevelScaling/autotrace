'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Loader2,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  Car,
} from 'lucide-react';
import { AcquisitionAnalysis } from '@/lib/acquisition-engine';

const ease = [0.32, 0.72, 0, 1] as const;

export default function AnalyzePage() {
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AcquisitionAnalysis[] | null>(null);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setError('Please upload a CSV or TXT file');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const vins: string[] = [];
      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim().toUpperCase());
        for (const part of parts) {
          if (part.length >= 10 && /^[A-HJ-NPR-Z0-9]+$/.test(part)) {
            vins.push(part.slice(0, 17));
          }
        }
      }
      if (vins.length === 0) {
        setError('No valid VINs found in file');
        setLoading(false);
        return;
      }
      if (vins.length > 1000) {
        setError('Maximum 1000 VINs allowed per batch');
        setLoading(false);
        return;
      }
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyze: true, vins: [...new Set(vins)] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Analysis failed');
        return;
      }
      setResults(data.data);
    } catch {
      setError('Failed to process file');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  function downloadCSV() {
    if (!results) return;
    const headers = ['VIN', 'Year', 'Make', 'Model', 'Score', 'Recommendation', 'Max Bid', 'Target List', 'Est Recon', 'Days to Sell', 'Floor Plan', 'Marketing', 'True Net Profit', 'Net Margin %', 'Risk Factors'];
    const rows = results.map(r => [
      r.vin, r.year, r.make, r.model, r.acquisitionScore, r.recommendation,
      r.maxBid, r.targetListedPrice, r.estimatedReconCost, r.estimatedDaysToSell,
      r.floorPlanTotalCost, r.marketingCost, r.trueNetProfit, r.netMarginPercent + '%',
      r.riskFactors.join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autotrace-acquisition-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const buyCount = results?.filter(r => r.recommendation === 'buy').length || 0;
  const cautionCount = results?.filter(r => r.recommendation === 'caution').length || 0;
  const avoidCount = results?.filter(r => r.recommendation === 'avoid').length || 0;
  const totalProfit = results?.reduce((sum, r) => sum + r.trueNetProfit, 0) || 0;

  return (
    <div className="py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={1} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Acquisition Analyzer</h1>
            <p className="text-xs text-white/40 mt-1">Upload auction run list — get buy/caution/avoid scores with max bids</p>
          </div>
        </div>
      </motion.div>

      {!results && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="mt-10"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl transition-all ${dragOver ? 'ring-2 ring-emerald-500/30' : ''}`}
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
          >
            <div className={`rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 sm:p-14 text-center transition-colors ${dragOver ? 'bg-emerald-500/5' : ''}`}>
              <input type="file" accept=".csv,.txt" onChange={handleInputChange} className="hidden" id="analyze-upload" />
              <label htmlFor="analyze-upload" className="cursor-pointer block">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
                  {loading ? <Loader2 className="w-8 h-8 text-white/40 animate-spin" /> : <Upload className="w-8 h-8 text-white/40" strokeWidth={1} />}
                </div>
                <p className="text-white/70 font-medium">{loading ? 'Analyzing...' : 'Drop auction run list CSV here'}</p>
                <p className="text-white/30 text-sm mt-2">One VIN per line or comma-separated. Max 1,000 VINs.</p>
              </label>
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
              className="mt-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" strokeWidth={1} />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}
        </motion.div>
      )}

      {results && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="mt-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { icon: CheckCircle2, color: 'text-emerald-400', label: 'Buy', value: buyCount },
              { icon: AlertTriangle, color: 'text-amber-400', label: 'Caution', value: cautionCount },
              { icon: XCircle, color: 'text-red-400', label: 'Avoid', value: avoidCount },
              { icon: DollarSign, color: 'text-blue-400', label: 'Total Est. Profit', value: `$${(totalProfit / 1000).toFixed(0)}k` },
              { icon: Car, color: 'text-white/40', label: 'Analyzed', value: results.length },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease, delay: i * 0.05 }}
                  className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
                >
                  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-4 text-center">
                    <Icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} strokeWidth={1} />
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 bg-white text-black pl-4 pr-5 py-2.5 rounded-full font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
            >
              <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                <Download className="w-3.5 h-3.5" strokeWidth={1} />
              </span>
              Export CSV
            </button>
            <button
              onClick={() => { setResults(null); setError(''); }}
              className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2.5 rounded-full font-medium text-sm hover:bg-white/10 transition-all"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
            >
              <Upload className="w-4 h-4" strokeWidth={1} />
              Upload Another
            </button>
          </div>

          {/* Results Table */}
          <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 pl-2 text-xs font-medium text-white/40 uppercase tracking-wider">Vehicle</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Rec</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right tracking-wider">Max Bid</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell tracking-wider">Target List</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell tracking-wider">Recon</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-center hidden md:table-cell tracking-wider">Days</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden sm:table-cell tracking-wider">Net Profit</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden sm:table-cell tracking-wider">Margin</th>
                    <th className="pb-3 pr-2 text-xs font-medium text-white/40 uppercase tracking-wider">Risks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}>
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-white/20 flex-shrink-0" strokeWidth={1} />
                          <div>
                            <p className="text-sm text-white/80">{r.year} {r.make} {r.model}</p>
                            <p className="text-[10px] text-white/30 font-mono">{r.vin}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${
                          r.acquisitionScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                          r.acquisitionScore >= 60 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {r.acquisitionScore}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-medium ${
                          r.recommendation === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          r.recommendation === 'caution' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {r.recommendation}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm font-mono text-white/80">${r.maxBid.toLocaleString()}</td>
                      <td className="py-3 text-right text-sm text-white/60 hidden lg:table-cell">${r.targetListedPrice.toLocaleString()}</td>
                      <td className="py-3 text-right text-sm text-white/60 hidden lg:table-cell">${r.estimatedReconCost.toLocaleString()}</td>
                      <td className="py-3 text-center text-sm text-white/60 hidden md:table-cell">{r.estimatedDaysToSell}</td>
                      <td className="py-3 text-right hidden sm:table-cell">
                        <span className={`text-sm font-medium ${r.trueNetProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {r.trueNetProfit >= 0 ? '+' : ''}${r.trueNetProfit.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 text-right hidden sm:table-cell">
                        <span className={`text-sm ${r.netMarginPercent >= 15 ? 'text-emerald-400' : r.netMarginPercent >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {r.netMarginPercent}%
                        </span>
                      </td>
                      <td className="py-3 pr-2">
                        <p className="text-[10px] text-white/30 max-w-[120px] truncate">
                          {r.riskFactors.length > 0 ? r.riskFactors.join(', ') : 'None'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Car,
} from 'lucide-react';
import { AcquisitionAnalysis } from '@/lib/acquisition-engine';

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
    } catch (err) {
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Acquisition Analyzer</h1>
            <p className="text-xs text-white/40">Upload auction run list — get buy/caution/avoid scores with max bids</p>
          </div>
        </div>
      </motion.div>

      {!results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          className="mt-8"
        >
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`p-1.5 rounded-[2rem] glass-card transition-all duration-300 ${dragOver ? 'ring-2 ring-emerald-500/30' : ''}`}
          >
            <div className={`rounded-[calc(2rem-0.375rem)] glass-card-inner p-8 sm:p-12 text-center transition-colors ${dragOver ? 'bg-emerald-500/5' : ''}`}>
              <input type="file" accept=".csv,.txt" onChange={handleInputChange} className="hidden" id="analyze-upload" />
              <label htmlFor="analyze-upload" className="cursor-pointer block">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {loading ? <Loader2 className="w-8 h-8 text-white/40 animate-spin" /> : <Upload className="w-8 h-8 text-white/40" strokeWidth={1.5} />}
                </div>
                <p className="text-white/70 font-medium">{loading ? 'Analyzing...' : 'Drop auction run list CSV here'}</p>
                <p className="text-white/30 text-sm mt-2">One VIN per line or comma-separated. Max 1,000 VINs.</p>
              </label>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </motion.div>
      )}

      {results && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }} className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 text-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-400">{buyCount}</p>
                <p className="text-[10px] text-white/40 uppercase">Buy</p>
              </div>
            </div>
            <div className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 text-center">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-amber-400">{cautionCount}</p>
                <p className="text-[10px] text-white/40 uppercase">Caution</p>
              </div>
            </div>
            <div className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 text-center">
                <XCircle className="w-5 h-5 text-red-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-red-400">{avoidCount}</p>
                <p className="text-[10px] text-white/40 uppercase">Avoid</p>
              </div>
            </div>
            <div className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 text-center">
                <DollarSign className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-blue-400">${(totalProfit / 1000).toFixed(0)}k</p>
                <p className="text-[10px] text-white/40 uppercase">Total Est. Profit</p>
              </div>
            </div>
            <div className="p-1.5 rounded-[1.5rem] glass-card">
              <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4 text-center">
                <Car className="w-5 h-5 text-white/40 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{results.length}</p>
                <p className="text-[10px] text-white/40 uppercase">Analyzed</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={downloadCSV} className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition-all">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => { setResults(null); setError(''); }} className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/10 transition-all">
              <Upload className="w-4 h-4" /> Upload Another
            </button>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto rounded-[1.5rem] glass-card">
            <div className="rounded-[calc(1.5rem-0.375rem)] glass-card-inner p-4">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-3 pl-2 text-xs font-medium text-white/40 uppercase">Vehicle</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase">Score</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase">Rec</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right">Max Bid</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell">Target List</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden lg:table-cell">Recon</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-center hidden md:table-cell">Days</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden sm:table-cell">Net Profit</th>
                    <th className="pb-3 text-xs font-medium text-white/40 uppercase text-right hidden sm:table-cell">Margin</th>
                    <th className="pb-3 pr-2 text-xs font-medium text-white/40 uppercase">Risks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pl-2">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-white/20 flex-shrink-0" />
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

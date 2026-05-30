'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileSpreadsheet, Loader2, Download, ArrowLeft, AlertTriangle, CheckCircle2, Car } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BulkReport } from '@/lib/types';

export default function BulkPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkReport[] | null>(null);
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
      // Try to extract VINs - could be comma-separated or one per line
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
        body: JSON.stringify({ bulk: true, vins: [...new Set(vins)] }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Batch processing failed');
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
    const headers = ['VIN', 'Year', 'Make', 'Model', 'Condition Score', 'Title Brands', 'Red Flags', 'Market Value', 'Accidents', 'Tickets', 'Registration', 'Status'];
    const rows = results.map(r => [
      r.vin, r.year, r.make, r.model, r.conditionScore,
      r.titleBrands.join('; '),
      r.redFlags.join('; '),
      r.marketValueMid,
      r.accidentCount,
      r.ticketCount,
      r.registrationStatus,
      r.status,
    ]);
    const csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autotrace-bulk-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="flex-1 relative min-h-[100dvh] overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" strokeWidth={1} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Bulk VIN Processing</h1>
              <p className="text-xs text-white/40">Upload a CSV file with up to 1,000 VINs</p>
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
              className={`p-1.5 rounded-[2rem] glass-card transition-all duration-300 ${dragOver ? 'ring-2 ring-indigo-500/30' : ''}`}
            >
              <div className={`rounded-[calc(2rem-0.375rem)] glass-card-inner p-8 sm:p-12 text-center transition-colors ${dragOver ? 'bg-indigo-500/5' : ''}`}>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleInputChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    {loading ? (
                      <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-white/40" strokeWidth={1} />
                    )}
                  </div>
                  <p className="text-white/70 font-medium">
                    {loading ? 'Processing...' : 'Drop CSV file here or click to browse'}
                  </p>
                  <p className="text-white/30 text-sm mt-2">
                    One VIN per line or comma-separated. Max 1,000 VINs.
                  </p>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="mt-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" strokeWidth={1} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Batch Complete</p>
                  <p className="text-xs text-white/40">{results.length} vehicles processed</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={() => { setResults(null); setError(''); }}
                  className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/10 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Upload Another
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-[2rem] glass-card">
              <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-4">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-3 pl-2 text-xs font-medium text-white/40 uppercase tracking-wider">Vehicle</th>
                      <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Score</th>
                      <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider">Title</th>
                      <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider hidden lg:table-cell">Red Flags</th>
                      <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider text-right">Value</th>
                      <th className="pb-3 text-xs font-medium text-white/40 uppercase tracking-wider text-center">Acc/Tkt</th>
                      <th className="pb-3 pr-2 text-xs font-medium text-white/40 uppercase tracking-wider">Reg</th>
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
                          <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
                            r.conditionScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                            r.conditionScore >= 55 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {r.conditionScore}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {r.titleBrands.slice(0, 2).map((b, j) => (
                              <span key={j} className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
                                b === 'clean' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {b.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 hidden lg:table-cell">
                          <p className="text-xs text-white/40 max-w-[200px] truncate">
                            {r.redFlags.length > 0 ? r.redFlags.join(', ') : 'None'}
                          </p>
                        </td>
                        <td className="py-3 text-right">
                          <p className="text-sm text-white/70">${r.marketValueMid.toLocaleString()}</p>
                        </td>
                        <td className="py-3 text-center">
                          <p className="text-xs text-white/40">{r.accidentCount}/{r.ticketCount}</p>
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
                            r.registrationStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            r.registrationStatus === 'expired' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {r.registrationStatus}
                          </span>
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
    </main>
  );
}

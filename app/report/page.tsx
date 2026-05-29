'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, Printer } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { ReportDashboard } from '@/components/report-dashboard';

function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const vin = searchParams.get('vin');
  const plate = searchParams.get('plate');
  const dl = searchParams.get('dl');
  const state = searchParams.get('state') || undefined;

  useEffect(() => {
    async function fetchReport() {
      let type: string | null = null;
      let value: string | null = null;

      if (vin) { type = 'vin'; value = vin; }
      else if (plate) { type = 'plate'; value = plate; }
      else if (dl) { type = 'dl'; value = dl; }

      if (!type || !value) {
        setError('No search parameter provided');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, value, state }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Failed to load report');
          return;
        }

        setReport(data.data);
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [vin, plate, dl, state]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          <p className="text-white/40 text-sm">Generating your vehicle report...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-xl font-semibold text-white mb-2">Unable to load report</h2>
          <p className="text-white/50 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>
        </motion.div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
    >
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </button>
        <button
          onClick={() => {
            const params = new URLSearchParams(window.location.search);
            window.open(`/report/print?${params.toString()}`, '_blank');
          }}
          className="inline-flex items-center gap-2 bg-white/5 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/10 transition-all"
        >
          <Printer className="w-4 h-4" />
          Print Report
        </button>
      </div>
      <ReportDashboard report={report} />
    </motion.div>
  );
}

export default function ReportPage() {
  return (
    <main className="flex-1 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-float-delayed" />
      </div>
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
        </div>
      }>
        <ReportContent />
      </Suspense>
    </main>
  );
}

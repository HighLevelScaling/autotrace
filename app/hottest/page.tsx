'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Loader2 } from 'lucide-react';
import { HottestCarsList } from '@/components/hottest-cars-list';

type Period = 'weekly' | 'monthly';

interface HottestCar {
  rank: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  wholesaleBook: number;
  retailPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  velocityScore: number;
  daysOnMarket: number;
  trend: 'up' | 'down' | 'flat';
}

export default function HottestPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [cars, setCars] = useState<HottestCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedPeriod, setLoadedPeriod] = useState<Period>(period);

  // Show the loading state the moment `period` changes — done during render
  // (React's recommended pattern) rather than synchronously inside the effect,
  // which react-hooks flags as a cascading-render risk.
  if (loadedPeriod !== period) {
    setLoadedPeriod(period);
    setLoading(true);
  }

  useEffect(() => {
    let active = true;
    fetch(`/api/hottest-cars?period=${period}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        if (active && data.success) setCars(data.cars);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  return (
    <main className="flex-1 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] animate-float-delayed" />
      </div>

      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 text-orange-400" strokeWidth={1} />
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Hottest Cars</h1>
                <p className="text-white/40 text-sm">
                  Highest retail-wholesale spreads in the market
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
              <button
                onClick={() => setPeriod('weekly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  period === 'weekly'
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  period === 'monthly'
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
            </div>
          ) : (
            <HottestCarsList cars={cars} />
          )}
        </motion.div>
      </div>
    </main>
  );
}

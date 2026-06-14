'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Gauge, FileWarning, TrendingUp, ScanLine, ArrowUpRight } from 'lucide-react';

interface VinScanAnimationProps {
  // Emits the VIN currently on screen so the page can prefill the search box.
  onTryVin?: (vin: string) => void;
}

const easeCustom = [0.32, 0.72, 0, 1] as const;

/**
 * Looping "live intelligence scan" hero animation shown BEFORE the VIN input.
 *
 * It demonstrates the real data layers the platform pulls (NHTSA decode,
 * NMVTIS title verification, recall checks, odometer audit, market value) so
 * the user sees the payoff before committing a VIN. Purely presentational —
 * all data here is illustrative sample output.
 *
 * Performance: only `transform`/`opacity` animate (GPU-safe), per the design
 * system's motion guardrails. No layout-triggering properties.
 */

// Each "insight" the scanner reveals, cycled one at a time.
const insights = [
  {
    icon: ShieldCheck,
    label: 'NMVTIS Title',
    value: 'Verified Clean',
    accent: 'text-emerald-400',
    ring: 'border-emerald-500/20 bg-emerald-500/10',
  },
  {
    icon: FileWarning,
    label: 'Open Recalls',
    value: '2 found · NHTSA',
    accent: 'text-amber-400',
    ring: 'border-amber-500/20 bg-amber-500/10',
  },
  {
    icon: Gauge,
    label: 'Odometer',
    value: 'No rollback',
    accent: 'text-sky-400',
    ring: 'border-sky-500/20 bg-sky-500/10',
  },
  {
    icon: TrendingUp,
    label: 'Market Value',
    value: '$24,500',
    accent: 'text-indigo-400',
    ring: 'border-indigo-500/20 bg-indigo-500/10',
  },
];

// A rotating sample VIN to make the scanner feel live without real input.
const sampleVins = [
  '1HGCM82633A004352',
  '5XYZU3LB0HG412889',
  'WAUFFAFL5DN012345',
  'JF1VA1C60K9812003',
];

export function VinScanAnimation({ onTryVin }: VinScanAnimationProps = {}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % insights.length), 2200);
    return () => clearInterval(id);
  }, []);

  const active = insights[index];
  const vin = sampleVins[index % sampleVins.length];
  const ActiveIcon = active.icon;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Double-bezel scanner shell */}
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6">
          {/* Sweeping scan line — continuous vertical translate */}
          <motion.div
            aria-hidden
            initial={{ y: '-100%' }}
            animate={{ y: '120%' }}
            transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
            className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent via-indigo-500/15 to-transparent"
          />

          {/* VIN readout */}
          <div className="flex items-center gap-2 mb-5">
            <ScanLine className="w-4 h-4 text-indigo-400" strokeWidth={1} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Scanning VIN</span>
            {onTryVin && (
              <button
                type="button"
                onClick={() => onTryVin(vin)}
                className="group ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-white/40 hover:text-indigo-300 transition-colors duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Try this VIN
                <ArrowUpRight
                  className="w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={1}
                />
              </button>
            )}
          </div>

          <div className="relative h-7 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={vin}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: easeCustom }}
                className="absolute inset-0 font-mono text-lg sm:text-xl tracking-[0.15em] text-white/90"
              >
                {vin}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Revealed insight — cycles in sync with the VIN */}
          <div className="relative h-[60px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.label}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ duration: 0.6, ease: easeCustom }}
                className={`absolute inset-0 flex items-center gap-3 px-4 rounded-2xl border ${active.ring}`}
              >
                <ActiveIcon className={`w-5 h-5 ${active.accent}`} strokeWidth={1} />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">{active.label}</p>
                  <p className={`text-sm font-semibold ${active.accent}`}>{active.value}</p>
                </div>
                <span className="ml-auto text-[10px] text-white/30 tabular-nums">
                  {index + 1}/{insights.length}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            {insights.map((_, i) => (
              <motion.span
                key={i}
                animate={{ scale: i === index ? 1 : 0.6, opacity: i === index ? 1 : 0.3 }}
                transition={{ duration: 0.4, ease: easeCustom }}
                className="w-1.5 h-1.5 rounded-full bg-white/60"
              />
            ))}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-white/30">
        Real-time intelligence from NHTSA &amp; NMVTIS — pulled the moment you search.
      </p>
    </div>
  );
}

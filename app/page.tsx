'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SearchIsland } from '@/components/search-island';
import { VinScanAnimation } from '@/components/vin-scan-animation';
import {
  Shield,
  Clock,
  FileText,
  Search,
  FileSpreadsheet,
  Zap,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

const easeCustom = [0.32, 0.72, 0, 1] as const;

const features = [
  {
    icon: Shield,
    title: 'DMV Verified',
    description: 'Official validation from state DMV records',
  },
  {
    icon: FileText,
    title: 'Full History',
    description: 'Accidents, tickets, service & transfers',
  },
  {
    icon: Clock,
    title: 'Instant Results',
    description: 'Comprehensive report in seconds',
  },
];

const b2bFeatures = [
  {
    icon: FileSpreadsheet,
    title: 'Bulk Processing',
    description: 'Upload 1,000 VINs via CSV',
    href: '/bulk',
  },
  {
    icon: BarChart3,
    title: 'Condition Scoring',
    description: '1-100 score per vehicle',
  },
  {
    icon: Zap,
    title: 'Red Flag Detection',
    description: 'Auto-identify high-risk vehicles',
  },
];

export default function HomePage() {
  const router = useRouter();
  // Prefill signal from the hero scanner → search box. Nonce lets the same
  // VIN re-trigger the fill if the user clicks "Try this VIN" twice.
  const [prefill, setPrefill] = useState<{ vin: string; nonce: number } | null>(null);

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center overflow-hidden bg-[#050505]">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] animate-float-delayed" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px] animate-pulse-glow" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-12 md:pt-32 md:pb-16">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeCustom }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 border border-white/10 text-white/50">
            <Search className="w-3 h-3" strokeWidth={1} />
            Vehicle History Reports
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeCustom, delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
        >
          Uncover Your Vehicle&apos;s
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Story
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeCustom, delay: 0.2 }}
          className="text-center mt-5 sm:mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          Search by VIN, license plate, or driver&apos;s license to access DMV
          validation, registration, tickets, accidents, and full service history.
        </motion.p>

        {/* Live intelligence scan — primes the user on the payoff before input */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: easeCustom, delay: 0.35 }}
          className="mt-10 sm:mt-12"
        >
          <VinScanAnimation onTryVin={(vin) => setPrefill({ vin, nonce: Date.now() })} />
        </motion.div>

        {/* Search Island */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeCustom, delay: 0.5 }}
          className="mt-10 sm:mt-12"
        >
          <SearchIsland prefill={prefill} />
        </motion.div>
      </section>

      {/* Trust Features — Asymmetrical Bento Grid */}
      <motion.section
        initial={{ opacity: 0, y: 64, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: easeCustom }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-24"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">
          {/* Large card */}
          <div className="col-span-1 md:col-span-8 md:row-span-2">
            <div className="h-full p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
              <div className="h-full rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 md:p-8 flex flex-col justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  <Shield
                    className="w-5 h-5 text-white/40"
                    strokeWidth={1}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/80">
                    {features[0].title}
                  </h3>
                  <p className="mt-1 text-xs text-white/35 max-w-xs">
                    {features[0].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stacked cards */}
          {features.slice(1).map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="col-span-1 md:col-span-4">
                <div className="h-full p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
                  <div className="h-full rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 flex flex-col justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                      <Icon
                        className="w-5 h-5 text-white/40"
                        strokeWidth={1}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/80">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-xs text-white/35">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* B2B Section — Editorial Split */}
      <motion.section
        initial={{ opacity: 0, y: 64, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: easeCustom }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 py-24"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Left half */}
          <div className="w-full md:w-1/2 flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 border border-white/10 text-white/50">
              <Zap className="w-3 h-3" strokeWidth={1} />
              For Dealers & Businesses
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              Built for
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Volume & Speed
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-white/40 max-w-sm leading-relaxed">
              Dealerships, auctions, lenders, and fleet managers need more than
              one-off lookups. Process thousands of vehicles with intelligent
              scoring and automated risk detection.
            </p>

            {/* CTA Button-in-Button */}
            <button
              onClick={() => router.push('/bulk')}
              className="group mt-8 inline-flex items-center gap-3 rounded-full px-6 py-3 bg-white text-black font-semibold active:scale-[0.98] transition-transform duration-500"
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
            >
              <span className="text-sm">Try Bulk Upload</span>
              <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center overflow-hidden">
                <ArrowUpRight
                  className="w-4 h-4 text-black transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-[1px]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                  strokeWidth={1}
                />
              </span>
            </button>
          </div>

          {/* Right half — Staggered cards */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {b2bFeatures.map((feature, i) => {
              const Icon = feature.icon;
              const isClickable = !!feature.href;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: easeCustom,
                    delay: i * 0.1,
                  }}
                  viewport={{ once: true, margin: '-50px' }}
                  onClick={() => isClickable && router.push(feature.href!)}
                  className={`w-full p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl transition-colors duration-500 hover:bg-white/[0.05] hover:border-white/[0.12] ${
                    i === 1 ? 'md:ml-6' : i === 2 ? 'md:ml-12' : ''
                  } ${isClickable ? 'cursor-pointer' : ''}`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
                >
                  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Icon
                        className="w-5 h-5 text-white/40"
                        strokeWidth={1}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white/80">
                        {feature.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/35">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </main>
  );
}

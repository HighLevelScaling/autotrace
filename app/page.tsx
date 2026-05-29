'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { SearchIsland } from '@/components/search-island';
import { Shield, Clock, FileText, Search, FileSpreadsheet, Zap, BarChart3 } from 'lucide-react';

const features = [
  { icon: Shield, title: 'DMV Verified', description: 'Official validation from state DMV records' },
  { icon: FileText, title: 'Full History', description: 'Accidents, tickets, service & transfers' },
  { icon: Clock, title: 'Instant Results', description: 'Comprehensive report in seconds' },
];

const b2bFeatures = [
  { icon: FileSpreadsheet, title: 'Bulk Processing', description: 'Upload 1,000 VINs via CSV', href: '/bulk' },
  { icon: BarChart3, title: 'Condition Scoring', description: '1-100 score per vehicle' },
  { icon: Zap, title: 'Red Flag Detection', description: 'Auto-identify high-risk vehicles' },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex-1 relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[140px] animate-float-delayed" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-blue-600/5 blur-[120px] animate-pulse-glow" />
      </div>

      {/* Top Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">AutoTrace</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/bulk')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Bulk Upload
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium hover:bg-indigo-500/20 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Dealer Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            <Search className="w-3 h-3" />
            Vehicle History Reports
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
        >
          Uncover Your Vehicle's
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Complete Story
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          className="text-center mt-5 sm:mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          Search by VIN, license plate, or driver's license to access DMV validation, registration, tickets, accidents, and full service history.
        </motion.p>

        {/* Search Island */}
        <div className="mt-10 sm:mt-12">
          <SearchIsland />
        </div>

        {/* Trust Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
          className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                </div>
                <h3 className="text-sm font-semibold text-white/80">{feature.title}</h3>
                <p className="mt-1 text-xs text-white/35">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* B2B Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.7 }}
          className="mt-16 sm:mt-20"
        >
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/50">
              <Zap className="w-3 h-3" />
              For Dealers & Businesses
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">B2B Tools</h2>
            <p className="mt-2 text-sm text-white/40 max-w-md mx-auto">
              Built for dealerships, auctions, lenders, and fleet managers who need volume and speed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {b2bFeatures.map((feature, i) => {
              const Icon = feature.icon;
              const isClickable = !!feature.href;
              return (
                <div
                  key={i}
                  onClick={() => isClickable && router.push(feature.href!)}
                  className={`flex flex-col items-center text-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] transition-all ${
                    isClickable ? 'cursor-pointer hover:bg-white/[0.05] hover:border-white/10' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white/40" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-white/80">{feature.title}</h3>
                  <p className="mt-1 text-xs text-white/35">{feature.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/bulk')}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Try Bulk Upload
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

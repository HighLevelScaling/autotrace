'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Gavel,
  Car,
  Gauge,
  Clock,
  MapPin,
  Activity,
  Zap,
  ExternalLink,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

const ease = [0.32, 0.72, 0, 1] as const;
const SOURCES = [
  { id: 'all', label: 'All Auctions', color: 'text-white' },
  { id: 'manheim', label: 'Manheim', color: 'text-indigo-400' },
  { id: 'adesa', label: 'ADESA', color: 'text-blue-400' },
  { id: 'copart', label: 'Copart', color: 'text-amber-400' },
  { id: 'iaai', label: 'IAAI', color: 'text-rose-400' },
];

interface AuctionVehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
  condition: string;
  color: string;
  auctionSource: string;
  auctionLocation: string;
  auctionDate: string;
  saleType: string;
  status: string;
  currentBid?: number;
  buyNowPrice?: number;
  estimatedRetail: number;
  conditionScore: number;
  titleStatus: string;
  runNumber: string;
  lane: string;
}

const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono text-xs">{timeLeft}</span>;
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    manheim: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    adesa: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    copart: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iaai: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[source] || 'bg-white/5 text-white/40 border-white/10'}`}>
      {source}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { text: string; class: string }> = {
    live: { text: '● LIVE', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse' },
    upcoming: { text: 'Upcoming', class: 'bg-white/5 text-white/50 border-white/10' },
    pending: { text: 'Pending', class: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    sold: { text: 'Sold', class: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  };
  const cfg = configs[status] || configs.upcoming;
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cfg.class}`}>
      {cfg.text}
    </span>
  );
}

export default function AuctionsPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<AuctionVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchAuctions = useCallback(async () => {
    try {
      const res = await fetch(`/api/auctions?source=${sourceFilter}&search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setVehicles(data.vehicles || []);
      setLastUpdated(data.lastUpdated || '');
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [sourceFilter, searchQuery]);

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      setCredits(data.balance ?? 0);
    } catch {
      setCredits(0);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAuctions();
     
    fetchCredits();
    const interval = setInterval(fetchAuctions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchAuctions, fetchCredits]);

  const liveCount = vehicles.filter(v => v.status === 'live').length;
  const upcomingCount = vehicles.filter(v => v.status === 'upcoming').length;

  async function handlePullHistory(vin: string) {
    if (!credits || credits < 0.5) {
      router.push('/credits');
      return;
    }

    // Deduct credits then redirect to report
    const deductRes = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: `Auction lookup: ${vin}` }),
    });

    if (deductRes.ok) {
      const newBalance = await deductRes.json();
      setCredits(newBalance.balance);
      router.push(`/report?vin=${encodeURIComponent(vin)}`);
    } else {
      router.push('/credits');
    }
  }

  return (
    <main className="min-h-[100dvh] bg-[#050505] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/8 blur-[140px] animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
              <Gavel className="w-3 h-3" strokeWidth={1} />
              Live Auction Monitor
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Auction<span className="text-indigo-400">Watch</span>
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Real-time feeds from Manheim, ADESA, Copart & IAAI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
              <div className="rounded-full bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] px-4 py-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-white/30" strokeWidth={1} />
                <span className="text-sm font-medium text-white">${(credits ?? 0).toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/credits')}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white text-black text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
            >
              <span>Top Up</span>
              <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5">
                <Zap className="w-3 h-3" strokeWidth={1} />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
        >
          {[
            { label: 'Live Auctions', value: liveCount.toString(), icon: Activity, color: 'text-emerald-400' },
            { label: 'Upcoming', value: upcomingCount.toString(), icon: Clock, color: 'text-blue-400' },
            { label: 'Total Tracked', value: vehicles.length.toString(), icon: Car, color: 'text-indigo-400' },
            { label: 'Sources', value: '4', icon: MapPin, color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} strokeWidth={1} />
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.2 }}
          className="mb-6 space-y-3"
        >
          <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] px-4 py-3 flex items-center gap-3">
              <Search className="w-4 h-4 text-white/25" strokeWidth={1} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by make, model, VIN, or year..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSourceFilter(s.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  sourceFilter === s.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Vehicle Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Activity className="w-8 h-8 text-white/20 animate-spin" strokeWidth={1} />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Car className="w-10 h-10 text-white/10 mx-auto mb-3" strokeWidth={1} />
            <p className="text-white/30 text-sm">No auctions match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((vehicle, i) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: i * 0.03 }}
                viewport={{ once: true, margin: '-60px' }}
                className="group"
              >
                <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.05] hover:border-white/10">
                  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        <SourceBadge source={vehicle.auctionSource} />
                        <StatusBadge status={vehicle.status} />
                      </div>
                      {vehicle.status === 'live' && (
                        <span className="text-[10px] text-emerald-400 font-mono">
                          <CountdownTimer targetDate={vehicle.auctionDate} />
                        </span>
                      )}
                    </div>

                    {/* Vehicle Info */}
                    <h3 className="text-lg font-semibold text-white leading-tight">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-white/30">{vehicle.trim} · {vehicle.color}</p>

                    {/* Meta */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                        <span className="text-white/40">{vehicle.mileage.toLocaleString()} mi</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
                        <span className="text-white/40 truncate">{vehicle.auctionLocation}</span>
                      </div>
                    </div>

                    {/* Condition */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        vehicle.conditionScore >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                        vehicle.conditionScore >= 65 ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        Score: {vehicle.conditionScore}
                      </span>
                      <span className="text-[10px] text-white/30">{vehicle.condition}</span>
                      {vehicle.titleStatus !== 'Clean' && (
                        <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                          {vehicle.titleStatus}
                        </span>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <div className="flex items-end justify-between">
                        <div>
                          {vehicle.currentBid && (
                            <p className="text-xs text-white/30">Current Bid</p>
                          )}
                          {vehicle.buyNowPrice && (
                            <p className="text-xs text-white/30">Buy Now</p>
                          )}
                          <p className="text-xs text-white/20 mt-1">Est. Retail</p>
                        </div>
                        <div className="text-right">
                          {vehicle.currentBid && (
                            <p className="text-sm font-bold text-white">{formatCurrency(vehicle.currentBid)}</p>
                          )}
                          {vehicle.buyNowPrice && (
                            <p className="text-sm font-bold text-emerald-400">{formatCurrency(vehicle.buyNowPrice)}</p>
                          )}
                          <p className="text-xs text-white/40 mt-1">{formatCurrency(vehicle.estimatedRetail)}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handlePullHistory(vehicle.vin)}
                        className="flex-1 group/btn inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 bg-white text-black text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]"
                      >
                        <span>Pull History ($0.50)</span>
                        <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5">
                          <ExternalLink className="w-3 h-3" strokeWidth={1} />
                        </span>
                      </button>
                    </div>

                    {(!credits || credits < 0.5) && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-amber-400">
                        <AlertTriangle className="w-3 h-3" strokeWidth={1} />
                        <span>Insufficient credits — click to top up</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {lastUpdated && (
          <p className="mt-6 text-center text-[10px] text-white/20">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </p>
        )}
      </div>
    </main>
  );
}

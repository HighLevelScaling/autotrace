'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Car,
  Gauge,
  Fuel,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
} from 'lucide-react';

// ─── Mock live price data ───
interface PricePoint {
  month: string;
  price: number;
}

interface VehicleListing {
  id: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  msrp: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair';
  engine: string;
  fuel: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  daysOnMarket: number;
  history: PricePoint[];
}

const categories = ['All', 'Sedan', 'SUV', 'Truck', 'Luxury', 'EV', 'Sports'];

const listings: VehicleListing[] = [
  {
    id: '1',
    year: 2023,
    make: 'Toyota',
    model: 'Camry',
    trim: 'XSE',
    price: 28450,
    msrp: 33500,
    mileage: 12400,
    condition: 'excellent',
    engine: '2.5L I4',
    fuel: 'Gas',
    category: 'Sedan',
    trend: 'down',
    trendPercent: 2.3,
    daysOnMarket: 18,
    history: [
      { month: 'Jan', price: 29100 },
      { month: 'Feb', price: 28900 },
      { month: 'Mar', price: 28700 },
      { month: 'Apr', price: 28600 },
      { month: 'May', price: 28450 },
    ],
  },
  {
    id: '2',
    year: 2024,
    make: 'Tesla',
    model: 'Model Y',
    trim: 'Long Range',
    price: 41900,
    msrp: 48990,
    mileage: 3200,
    condition: 'excellent',
    engine: 'Dual Motor',
    fuel: 'Electric',
    category: 'EV',
    trend: 'up',
    trendPercent: 4.1,
    daysOnMarket: 7,
    history: [
      { month: 'Jan', price: 40200 },
      { month: 'Feb', price: 40600 },
      { month: 'Mar', price: 41100 },
      { month: 'Apr', price: 41500 },
      { month: 'May', price: 41900 },
    ],
  },
  {
    id: '3',
    year: 2022,
    make: 'BMW',
    model: 'X5',
    trim: 'M50i',
    price: 67800,
    msrp: 82300,
    mileage: 28900,
    condition: 'good',
    engine: '4.4L V8',
    fuel: 'Gas',
    category: 'Luxury',
    trend: 'stable',
    trendPercent: 0.4,
    daysOnMarket: 32,
    history: [
      { month: 'Jan', price: 67400 },
      { month: 'Feb', price: 67500 },
      { month: 'Mar', price: 67600 },
      { month: 'Apr', price: 67700 },
      { month: 'May', price: 67800 },
    ],
  },
  {
    id: '4',
    year: 2023,
    make: 'Ford',
    model: 'F-150',
    trim: 'Lariat',
    price: 52900,
    msrp: 58900,
    mileage: 15600,
    condition: 'good',
    engine: '3.5L V6 EcoBoost',
    fuel: 'Gas',
    category: 'Truck',
    trend: 'down',
    trendPercent: 1.8,
    daysOnMarket: 24,
    history: [
      { month: 'Jan', price: 53800 },
      { month: 'Feb', price: 53600 },
      { month: 'Mar', price: 53400 },
      { month: 'Apr', price: 53100 },
      { month: 'May', price: 52900 },
    ],
  },
  {
    id: '5',
    year: 2024,
    make: 'Porsche',
    model: '911',
    trim: 'Carrera S',
    price: 129500,
    msrp: 138400,
    mileage: 1800,
    condition: 'excellent',
    engine: '3.0L H6',
    fuel: 'Gas',
    category: 'Sports',
    trend: 'up',
    trendPercent: 1.2,
    daysOnMarket: 12,
    history: [
      { month: 'Jan', price: 127800 },
      { month: 'Feb', price: 128200 },
      { month: 'Mar', price: 128700 },
      { month: 'Apr', price: 129100 },
      { month: 'May', price: 129500 },
    ],
  },
  {
    id: '6',
    year: 2023,
    make: 'Honda',
    model: 'CR-V',
    trim: 'Touring',
    price: 32900,
    msrp: 36800,
    mileage: 18900,
    condition: 'good',
    engine: '1.5L I4 Turbo',
    fuel: 'Gas',
    category: 'SUV',
    trend: 'down',
    trendPercent: 3.5,
    daysOnMarket: 21,
    history: [
      { month: 'Jan', price: 34000 },
      { month: 'Feb', price: 33700 },
      { month: 'Mar', price: 33400 },
      { month: 'Apr', price: 33100 },
      { month: 'May', price: 32900 },
    ],
  },
  {
    id: '7',
    year: 2024,
    make: 'Rivian',
    model: 'R1T',
    trim: 'Adventure',
    price: 71900,
    msrp: 78900,
    mileage: 4500,
    condition: 'excellent',
    engine: 'Quad Motor',
    fuel: 'Electric',
    category: 'Truck',
    trend: 'up',
    trendPercent: 5.2,
    daysOnMarket: 9,
    history: [
      { month: 'Jan', price: 68300 },
      { month: 'Feb', price: 69200 },
      { month: 'Mar', price: 70100 },
      { month: 'Apr', price: 71000 },
      { month: 'May', price: 71900 },
    ],
  },
  {
    id: '8',
    year: 2022,
    make: 'Mercedes-Benz',
    model: 'S-Class',
    trim: 'S 580',
    price: 94500,
    msrp: 124000,
    mileage: 22100,
    condition: 'good',
    engine: '4.0L V8',
    fuel: 'Gas',
    category: 'Luxury',
    trend: 'down',
    trendPercent: 6.8,
    daysOnMarket: 45,
    history: [
      { month: 'Jan', price: 101200 },
      { month: 'Feb', price: 99900 },
      { month: 'Mar', price: 98000 },
      { month: 'Apr', price: 96200 },
      { month: 'May', price: 94500 },
    ],
  },
];

// ─── Helpers ───
const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const trendIcon = (trend: string) => {
  if (trend === 'up') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1} />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-rose-400" strokeWidth={1} />;
  return <Minus className="w-3.5 h-3.5 text-white/30" strokeWidth={1} />;
};

const Sparkline = ({ data, trend }: { data: PricePoint[]; trend: string }) => {
  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.price - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(' ');
  const color = trend === 'up' ? '#34d399' : trend === 'down' ? '#fb7185' : '#ffffff50';
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-10 opacity-60">
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={points} />
      <polygon fill={`${color}20`} points={`0,100 ${points} 100,100`} />
    </svg>
  );
};

// ─── Components ───
function MarketOverview() {
  const stats = [
    { label: 'Avg. Sedan Price', value: '$28,450', change: '-2.3%', trend: 'down' as const },
    { label: 'Avg. SUV Price', value: '$34,200', change: '-1.1%', trend: 'down' as const },
    { label: 'Avg. Truck Price', value: '$52,900', change: '+0.8%', trend: 'up' as const },
    { label: 'EV Price Index', value: '$56,400', change: '+4.1%', trend: 'up' as const },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: i * 0.08 }}
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">{stat.label}</p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {trendIcon(stat.trend)}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ListingCard({ listing, index }: { listing: VehicleListing; index: number }) {
  const savings = listing.msrp - listing.price;
  const savingsPercent = ((savings / listing.msrp) * 100).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: index * 0.06 }}
      viewport={{ once: true, margin: '-60px' }}
      className="group"
    >
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/[0.05] hover:border-white/10">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                  {listing.category}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.15em] font-medium px-2 py-0.5 rounded-full ${
                    listing.condition === 'excellent'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : listing.condition === 'good'
                      ? 'text-amber-400 bg-amber-500/10'
                      : 'text-white/40 bg-white/5'
                  }`}
                >
                  {listing.condition}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-white leading-tight">
                {listing.year} {listing.make} {listing.model}
              </h3>
              <p className="text-xs text-white/30">{listing.trim}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-white">{formatPrice(listing.price)}</p>
              <p className="text-[10px] text-white/25 line-through">MSRP {formatPrice(listing.msrp)}</p>
              {savings > 0 && (
                <p className="text-[10px] text-emerald-400 font-medium">Save {savingsPercent}%</p>
              )}
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-4">
            <Sparkline data={listing.history} trend={listing.trend} />
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
              <span className="text-[11px] text-white/40">{listing.mileage.toLocaleString()} mi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
              <span className="text-[11px] text-white/40">{listing.fuel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white/25" strokeWidth={1} />
              <span className="text-[11px] text-white/40">{listing.daysOnMarket}d on market</span>
            </div>
          </div>

          {/* Trend pill */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/[0.05]">
              {trendIcon(listing.trend)}
              <span
                className={`text-[10px] font-medium ${
                  listing.trend === 'up'
                    ? 'text-emerald-400'
                    : listing.trend === 'down'
                    ? 'text-rose-400'
                    : 'text-white/30'
                }`}
              >
                {listing.trend === 'up' ? '+' : listing.trend === 'down' ? '-' : ''}
                {listing.trendPercent}% 30d trend
              </span>
            </div>
            <button className="group/btn inline-flex items-center gap-2 rounded-full px-4 py-2 bg-white text-black text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98]">
              <span>Details</span>
              <span className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-[1px]">
                <ArrowUpRight className="w-3 h-3" strokeWidth={1} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───
export default function PriceBeaconPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        l.make.toLowerCase().includes(q) ||
        l.model.toLowerCase().includes(q) ||
        l.year.toString().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-[100dvh] bg-[#050505] text-white overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[140px] animate-float-delayed" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full bg-purple-600/5 blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-center mb-6"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            <DollarSign className="w-3 h-3" strokeWidth={1} />
            Live Market Intelligence
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]"
        >
          PriceBeacon
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Live Vehicle Pricing
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
          className="text-center mt-5 sm:mt-6 text-base sm:text-lg text-white/40 max-w-xl mx-auto leading-relaxed"
        >
          Real-time market data, depreciation curves, and pricing intelligence for every make and model.
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
          className="mt-10 max-w-xl mx-auto"
        >
          <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] px-4 py-3 flex items-center gap-3">
              <Search className="w-4 h-4 text-white/25" strokeWidth={1} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by make, model, or year..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Category filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.4 }}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Market Overview */}
        <div className="mt-16">
          <MarketOverview />
        </div>

        {/* Listings grid */}
        <div className="mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Live Listings</h2>
              <p className="text-xs text-white/30 mt-1">
                {filtered.length} vehicles tracked • updated every 15 minutes
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1} />
              <span className="hidden sm:inline">Live feed</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Car className="w-10 h-10 text-white/10 mx-auto mb-3" strokeWidth={1} />
              <p className="text-white/30 text-sm">No vehicles match your search.</p>
            </div>
          )}
        </div>

        {/* Insights section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mt-24"
        >
          <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
                    <BarChart3 className="w-3 h-3" strokeWidth={1} />
                    Market Intelligence
                  </span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-white">
                    Know the market before you buy
                  </h2>
                  <p className="mt-3 text-sm text-white/40 leading-relaxed">
                    PriceBeacon tracks millions of listings nationwide. Our algorithms detect
                    depreciation curves, seasonal trends, and regional price deltas so you
                    never overpay.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/[0.05]">
                      <p className="text-lg font-bold text-white">14M+</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Listings tracked</p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/[0.05]">
                      <p className="text-lg font-bold text-white">$1.2B</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Market volume</p>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/[0.05]">
                      <p className="text-lg font-bold text-white">97.3%</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider">Price accuracy</p>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-[calc(2rem-0.375rem)]" />
                  <div className="relative p-6 space-y-4">
                    {[
                      { label: 'Sedan avg. depreciation', value: '-12%', color: 'text-rose-400' },
                      { label: 'EV avg. appreciation', value: '+4.1%', color: 'text-emerald-400' },
                      { label: 'Truck market stability', value: '-0.8%', color: 'text-amber-400' },
                      { label: 'Luxury segment volatility', value: '-6.8%', color: 'text-rose-400' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <span className="text-sm text-white/50">{item.label}</span>
                        <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

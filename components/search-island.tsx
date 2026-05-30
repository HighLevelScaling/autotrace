'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Car, CreditCard, IdCard, Loader2, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

const tabs = [
  { id: 'vin' as const, label: 'VIN', icon: Car, placeholder: 'Enter 17-character VIN...', example: '1HGCV1F3XNA123456' },
  { id: 'plate' as const, label: 'License Plate', icon: CreditCard, placeholder: 'Enter license plate...', example: 'ABC123' },
  { id: 'dl' as const, label: "Driver's License", icon: IdCard, placeholder: 'Enter DL number...', example: 'D12345678' },
];

const STATES = ['CA','TX','FL','NY','PA','IL','OH','GA','NC','MI','NJ','VA','WA','AZ','MA'];

export function SearchIsland() {
  const [activeTab, setActiveTab] = useState<'vin' | 'plate' | 'dl'>('vin');
  const [value, setValue] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, value: value.trim(), state: state || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      const params = new URLSearchParams();
      params.set(activeTab, value.trim());
      if (state) params.set('state', state);
      router.push(`/report?${params.toString()}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      {/* Outer Bezel */}
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        {/* Inner Core */}
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-2">
          {/* Tabs */}
          <div className="flex gap-1 p-1 mb-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setValue(''); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={handleSearch} className="px-2 pb-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={activeTabData.placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  disabled={loading}
                />
                {activeTab === 'plate' && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="relative">
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="appearance-none bg-white/5 border border-white/10 rounded-lg pl-2.5 pr-7 py-2 text-xs text-white/70 focus:outline-none focus:border-white/20 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] cursor-pointer"
                      >
                        <option value="" className="bg-[#0a0a0a]">State</option>
                        {STATES.map((s) => (
                          <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" strokeWidth={1} />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="group rounded-full px-6 py-3.5 bg-white text-black font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2.5"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1} />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                    <Search className="w-4 h-4" strokeWidth={1} />
                  </span>
                )}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            {error && (
              <p className="mt-2 text-red-400 text-sm px-1">{error}</p>
            )}
            <p className="mt-2 text-white/25 text-xs px-1">
              Example: {activeTabData.example}
            </p>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

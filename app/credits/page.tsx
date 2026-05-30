'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Clock,
  DollarSign,
  History,
} from 'lucide-react';

const ease = [0.32, 0.72, 0, 1] as const;
const COST_PER_PULL = 0.5;

const PACKS = [
  { pulls: 10, price: 5, popular: false },
  { pulls: 25, price: 12, popular: true },
  { pulls: 50, price: 22, popular: false },
  { pulls: 100, price: 40, popular: false },
];

interface Transaction {
  type: 'purchase' | 'deduction';
  amount: number;
  description: string;
  timestamp: string;
}

function CreditsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  const purchasedCredits = searchParams.get('credits');

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  async function fetchCredits() {
    try {
      const res = await fetch('/api/credits');
      const data = await res.json();
      setBalance(data.balance ?? 0);
      setHistory(data.transactions || []);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCredits();
  }, []);

  async function handleCheckout(pulls: number) {
    setCheckoutLoading(pulls);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packSize: pulls }),
      });
      const data = await res.json();
      if (data.url) {
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = data.url;
      }
    } catch {
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  }

  const pullsRemaining = Math.floor(balance / COST_PER_PULL);

  return (
    <main className="min-h-[100dvh] bg-[#050505] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-600/8 blur-[140px] animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1} />
          Back to AutoTrace
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            <CreditCard className="w-3 h-3" strokeWidth={1} />
            Credits & Billing
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Your <span className="text-indigo-400">Credits</span>
          </h1>
          <p className="mt-2 text-sm text-white/40">
            $0.50 per vehicle history pull. Buy credits in packs.
          </p>
        </motion.div>

        {/* Alerts */}
        {success && purchasedCredits && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-1.5 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" strokeWidth={1} />
              <p className="text-sm text-emerald-400">
                Payment successful! {purchasedCredits} credits added to your balance.
              </p>
            </div>
          </motion.div>
        )}
        {canceled && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-1.5 rounded-[2rem] bg-amber-500/10 border border-amber-500/20"
          >
            <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" strokeWidth={1} />
              <p className="text-sm text-amber-400">Payment canceled. No charges were made.</p>
            </div>
          </motion.div>
        )}

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.1 }}
          className="mt-8 p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Current Balance</p>
                <p className="text-4xl sm:text-5xl font-bold text-white mt-1">
                  ${balance.toFixed(2)}
                </p>
                <p className="text-sm text-white/40 mt-2">
                  {pullsRemaining} pulls remaining at $0.50 each
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Total Spent</p>
                  <p className="text-lg font-bold text-white mt-1">
                    ${history.filter(t => t.type === 'deduction').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium">Total Purchased</p>
                  <p className="text-lg font-bold text-white mt-1">
                    ${history.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit Packs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Buy Credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKS.map((pack, i) => (
              <motion.div
                key={pack.pulls}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.05 }}
                className={`p-1.5 rounded-[2rem] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  pack.popular
                    ? 'bg-indigo-500/10 border border-indigo-500/20'
                    : 'bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05]'
                }`}
              >
                <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-5 flex flex-col h-full">
                  {pack.popular && (
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-medium mb-2">
                      Most Popular
                    </span>
                  )}
                  <p className="text-2xl font-bold text-white">{pack.pulls} Pulls</p>
                  <p className="text-sm text-white/40 mt-1">${pack.price.toFixed(2)}</p>
                  <p className="text-[10px] text-white/20 mt-1">
                    ${(pack.price / pack.pulls).toFixed(3)} per pull
                  </p>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleCheckout(pack.pulls)}
                    disabled={checkoutLoading === pack.pulls}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                      pack.popular
                        ? 'bg-indigo-500 text-white hover:bg-indigo-400'
                        : 'bg-white text-black hover:bg-white/90'
                    }`}
                  >
                    {checkoutLoading === pack.pulls ? (
                      <Zap className="w-3.5 h-3.5 animate-spin" strokeWidth={1} />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" strokeWidth={1} />
                    )}
                    {checkoutLoading === pack.pulls ? 'Loading...' : 'Buy Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.3 }}
          className="mt-10"
        >
          <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Clock className="w-6 h-6 text-white/20 animate-spin" strokeWidth={1} />
            </div>
          ) : history.length === 0 ? (
            <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]">
              <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] p-8 text-center">
                <History className="w-8 h-8 text-white/10 mx-auto mb-2" strokeWidth={1} />
                <p className="text-white/30 text-sm">No transactions yet</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((tx, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease, delay: i * 0.03 }}
                  className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08]"
                >
                  <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'purchase' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}>
                        {tx.type === 'purchase' ? (
                          <DollarSign className="w-4 h-4 text-emerald-400" strokeWidth={1} />
                        ) : (
                          <History className="w-4 h-4 text-red-400" strokeWidth={1} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white/80">{tx.description}</p>
                        <p className="text-[10px] text-white/30">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      tx.type === 'purchase' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'purchase' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-[100dvh] bg-[#050505] text-white flex items-center justify-center">
        <Clock className="w-8 h-8 text-white/20 animate-spin" strokeWidth={1} />
      </main>
    }>
      <CreditsPageContent />
    </Suspense>
  );
}

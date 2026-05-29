'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/dashboard/auth-context';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const success = login(password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid password. Try "demo"');
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] animate-float-delayed" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="relative z-10 w-full max-w-sm mx-auto px-6"
      >
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to AutoTrace
        </button>

        <div className="p-1.5 rounded-[2rem] glass-card">
          <div className="rounded-[calc(2rem-0.375rem)] glass-card-inner p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Lock className="w-6 h-6 text-indigo-400" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Dealer Login</h1>
                <p className="text-xs text-white/40">Access your inventory dashboard</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 text-sm pr-10"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-white text-black py-3 rounded-xl font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all"
              >
                Sign In
              </button>
            </form>

            <p className="mt-4 text-xs text-center text-white/30">
              Demo password: <span className="text-white/50 font-mono">demo</span>
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

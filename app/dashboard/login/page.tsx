'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/dashboard/auth-context';

const ease = [0.32, 0.72, 0, 1] as const;

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const success = await login(password);
    setSubmitting(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid password. Try "demo"');
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-indigo-600/10 blur-[160px] animate-float" />
        <div className="absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[160px] animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors"
            style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            Back to AutoTrace
          </button>
        </motion.div>

        {/* Cinematic headline */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Dealer<br />
            <span className="text-indigo-400">Portal</span>
          </h1>
          <p className="text-white/30 text-sm mt-4 max-w-xs leading-relaxed">
            Access your inventory dashboard, analytics, and acquisition tools.
          </p>
        </motion.div>

        {/* Floating login card with double-bezel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.25 }}
          className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo-400" strokeWidth={1} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Secure Login</h2>
                <p className="text-xs text-white/40">Enter your dealer credentials</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 text-sm pr-10 transition-colors"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '500ms' }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1} /> : <Eye className="w-4 h-4" strokeWidth={1} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={submitting || !password.trim()}
                className="w-full bg-white text-black py-3.5 rounded-full font-semibold text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-40 inline-flex items-center justify-center gap-2"
                style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)', transitionDuration: '600ms' }}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-xs text-center text-white/25">
              Demo password: <span className="text-white/50 font-mono">demo</span>
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

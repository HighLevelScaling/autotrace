'use client';

import { motion } from 'framer-motion';
import { VelocityFactor } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle } from 'lucide-react';

interface VelocityFactorsProps {
  factors: VelocityFactor[];
}

export function VelocityFactors({ factors }: VelocityFactorsProps) {
  return (
    <div className="space-y-2">
      {factors.map((factor, i) => (
        <motion.div
          key={factor.name}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.4,
            delay: i * 0.05,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          {/* Traffic light dot */}
          <div
            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              factor.direction === 'positive'
                ? 'bg-emerald-400'
                : factor.direction === 'negative'
                  ? 'bg-rose-400'
                  : 'bg-white/20'
            }`}
          />

          {/* Icon */}
          <div className="flex-shrink-0">
            {factor.direction === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" strokeWidth={1} />
            ) : factor.direction === 'negative' ? (
              <TrendingDown className="w-4 h-4 text-rose-400" strokeWidth={1} />
            ) : (
              <Minus className="w-4 h-4 text-white/30" strokeWidth={1} />
            )}
          </div>

          {/* Name + Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm font-medium">{factor.name}</span>
              {factor.severity === 'high' && (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />
              )}
              {factor.severity === 'medium' && (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
              )}
            </div>
            <p className="text-white/40 text-xs mt-0.5 truncate">{factor.description}</p>
          </div>

          {/* Impact value */}
          <div
            className={`text-sm font-semibold flex-shrink-0 ${
              factor.direction === 'positive'
                ? 'text-emerald-400'
                : factor.direction === 'negative'
                  ? 'text-rose-400'
                  : 'text-white/40'
            }`}
          >
            {factor.impact > 0 ? '+' : ''}
            {factor.impact} pts
          </div>
        </motion.div>
      ))}
    </div>
  );
}

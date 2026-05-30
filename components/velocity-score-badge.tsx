'use client';

import { motion } from 'framer-motion';

interface VelocityScoreBadgeProps {
  score: number;
}

export function VelocityScoreBadge({ score }: VelocityScoreBadgeProps) {
  const color = score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red';
  const label = score >= 70 ? 'FAST SELLER' : score >= 40 ? 'MODERATE' : 'SLOW MOVER';

  const glowClass = {
    green: 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.5)]',
    yellow: 'bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.5)]',
    red: 'bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.5)]',
  }[color];

  const textClass = {
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    red: 'text-rose-400',
  }[color];

  return (
    <div className="flex items-center gap-4">
      <motion.div
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className={`w-5 h-5 rounded-full ${glowClass}`}
      />
      <div className="flex flex-col">
        <span className="text-4xl font-bold text-white tracking-tight">{score}</span>
        <span className={`text-[11px] font-semibold uppercase tracking-widest ${textClass}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

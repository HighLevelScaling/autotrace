'use client';

import { motion } from 'framer-motion';
import { getScoreLabel, getScoreBg } from '@/lib/condition-score';

interface ConditionScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ConditionScoreBadge({ score, size = 'md' }: ConditionScoreBadgeProps) {
  const { label } = getScoreLabel(score);
  const bgClass = getScoreBg(score);

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getStrokeColor = () => {
    if (score >= 85) return '#34d399';
    if (score >= 70) return '#60a5fa';
    if (score >= 55) return '#fbbf24';
    if (score >= 40) return '#fb923c';
    return '#f87171';
  };

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        viewport={{ once: true, margin: '-80px' }}
        className={`relative ${sizeClasses[size]} flex items-center justify-center`}
      >
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          <motion.circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
            viewport={{ once: true, margin: '-80px' }}
          />
        </svg>
        <span className="relative font-bold text-white tabular-nums">{score}</span>
      </motion.div>
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}>
          {label}
        </span>
        <p className="text-[10px] text-white/25 mt-1">Condition Score</p>
      </div>
    </div>
  );
}

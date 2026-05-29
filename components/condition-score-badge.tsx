'use client';

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

  const ringClasses = {
    sm: 'ring-2',
    md: 'ring-[3px]',
    lg: 'ring-4',
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
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r="40"
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="relative font-bold text-white">{score}</span>
      </div>
      <div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass}`}>
          {label}
        </span>
        <p className="text-[10px] text-white/30 mt-1">Condition Score</p>
      </div>
    </div>
  );
}

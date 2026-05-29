'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  valid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  paid: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  expired: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  unpaid: 'bg-red-500/15 text-red-400 border-red-500/20',
  disputed: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  invalid: 'bg-red-500/15 text-red-400 border-red-500/20',
  suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  minor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  moderate: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  major: 'bg-red-500/15 text-red-400 border-red-500/20',
  'total-loss': 'bg-red-500/15 text-red-400 border-red-500/20',
  sale: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  gift: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  inheritance: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  dealer: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        statusStyles[status] || 'bg-white/10 text-white/70 border-white/10',
        className
      )}
    >
      {status.replace('-', ' ')}
    </span>
  );
}

'use client';

import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, innerClassName, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        'p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl',
        hover && 'hover:bg-white/[0.05] hover:border-white/10 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]',
        className
      )}
    >
      <div
        className={cn(
          'rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
          innerClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { VelocityReport } from '@/lib/types';
import { VelocityScoreBadge } from './velocity-score-badge';
import { VelocityChart } from './velocity-chart';
import { VelocityFactors } from './velocity-factors';
import { VelocityPriceInput } from './velocity-price-input';
import { Zap } from 'lucide-react';

interface VelocitySectionProps {
  velocity: VelocityReport;
  marketValue: { low: number; mid: number; high: number };
}

export function VelocitySection({ velocity, marketValue }: VelocitySectionProps) {
  const [curves, setCurves] = useState(velocity.curves);

  const handleCustomCurve = (
    curve: ReturnType<typeof import('@/lib/velocity-engine').calculateCustomCurve>
  ) => {
    const baseCurves = velocity.curves.slice(0, 3);
    setCurves([...baseCurves, curve]);
  };

  return (
    <div className="col-span-12">
      <div className="p-1.5 rounded-[2rem] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" strokeWidth={1} />
              <div>
                <h3 className="text-white font-semibold text-lg tracking-tight">Market Velocity</h3>
                <p className="text-white/40 text-sm">Sale probability based on market conditions</p>
              </div>
            </div>
            <VelocityScoreBadge score={velocity.velocityScore} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatBox label="Est. Days to Sell" value={`${velocity.daysToSellEstimate}d`} />
            <StatBox
              label="Liquidity Tier"
              value={velocity.liquidityTier.charAt(0).toUpperCase() + velocity.liquidityTier.slice(1)}
            />
            <StatBox
              label="Seasonality"
              value={`${velocity.seasonalityImpact >= 0 ? '+' : ''}${velocity.seasonalityImpact}%`}
            />
            <StatBox label="Mid-Market Price" value={`$${marketValue.mid.toLocaleString()}`} />
          </div>

          {/* Chart */}
          <div className="mb-8">
            <VelocityChart curves={curves} />
          </div>

          {/* Custom price */}
          <div className="mb-8">
            <VelocityPriceInput
              velocityScore={velocity.velocityScore}
              marketValue={marketValue}
              onCurveAdd={handleCustomCurve}
            />
          </div>

          {/* Factors */}
          <div>
            <h4 className="text-white/60 text-sm font-medium mb-4 uppercase tracking-wider">
              Factor Breakdown
            </h4>
            <VelocityFactors factors={velocity.factors} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
      <div className="text-white font-semibold text-lg">{value}</div>
      <div className="text-white/30 text-xs mt-0.5">{label}</div>
    </div>
  );
}

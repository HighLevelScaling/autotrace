'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { VelocityCurve } from '@/lib/types';
import { calculateCustomCurve } from '@/lib/velocity-engine';

interface VelocityPriceInputProps {
  velocityScore: number;
  marketValue: { low: number; mid: number; high: number };
  onCurveAdd: (curve: VelocityCurve) => void;
}

export function VelocityPriceInput({
  velocityScore,
  marketValue,
  onCurveAdd,
}: VelocityPriceInputProps) {
  const [price, setPrice] = useState('');

  const handleCalculate = () => {
    const num = parseInt(price.replace(/[^0-9]/g, ''), 10);
    if (!num || num <= 0) return;
    const curve = calculateCustomCurve(velocityScore, marketValue, num);
    onCurveAdd(curve);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
        <input
          type="text"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Enter your listing price..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-7 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
        />
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleCalculate}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
      >
        <Calculator className="w-4 h-4" strokeWidth={1} />
        Calculate
      </motion.button>
    </div>
  );
}

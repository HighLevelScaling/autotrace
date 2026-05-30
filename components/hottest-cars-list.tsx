'use client';

import { motion } from 'framer-motion';
import { Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface HottestCar {
  rank: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  wholesaleBook: number;
  retailPrice: number;
  spreadAmount: number;
  spreadPercent: number;
  velocityScore: number;
  daysOnMarket: number;
  trend: 'up' | 'down' | 'flat';
}

interface HottestCarsListProps {
  cars: HottestCar[];
}

export function HottestCarsList({ cars }: HottestCarsListProps) {
  return (
    <div className="space-y-3">
      {cars.map((car, i) => (
        <motion.div
          key={car.vin}
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: i * 0.06,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#0a0a0a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] p-4 sm:p-5 flex items-center gap-4">
            {/* Rank */}
            <div className="w-8 text-center">
              <span className="text-white/30 text-sm font-semibold">#{car.rank}</span>
            </div>

            {/* Trend */}
            <div className="flex-shrink-0">
              {car.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
              ) : car.trend === 'down' ? (
                <ArrowDownRight className="w-4 h-4 text-rose-400" strokeWidth={1.5} />
              ) : (
                <Minus className="w-4 h-4 text-white/20" strokeWidth={1.5} />
              )}
            </div>

            {/* Vehicle info */}
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium text-sm truncate">
                {car.year} {car.make} {car.model}
              </div>
              <div className="text-white/30 text-xs mt-0.5">
                VIN: {car.vin} · {car.daysOnMarket}d on market
              </div>
            </div>

            {/* Prices */}
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-white/40 text-xs">Wholesale</div>
              <div className="text-white/60 text-sm">
                ${car.wholesaleBook.toLocaleString()}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-white/40 text-xs">Retail</div>
              <div className="text-white text-sm font-medium">
                ${car.retailPrice.toLocaleString()}
              </div>
            </div>

            {/* Spread */}
            <div className="flex flex-col items-end text-right min-w-[80px]">
              <div className="text-emerald-400 text-sm font-semibold">
                +{car.spreadPercent}%
              </div>
              <div className="text-white/30 text-xs">
                +${car.spreadAmount.toLocaleString()}
              </div>
            </div>

            {/* Velocity score */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  car.velocityScore >= 70
                    ? 'bg-emerald-400'
                    : car.velocityScore >= 40
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
              />
              <span className="text-white/60 text-sm">{car.velocityScore}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

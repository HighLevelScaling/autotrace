'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { VelocityCurve } from '@/lib/types';

interface VelocityChartProps {
  curves: VelocityCurve[];
}

const DAYS = [7, 14, 30, 60, 90];
const LABELS = ['7d', '14d', '30d', '60d', '90d'];

export function VelocityChart({ curves }: VelocityChartProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 30, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const colors = ['#34d399', '#fbbf24', '#f87171', '#ffffff'];

  function getX(index: number) {
    return padding.left + (index / (DAYS.length - 1)) * chartWidth;
  }

  function getY(probability: number) {
    return padding.top + chartHeight - probability * chartHeight;
  }

  function makePath(curve: VelocityCurve) {
    const probs = [
      curve.probabilities.days7,
      curve.probabilities.days14,
      curve.probabilities.days30,
      curve.probabilities.days60,
      curve.probabilities.days90,
    ];
    return probs.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p)}`).join(' ');
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
          <line
            key={tick}
            x1={padding.left}
            y1={getY(tick)}
            x2={width - padding.right}
            y2={getY(tick)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((val) => (
          <text
            key={val}
            x={padding.left - 8}
            y={getY(val / 100) + 4}
            textAnchor="end"
            fill="rgba(255,255,255,0.3)"
            fontSize={10}
          >
            {val}%
          </text>
        ))}
        {/* X-axis labels */}
        {LABELS.map((label, i) => (
          <text
            key={label}
            x={getX(i)}
            y={height - 12}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={11}
          >
            {label}
          </text>
        ))}
        {/* Curves */}
        {curves.map((curve, ci) => (
          <motion.path
            key={curve.label}
            d={makePath(curve)}
            fill="none"
            stroke={colors[ci % colors.length]}
            strokeWidth={2}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: ci * 0.15,
              ease: [0.32, 0.72, 0, 1],
            }}
          />
        ))}
        {/* Hover points */}
        {hoveredDay !== null &&
          curves.map((curve, ci) => {
            const probs = [
              curve.probabilities.days7,
              curve.probabilities.days14,
              curve.probabilities.days30,
              curve.probabilities.days60,
              curve.probabilities.days90,
            ];
            const p = probs[hoveredDay];
            return (
              <g key={`point-${ci}`}>
                <circle
                  cx={getX(hoveredDay)}
                  cy={getY(p)}
                  r={4}
                  fill={colors[ci % colors.length]}
                />
                <text
                  x={getX(hoveredDay)}
                  y={getY(p) - 10}
                  textAnchor="middle"
                  fill={colors[ci % colors.length]}
                  fontSize={10}
                  fontWeight={600}
                >
                  {(p * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}
        {/* Hover detection areas */}
        {DAYS.map((_, i) => (
          <rect
            key={`hover-${i}`}
            x={getX(i) - chartWidth / (DAYS.length - 1) / 2}
            y={padding.top}
            width={chartWidth / (DAYS.length - 1)}
            height={chartHeight}
            fill="transparent"
            onMouseEnter={() => setHoveredDay(i)}
            onMouseLeave={() => setHoveredDay(null)}
            style={{ cursor: 'crosshair' }}
          />
        ))}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-3 justify-center">
        {curves.map((curve, i) => (
          <div key={curve.label} className="flex items-center gap-2">
            <div
              className="w-3 h-[2px] rounded-full"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-white/50 text-xs">{curve.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

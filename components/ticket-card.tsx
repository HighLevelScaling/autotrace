'use client';

import { motion } from 'framer-motion';
import { Receipt, DollarSign, MapPin, Calendar } from 'lucide-react';
import { VehicleReport } from '@/lib/types';
import { StatusBadge } from './status-badge';
import { GlassCard } from './ui/glass-card';

interface TicketCardProps {
  report: VehicleReport;
  index: number;
}

export function TicketCard({ report, index }: TicketCardProps) {
  const tickets = report.tickets;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.1 + index * 0.05 }}
      viewport={{ once: true, margin: '-80px' }}
      className="col-span-12 md:col-span-4"
    >
      <GlassCard hover className="h-full">
        <div className="p-5 sm:p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-400" strokeWidth={1} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/80">Ticket History</h3>
              <p className="text-xs text-white/40">{tickets.length} citation{tickets.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-white/25">No tickets on record</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[320px] scrollbar-thin space-y-3 pr-1">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white/80 font-medium leading-tight">{ticket.violation}</p>
                    <StatusBadge status={ticket.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" strokeWidth={1} />
                      {ticket.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" strokeWidth={1} />
                      {ticket.location}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <DollarSign className="w-3 h-3" strokeWidth={1} />
                      ${ticket.amount.toFixed(2)}
                    </span>
                    <span className="text-xs text-white/25">{ticket.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

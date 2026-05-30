'use client';

import { motion } from 'framer-motion';
import { VehicleReport } from '@/lib/types';
import { VehicleHeader } from './vehicle-header';
import { RedFlagsBanner } from './red-flags-banner';
import { TitleBrandCard } from './title-brand-card';
import { MarketValueCard } from './market-value-card';
import { DMVCard } from './dmv-card';
import { RegistrationCard } from './registration-card';
import { TicketCard } from './ticket-card';
import { TransferCard } from './transfer-card';
import { AccidentCard } from './accident-card';
import { ServiceCard } from './service-card';
import { VelocitySection } from './velocity-section';
import { OwnershipSection } from './ownership-section';

interface ReportDashboardProps {
  report: VehicleReport;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
      delay: i * 0.12,
    },
  }),
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-white/5 text-white/40 border border-white/[0.06]">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

export function ReportDashboard({ report }: ReportDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <motion.section
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Overview</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <VehicleHeader report={report} />
          <RedFlagsBanner report={report} />
        </div>
      </motion.section>

      {/* Valuation & Title Section */}
      <motion.section
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Valuation &amp; Title</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <TitleBrandCard report={report} index={0} />
          <MarketValueCard report={report} index={1} />
        </div>
      </motion.section>

      {/* Market Velocity Section */}
      <motion.section
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Market Velocity</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <VelocitySection velocity={report.velocity} marketValue={report.marketValue} />
        </div>
      </motion.section>

      {/* Ownership Section */}
      <motion.section
        custom={3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Ownership &amp; Keys</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <OwnershipSection report={report} />
        </div>
      </motion.section>

      {/* Records & Registration Section */}
      <motion.section
        custom={4}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Records &amp; Registration</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <DMVCard report={report} index={2} />
          <RegistrationCard report={report} index={3} />
        </div>
      </motion.section>

      {/* History Section */}
      <motion.section
        custom={5}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>History</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <TicketCard report={report} index={4} />
          <TransferCard report={report} index={5} />
          <AccidentCard report={report} index={6} />
        </div>
      </motion.section>

      {/* Maintenance Section */}
      <motion.section
        custom={6}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={sectionVariants}
      >
        <Eyebrow>Maintenance</Eyebrow>
        <div className="grid grid-cols-12 gap-4 sm:gap-5">
          <ServiceCard report={report} index={7} />
        </div>
      </motion.section>
    </div>
  );
}

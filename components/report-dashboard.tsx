'use client';

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

interface ReportDashboardProps {
  report: VehicleReport;
}

export function ReportDashboard({ report }: ReportDashboardProps) {
  return (
    <div className="grid grid-cols-12 gap-4 sm:gap-5">
      <VehicleHeader report={report} />
      <RedFlagsBanner report={report} />
      <TitleBrandCard report={report} index={0} />
      <MarketValueCard report={report} index={1} />
      <DMVCard report={report} index={2} />
      <RegistrationCard report={report} index={3} />
      <TicketCard report={report} index={4} />
      <TransferCard report={report} index={5} />
      <AccidentCard report={report} index={6} />
      <ServiceCard report={report} index={7} />
    </div>
  );
}

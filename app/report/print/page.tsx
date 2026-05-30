'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleReport } from '@/lib/types';
import { getScoreLabel } from '@/lib/condition-score';
import { Car, ShieldCheck, FileCheck, Receipt, AlertTriangle, Wrench } from 'lucide-react';

const serviceTypeLabels: Record<string, string> = {
  oil_change: 'Oil Change', inspection: 'Inspection', tire_rotation: 'Tire Rotation',
  brake_service: 'Brake Service', transmission: 'Transmission', engine_repair: 'Engine Repair',
  body_work: 'Body Work', other: 'Maintenance',
};

const brandLabels: Record<string, string> = {
  clean: 'Clean Title', salvage: 'Salvage', rebuilt: 'Rebuilt',
  flood: 'Flood Damage', lemon: 'Lemon / Buyback', theft: 'Theft Recovery', odometer_rollback: 'Odometer Rollback',
};

function PrintContent() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState<VehicleReport | null>(null);

  const vin = searchParams.get('vin');
  const plate = searchParams.get('plate');
  const dl = searchParams.get('dl');
  const state = searchParams.get('state') || undefined;

  useEffect(() => {
    async function fetchReport() {
      let type: string | null = null;
      let value: string | null = null;
      if (vin) { type = 'vin'; value = vin; }
      else if (plate) { type = 'plate'; value = plate; }
      else if (dl) { type = 'dl'; value = dl; }
      if (!type || !value) return;

      try {
        const res = await fetch('/api/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, value, state }),
        });
        const data = await res.json();
        if (res.ok) setReport(data.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchReport();
  }, [vin, plate, dl, state]);

  useEffect(() => {
    if (report) {
      setTimeout(() => window.print(), 500);
    }
  }, [report]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400">Loading report...</p>
      </div>
    );
  }

  const scoreInfo = getScoreLabel(report.conditionScore);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-8 sm:p-12">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-gray-900 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-6 h-6" />
            <h1 className="text-2xl font-bold tracking-tight">AutoTrace</h1>
          </div>
          <p className="text-sm text-gray-500">Vehicle History Report</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Report Generated</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
          <p className="text-[10px] text-gray-400 mt-1">CONFIDENTIAL — FOR AUTHORIZED USE ONLY</p>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-3">Vehicle Information</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 uppercase">Year / Make / Model</p>
            <p className="text-sm font-semibold">{report.year} {report.make} {report.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">VIN</p>
            <p className="text-sm font-mono">{report.vin}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Color / Body</p>
            <p className="text-sm">{report.color} {report.bodyType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Condition Score</p>
            <p className="text-sm font-bold">{report.conditionScore}/100 — {scoreInfo.label}</p>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {report.redFlags.length > 0 && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-800">Red Flags Detected</h3>
          </div>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {report.redFlags.map((flag, i) => <li key={i}>{flag}</li>)}
          </ul>
        </div>
      )}

      {/* Title & Value */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Title Brands</h3>
          <div className="flex flex-wrap gap-2">
            {report.titleBrands.map(b => (
              <span key={b} className={`text-xs px-2 py-1 rounded border ${b === 'clean' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {brandLabels[b] || b}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Market Value Estimate</h3>
          <p className="text-2xl font-bold">${report.marketValue.mid.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Range: ${report.marketValue.low.toLocaleString()} — ${report.marketValue.high.toLocaleString()}</p>
        </div>
      </div>

      {/* DMV & Registration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> DMV Validation
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium capitalize">{report.dmvValidation.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">License #</span><span className="font-mono">{report.dmvValidation.licenseNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">State</span><span>{report.dmvValidation.state}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Expires</span><span>{report.dmvValidation.expiryDate}</span></div>
            {report.dmvValidation.restrictions.length > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Restrictions</span><span>{report.dmvValidation.restrictions.join(', ')}</span></div>
            )}
          </div>
        </div>
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4" /> Registration
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-medium capitalize">{report.registration.status}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Plate #</span><span className="font-mono">{report.registration.plateNumber}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">State</span><span>{report.registration.state}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Issued</span><span>{report.registration.issueDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Expires</span><span>{report.registration.expiryDate}</span></div>
          </div>
        </div>
      </div>

      {/* Accidents */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Accident History ({report.accidents.length})
        </h3>
        {report.accidents.length === 0 ? (
          <p className="text-sm text-gray-500">No accidents on record.</p>
        ) : (
          <div className="space-y-3">
            {report.accidents.map((a, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{a.description}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${a.severity === 'minor' ? 'bg-emerald-100 text-emerald-700' : a.severity === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {a.severity}
                  </span>
                </div>
                <div className="flex gap-4 text-gray-500 text-xs">
                  <span>{a.date}</span>
                  <span>{a.location}</span>
                  <span>${a.damageEstimate.toLocaleString()} damage</span>
                  {a.airbagDeployed && <span className="text-red-600">Airbag deployed</span>}
                  {a.injuries && <span className="text-red-600">Injuries reported</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tickets */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4" /> Ticket History ({report.tickets.length})
        </h3>
        {report.tickets.length === 0 ? (
          <p className="text-sm text-gray-500">No tickets on record.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                <th className="text-left py-2 text-gray-500 font-medium">Violation</th>
                <th className="text-left py-2 text-gray-500 font-medium">Location</th>
                <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                <th className="text-right py-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {report.tickets.map((t) => (
                <tr key={t.id} className="border-b border-gray-100">
                  <td className="py-2">{t.date}</td>
                  <td className="py-2">{t.violation}</td>
                  <td className="py-2 text-gray-500">{t.location}</td>
                  <td className="py-2 text-right">${t.amount.toFixed(2)}</td>
                  <td className="py-2 text-right capitalize">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Service History */}
      <div className="mb-8">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4" /> Service History ({report.serviceRecords.length})
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-gray-500 font-medium">Date</th>
              <th className="text-left py-2 text-gray-500 font-medium">Mileage</th>
              <th className="text-left py-2 text-gray-500 font-medium">Service</th>
              <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">Provider</th>
              <th className="text-right py-2 text-gray-500 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody>
            {report.serviceRecords.map((r, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{r.date}</td>
                <td className="py-2">{r.mileage.toLocaleString()}</td>
                <td className="py-2">{serviceTypeLabels[r.type]}</td>
                <td className="py-2 text-gray-500 hidden sm:table-cell">{r.provider}</td>
                <td className="py-2 text-right">${r.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          Generated by AutoTrace | This report is for informational purposes only. Verify all data independently before making purchase or financing decisions.
        </p>
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <PrintContent />
    </Suspense>
  );
}

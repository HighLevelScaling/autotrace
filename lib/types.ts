export type SearchType = 'vin' | 'plate' | 'dl';

export interface SearchRequest {
  type: SearchType;
  value: string;
  state?: string;
}

export type TitleBrand = 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'lemon' | 'theft' | 'odometer_rollback';

export interface TitleHistoryEntry {
  date: string;
  state: string;
  brand: TitleBrand;
  mileage: number;
  issuer: string;
}

export interface FraudReport {
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  titleWashDetected: boolean;
  titleWashDetails?: string;
  odometerRollbackProbability: number;
  odometerRollbackDetails?: string;
  totalLossDecision: 'total-loss' | 'repairable' | 'uncertain';
  totalLossDetails?: string;
  flags: string[];
}

export interface BatteryReport {
  stateOfHealth: number;
  grade: 'A' | 'B' | 'C' | 'D';
  currentRange: number;
  projectedRange100k: number;
  degradationRate: number;
  chargeCycles: number;
  warrantyMonthsRemaining: number;
  warrantyMilesRemaining: number;
  warrantyTransferable: boolean;
  warrantyTransferScore: number;
  climateImpact: 'minimal' | 'moderate' | 'severe';
  oemDataSource: string;
  estimatedReplacementCost: number;
  cellBalance: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface VehicleReport {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;

  // B2B Core
  conditionScore: number;
  titleBrands: TitleBrand[];
  marketValue: {
    low: number;
    mid: number;
    high: number;
  };
  redFlags: string[];

  dmvValidation: {
    status: 'valid' | 'invalid' | 'suspended';
    validatedAt: string;
    state: string;
    licenseNumber: string;
    expiryDate: string;
    restrictions: string[];
  };
  registration: {
    status: 'active' | 'expired' | 'suspended';
    plateNumber: string;
    state: string;
    issueDate: string;
    expiryDate: string;
    lastRenewed: string;
  };
  tickets: {
    id: string;
    date: string;
    violation: string;
    location: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'disputed';
    points: number;
  }[];
  transfers: {
    date: string;
    from: string;
    to: string;
    type: 'sale' | 'gift' | 'inheritance' | 'dealer';
    mileage: number;
  }[];
  accidents: {
    date: string;
    severity: 'minor' | 'moderate' | 'major' | 'total-loss';
    description: string;
    damageEstimate: number;
    airbagDeployed: boolean;
    injuries: boolean;
    insuranceClaim: number;
    location: string;
  }[];
  serviceRecords: {
    date: string;
    mileage: number;
    type:
      | 'oil_change'
      | 'inspection'
      | 'tire_rotation'
      | 'brake_service'
      | 'transmission'
      | 'engine_repair'
      | 'body_work'
      | 'other';
    description: string;
    provider: string;
    cost: number;
  }[];

  previousOwners: number;
  keysIncluded: number;
  paintMeterReadings?: PaintMeterReading[];
  paintworkStatus: 'original' | 'resprayed' | 'unknown';
  smogCheck: { status: 'pass' | 'fail' | 'unknown'; date?: string };
  runsAndDrives: boolean;
  averageDaysOnLot: number;
  wholesaleBook: number;
  velocity: VelocityReport;
  titleHistory: TitleHistoryEntry[];
  fraud: FraudReport;
  powertrain: 'ice' | 'hybrid' | 'bev' | 'phev';
  battery?: BatteryReport;

  // Real-data provenance: populated when a live source (e.g. NHTSA vPIC)
  // successfully enriches the base report. Absent => fully synthetic.
  nhtsa?: NHTSAEnrichment;

  // Populated when VINAUDIT_API_KEY is set and the VinAudit Specs API
  // returns attributes for this VIN. Absent => no VinAudit data available.
  vinaudit?: VinAuditEnrichment;

  // Populated when the billable VinAudit History (NMVTIS) pull succeeds. When
  // present, report.titleHistory/titleBrands/fraud are derived from REAL title
  // records, not synthetic data.
  nmvtis?: NMVTISProvenance;
}

export interface NMVTISProvenance {
  source: 'vinaudit-nmvtis';
  pulledAt: string;
  mode: 'live' | 'test';
  recordCount: number;
  odometerReadings: { date: string; mileage: number; source: string }[];
  theftOnRecord: boolean;
  // True when NMVTIS returned no adverse brands/theft — an authoritative
  // clean history (distinct from "no data available").
  cleanHistory: boolean;
}

export interface VinAuditEnrichment {
  source: 'vinaudit-specs';
  decodedAt: string;
  mode: 'live' | 'test';
  trim?: string;
  engine?: string;
  transmission?: string;
  drivetrain?: string;
  fuelType?: string;
  doors?: string;
  // Manufacturer/standard equipment list when include=equipment is requested.
  equipment: string[];
}

export interface NHTSARecall {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportDate: string;
}

export interface NHTSAEnrichment {
  source: 'nhtsa-vpic';
  decodedAt: string;
  // Authoritative spec fields straight from the manufacturer record
  trim?: string;
  bodyClass?: string;
  fuelType?: string;
  engineCylinders?: string;
  driveType?: string;
  plantCountry?: string;
  recalls: NHTSARecall[];
  recallCount: number;
}

export interface PaintMeterReading {
  panel: string;
  reading: number;
  unit: 'μm';
  flagged: boolean;
}

export interface VelocityCurve {
  label: string;
  price: number;
  probabilities: {
    days7: number;
    days14: number;
    days30: number;
    days60: number;
    days90: number;
  };
}

export interface VelocityFactor {
  name: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
  description: string;
  severity?: 'high' | 'medium' | 'low';
}

export interface VelocityReport {
  velocityScore: number;
  daysToSellEstimate: number;
  liquidityTier: 'high' | 'medium' | 'low';
  seasonalityImpact: number;
  curves: VelocityCurve[];
  factors: VelocityFactor[];
}

export interface BulkReport {
  vin: string;
  make: string;
  model: string;
  year: number;
  conditionScore: number;
  titleBrands: TitleBrand[];
  redFlags: string[];
  marketValueMid: number;
  accidentCount: number;
  ticketCount: number;
  registrationStatus: string;
  status: 'success' | 'error';
  error?: string;
}

export type SearchType = 'vin' | 'plate' | 'dl';

export interface SearchRequest {
  type: SearchType;
  value: string;
  state?: string;
}

export type TitleBrand = 'clean' | 'salvage' | 'rebuilt' | 'flood' | 'lemon' | 'theft' | 'odometer_rollback';

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
    type: 'oil_change' | 'inspection' | 'tire_rotation' | 'brake_service' | 'transmission' | 'engine_repair' | 'body_work' | 'other';
    description: string;
    provider: string;
    cost: number;
  }[];
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

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface InventoryVehicle {
  vin: string;
  make: string;
  model: string;
  year: number;
  color: string;
  bodyType: string;
  conditionScore: number;
  titleBrands: string[];
  redFlags: string[];
  marketValueMid: number;
  accidentCount: number;
  ticketCount: number;
  registrationStatus: string;

  // Dealer-specific fields
  purchasePrice: number;
  reconditioningCost: number;
  listedPrice: number;
  status: 'acquired' | 'reconditioning' | 'listed' | 'sold' | 'wholesaled';
  dateAcquired: string;
  dateListed?: string;
  dateSold?: string;
  notes: string;
  source: string;
}

interface InventoryContextType {
  vehicles: InventoryVehicle[];
  addVehicle: (vehicle: InventoryVehicle) => void;
  updateVehicle: (vin: string, updates: Partial<InventoryVehicle>) => void;
  removeVehicle: (vin: string) => void;
  getVehicle: (vin: string) => InventoryVehicle | undefined;
}

const InventoryContext = createContext<InventoryContextType>({
  vehicles: [],
  addVehicle: () => {},
  updateVehicle: () => {},
  removeVehicle: () => {},
  getVehicle: () => undefined,
});

const STORAGE_KEY = 'autotrace_inventory';

function getInitialInventory(): InventoryVehicle[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>(getInitialInventory);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
  }, [vehicles]);

  function addVehicle(vehicle: InventoryVehicle) {
    setVehicles(prev => {
      const existing = prev.findIndex(v => v.vin === vehicle.vin);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], ...vehicle };
        return updated;
      }
      return [vehicle, ...prev];
    });
  }

  function updateVehicle(vin: string, updates: Partial<InventoryVehicle>) {
    setVehicles(prev =>
      prev.map(v => (v.vin === vin ? { ...v, ...updates } : v))
    );
  }

  function removeVehicle(vin: string) {
    setVehicles(prev => prev.filter(v => v.vin !== vin));
  }

  function getVehicle(vin: string) {
    return vehicles.find(v => v.vin === vin);
  }

  return (
    <InventoryContext.Provider value={{ vehicles, addVehicle, updateVehicle, removeVehicle, getVehicle }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}

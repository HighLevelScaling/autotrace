const WMI_MAP: Record<string, { make: string; country: string }> = {
  '1HG': { make: 'Honda', country: 'USA' },
  '1FA': { make: 'Ford', country: 'USA' },
  '1FT': { make: 'Ford', country: 'USA' },
  '1G1': { make: 'Chevrolet', country: 'USA' },
  '1GC': { make: 'Chevrolet', country: 'USA' },
  '1J4': { make: 'Jeep', country: 'USA' },
  '1C4': { make: 'Chrysler', country: 'USA' },
  '2T1': { make: 'Toyota', country: 'Canada' },
  '2F2': { make: 'Ford', country: 'Canada' },
  '3FA': { make: 'Ford', country: 'Mexico' },
  '5XY': { make: 'Kia', country: 'USA' },
  '5N1': { make: 'Hyundai', country: 'USA' },
  'JHM': { make: 'Honda', country: 'Japan' },
  'JT2': { make: 'Toyota', country: 'Japan' },
  'JF1': { make: 'Subaru', country: 'Japan' },
  'JA3': { make: 'Mitsubishi', country: 'Japan' },
  'KM8': { make: 'Hyundai', country: 'Korea' },
  'KNA': { make: 'Kia', country: 'Korea' },
  'WBA': { make: 'BMW', country: 'Germany' },
  'WDB': { make: 'Mercedes-Benz', country: 'Germany' },
  'WVW': { make: 'Volkswagen', country: 'Germany' },
  'WAU': { make: 'Audi', country: 'Germany' },
  'SAL': { make: 'Land Rover', country: 'UK' },
  'SAJ': { make: 'Jaguar', country: 'UK' },
  'ZAM': { make: 'Maserati', country: 'Italy' },
  'ZFA': { make: 'Fiat', country: 'Italy' },
  'ZFF': { make: 'Ferrari', country: 'Italy' },
  'YV1': { make: 'Volvo', country: 'Sweden' },
  'LSV': { make: 'Volkswagen', country: 'China' },
  'LVS': { make: 'Ford', country: 'China' },
};

const MODEL_MAP: Record<string, string[]> = {
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey'],
  'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Fusion'],
  'Chevrolet': ['Silverado', 'Equinox', 'Malibu', 'Camaro', 'Traverse'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade'],
  'Chrysler': ['Pacifica', '300', 'Voyager'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma'],
  'Kia': ['Sorento', 'Sportage', 'Telluride', 'Forte', 'Optima'],
  'Hyundai': ['Tucson', 'Santa Fe', 'Elantra', 'Sonata', 'Palisade'],
  'Subaru': ['Outback', 'Forester', 'Crosstrek', 'Impreza', 'Legacy'],
  'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'X7'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf'],
  'Audi': ['A4', 'A6', 'Q5', 'Q7', 'Q3'],
  'Land Rover': ['Range Rover', 'Defender', 'Discovery', 'Velar'],
  'Jaguar': ['F-PACE', 'XE', 'XF', 'I-PACE'],
  'Maserati': ['Ghibli', 'Levante', 'Quattroporte'],
  'Fiat': ['500', '500X'],
  'Ferrari': ['488', 'F8', 'Roma', 'SF90'],
  'Volvo': ['XC60', 'XC90', 'S60', 'V60'],
};

const YEAR_MAP: Record<string, number> = {
  'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
  '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
  'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
  'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
  'S': 2025, 'T': 2026,
};

export function decodeVIN(vin: string): { make: string; model: string; year: number } {
  const clean = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (clean.length < 10) {
    return { make: 'Unknown', model: 'Unknown', year: 2020 };
  }
  
  const wmi = clean.slice(0, 3);
  const info = WMI_MAP[wmi] || { make: 'Unknown', country: 'Unknown' };
  
  const models = MODEL_MAP[info.make] || ['Unknown'];
  const modelIndex = parseInt(clean.slice(4, 6), 36) % models.length;
  const model = models[modelIndex] || models[0];
  
  const yearChar = clean[9];
  const year = YEAR_MAP[yearChar] || 2020;
  
  return { make: info.make, model, year };
}

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{10,17}$/;
const PLATE_REGEX = /^[A-Z0-9\-]{1,10}$/;
const DL_REGEX = /^[A-Z0-9\-]{1,20}$/;
const STATE_REGEX = /^[A-Z]{2}$/;

export function sanitizeString(input: string, maxLength = 100): string {
  return input
    .replace(/[<>"']/g, '')
    .slice(0, maxLength)
    .trim();
}

export function validateVIN(vin: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeString(vin, 17).toUpperCase();
  if (!sanitized) return { valid: false, error: 'VIN is required', sanitized: '' };
  if (sanitized.length < 10) return { valid: false, error: 'VIN must be at least 10 characters', sanitized };
  if (sanitized.length > 17) return { valid: false, error: 'VIN must not exceed 17 characters', sanitized };
  if (!VIN_REGEX.test(sanitized)) return { valid: false, error: 'VIN contains invalid characters', sanitized };
  return { valid: true, sanitized };
}

export function validatePlate(plate: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeString(plate, 10).toUpperCase().replace(/[^A-Z0-9\-]/g, '');
  if (!sanitized) return { valid: false, error: 'License plate is required', sanitized: '' };
  if (!PLATE_REGEX.test(sanitized)) return { valid: false, error: 'Invalid license plate format', sanitized };
  return { valid: true, sanitized };
}

export function validateDL(dl: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = sanitizeString(dl, 20).toUpperCase().replace(/[^A-Z0-9\-]/g, '');
  if (!sanitized) return { valid: false, error: 'Driver\'s license number is required', sanitized: '' };
  if (!DL_REGEX.test(sanitized)) return { valid: false, error: 'Invalid driver\'s license format', sanitized };
  return { valid: true, sanitized };
}

export function validateState(state: string | undefined): { valid: boolean; error?: string; sanitized?: string } {
  if (!state) return { valid: true };
  const sanitized = sanitizeString(state, 2).toUpperCase();
  if (!STATE_REGEX.test(sanitized)) return { valid: false, error: 'Invalid state code', sanitized };
  return { valid: true, sanitized };
}

export function validateVINs(vins: unknown[]): { valid: boolean; error?: string; sanitized: string[] } {
  if (!Array.isArray(vins)) return { valid: false, error: 'VINs must be an array', sanitized: [] };
  if (vins.length === 0) return { valid: false, error: 'No VINs provided', sanitized: [] };
  if (vins.length > 1000) return { valid: false, error: 'Maximum 1000 VINs per batch', sanitized: [] };

  const sanitized: string[] = [];
  for (const v of vins) {
    if (typeof v !== 'string') continue;
    const result = validateVIN(v);
    if (result.valid) sanitized.push(result.sanitized);
  }

  if (sanitized.length === 0) return { valid: false, error: 'No valid VINs found', sanitized: [] };
  return { valid: true, sanitized: [...new Set(sanitized)] };
}

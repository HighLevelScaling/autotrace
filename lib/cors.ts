const ALLOWED_ORIGINS = [
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  process.env.NEXT_PUBLIC_APP_URL || '',
  'http://localhost:3000',
].filter(Boolean);

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Allow same-origin (no Origin header)
  return ALLOWED_ORIGINS.includes(origin) || origin.endsWith('.vercel.app');
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

import { pbkdf2Sync, timingSafeEqual } from 'crypto';

const SALT = Buffer.from('autotrace-demo-salt-v1');
const DEMO_PASSWORD_HASH = pbkdf2Sync('demo', SALT, 100_000, 32, 'sha256');
const SECRET = process.env.AUTH_SECRET || 'autotrace-dev-secret-change-me';

// ── Password Verification (Node.js crypto) ──
export function verifyPassword(password: string): boolean {
  try {
    const hash = pbkdf2Sync(password, SALT, 100_000, 32, 'sha256');
    return timingSafeEqual(hash, DEMO_PASSWORD_HASH);
  } catch {
    return false;
  }
}

// ── Session Token (Web Crypto — works in Edge + Node) ──
async function getSigningKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const sigB64 = Buffer.from(sig).toString('base64url');
  return `${payloadB64}.${sigB64}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payloadB64, sigB64] = token.split('.');
  if (!payloadB64 || !sigB64) return false;

  try {
    const payload = Buffer.from(payloadB64, 'base64url').toString();
    const data = JSON.parse(payload);
    if (Date.now() > data.exp) return false;

    const key = await getSigningKey();
    const signature = Buffer.from(sigB64, 'base64url');
    return crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

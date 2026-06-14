// Simple credit management for demo purposes.
// PRODUCTION: Replace with database (PostgreSQL, Redis, or Stripe Customer Balance).

import fs from 'fs';
import path from 'path';

const CREDITS_FILE = path.join(process.cwd(), '.credits-store.json');

interface CreditStore {
  [userId: string]: {
    balance: number;
    totalSpent: number;
    totalPurchased: number;
    transactions: Array<{
      type: 'purchase' | 'deduction';
      amount: number;
      description: string;
      timestamp: string;
    }>;
  };
}

let memoryStore: CreditStore = {};
let initialized = false;

function loadFromDisk() {
  if (initialized) return;
  try {
    if (fs.existsSync(CREDITS_FILE)) {
      memoryStore = JSON.parse(fs.readFileSync(CREDITS_FILE, 'utf-8'));
    }
  } catch {
    memoryStore = {};
  }
  initialized = true;
}

function saveToDisk() {
  try {
    // Atomic write: write to temp file then rename
    const tempFile = `${CREDITS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(memoryStore, null, 2));
    fs.renameSync(tempFile, CREDITS_FILE);
  } catch {
    // Silently fail on read-only filesystems (Vercel serverless)
    // Production: Replace with Redis/PostgreSQL/Stripe Customer Balance
  }
}

function getUserId(req: Request): string {
  // For demo: use a simple fingerprint from headers + IP
  // Production: use authenticated user ID from session/JWT
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  return `user_${ip.replace(/[^a-z0-9]/gi, '_')}`;
}

export function getBalance(req: Request): number {
  loadFromDisk();
  const userId = getUserId(req);
  return memoryStore[userId]?.balance || 0;
}

export function getCreditHistory(req: Request) {
  loadFromDisk();
  const userId = getUserId(req);
  return memoryStore[userId] || { balance: 0, totalSpent: 0, totalPurchased: 0, transactions: [] };
}

export function addCredits(req: Request, amount: number, description: string) {
  loadFromDisk();
  const userId = getUserId(req);
  if (!memoryStore[userId]) {
    memoryStore[userId] = { balance: 0, totalSpent: 0, totalPurchased: 0, transactions: [] };
  }
  memoryStore[userId].balance += amount;
  memoryStore[userId].totalPurchased += amount;
  memoryStore[userId].transactions.push({
    type: 'purchase',
    amount,
    description,
    timestamp: new Date().toISOString(),
  });
  saveToDisk();
  return memoryStore[userId].balance;
}

export function deductCredits(req: Request, amount: number, description: string): { success: boolean; balance: number; error?: string } {
  loadFromDisk();
  const userId = getUserId(req);
  if (!memoryStore[userId] || memoryStore[userId].balance < amount) {
    return { success: false, balance: memoryStore[userId]?.balance || 0, error: 'Insufficient credits' };
  }
  memoryStore[userId].balance -= amount;
  memoryStore[userId].totalSpent += amount;
  memoryStore[userId].transactions.push({
    type: 'deduction',
    amount,
    description,
    timestamp: new Date().toISOString(),
  });
  saveToDisk();
  return { success: true, balance: memoryStore[userId].balance };
}

// Direct user ID methods (for webhooks where we have the user ID)
export function addCreditsByUserId(userId: string, amount: number, description: string) {
  loadFromDisk();
  if (!memoryStore[userId]) {
    memoryStore[userId] = { balance: 0, totalSpent: 0, totalPurchased: 0, transactions: [] };
  }
  memoryStore[userId].balance += amount;
  memoryStore[userId].totalPurchased += amount;
  memoryStore[userId].transactions.push({
    type: 'purchase',
    amount,
    description,
    timestamp: new Date().toISOString(),
  });
  saveToDisk();
  return memoryStore[userId].balance;
}

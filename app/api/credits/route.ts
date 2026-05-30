import { NextRequest, NextResponse } from 'next/server';
import { getBalance, getCreditHistory } from '@/lib/credits';

export async function GET(req: NextRequest) {
  const balance = getBalance(req);
  const history = getCreditHistory(req);

  return NextResponse.json({
    balance,
    totalSpent: history.totalSpent,
    totalPurchased: history.totalPurchased,
    transactions: history.transactions.slice(-20).reverse(), // Last 20, newest first
  });
}

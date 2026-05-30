import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('autotrace_session')?.value;
  const isAuthenticated = await verifySessionToken(token);
  return NextResponse.json({ isAuthenticated });
}

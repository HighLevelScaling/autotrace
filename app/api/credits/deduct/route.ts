import { NextRequest, NextResponse } from 'next/server';
import { deductCredits } from '@/lib/credits';

const COST_PER_PULL = 0.5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description = 'Vehicle history pull' } = body;

    const result = deductCredits(req, COST_PER_PULL, description);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          balance: result.balance,
          cost: COST_PER_PULL,
          message: `You need $${COST_PER_PULL} per pull. Current balance: $${result.balance.toFixed(2)}`,
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      balance: result.balance,
      deducted: COST_PER_PULL,
    });
  } catch (err) {
    console.error('[CreditsDeduct] Error:', err);
    return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 });
  }
}

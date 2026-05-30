import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' })
  : null;

const PRICE_PER_PULL = 0.5;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { packSize = 10 } = body; // Default: $5 for 10 pulls

    const amount = Math.round(packSize * PRICE_PER_PULL * 100); // cents

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AutoTrace Credit Pack`,
              description: `${packSize} vehicle history pulls ($0.50 each)`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin') || 'https://my-app-liard-eta-10.vercel.app'}/credits?success=true&credits=${packSize}`,
      cancel_url: `${req.headers.get('origin') || 'https://my-app-liard-eta-10.vercel.app'}/credits?canceled=true`,
      metadata: {
        packSize: String(packSize),
        creditAmount: String(packSize),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[StripeCheckout] Error:', err);
    return NextResponse.json({ error: 'Checkout creation failed' }, { status: 500 });
  }
}

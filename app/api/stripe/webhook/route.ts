import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCreditsByUserId } from '@/lib/credits';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-05-27.dahlia' })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!stripe || !webhookSecret) {
      console.warn('[StripeWebhook] Stripe not fully configured');
      return NextResponse.json({ received: true });
    }

    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[StripeWebhook] Signature verification failed:', msg);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const creditAmount = parseInt(session.metadata?.creditAmount || '0', 10);
      const userId = session.client_reference_id || session.customer_email || 'anonymous';

      if (creditAmount > 0) {
        addCreditsByUserId(userId, creditAmount, `Stripe purchase: ${session.id}`);
        console.log(`[StripeWebhook] Added ${creditAmount} credits to ${userId}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[StripeWebhook] Error:', err);
    return NextResponse.json({ received: true });
  }
}

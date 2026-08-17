import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json();

  const prices = {
    basic: 499,
    premium: 999,
  };

  if (!plan || !prices[plan as keyof typeof prices]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://askmedily-hazel.vercel.app';

  try {
    const session = await stripe.checkout.sessions.create({
           mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `AskMedily ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
              description: plan === 'basic'
                ? 'Drug search, plain English explanations, side effects ranked by frequency'
                : 'Everything in Basic + AI Condition Agent + personalised medication history',
            },
            unit_amount: prices[plan as keyof typeof prices],
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 2,
        metadata: { userId: userId || '', plan },
      },
      success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: { userId: userId || '', plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

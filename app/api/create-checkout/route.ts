import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const PLANS = {
  basic: {
    name: 'AskMedily Basic',
    amount: 499, // £4.99 in pence
    interval: 'month' as const,
  },
  premium: {
    name: 'AskMedily Premium',
    amount: 999, // £9.99 in pence
    interval: 'month' as const,
  }
};

export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json();

  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const selectedPlan = PLANS[plan as keyof typeof PLANS];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://askmedily.com';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: selectedPlan.name,
              description: plan === 'basic'
                ? 'Drug search, plain English explanations, side effects ranked by frequency'
                : 'Everything in Basic + AI Condition Agent + personalised medication history',
            },
            unit_amount: selectedPlan.amount,
            recurring: {
              interval: selectedPlan.interval,
              trial_period_days: 2,
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 2,
        metadata: {
          userId: userId || '',
          plan,
        },
      },
      success_url: `${appUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${appUrl}/pricing?cancelled=true`,
      metadata: {
        userId: userId || '',
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

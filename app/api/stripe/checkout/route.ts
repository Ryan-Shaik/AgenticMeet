import { NextRequest, NextResponse } from 'next/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import db from '@/db';
import { subscription, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success');
  const planIdParam = searchParams.get('plan');

  console.log('Checkout redirect - sessionId:', sessionId, 'success:', success, 'plan:', planIdParam);

  if (sessionId && success === 'true') {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const userId = session.metadata?.userId;
      const planId = planIdParam || session.metadata?.planId;
      const subscriptionId = session.subscription as string;

      console.log('Updating subscription for userId:', userId, 'planId:', planId, 'subId:', subscriptionId);

      if (userId) {
        const existingSub = await db.select()
          .from(subscription)
          .where(eq(subscription.userId, userId))
          .then(res => res[0]);

        console.log('Existing sub:', existingSub);

        if (existingSub) {
          await db.update(subscription)
            .set({
              stripeSubscriptionId: subscriptionId,
              status: 'active',
              planId: planId || 'pro',
              updatedAt: new Date(),
            })
            .where(eq(subscription.id, existingSub.id));
          console.log('Subscription updated to active');
        }
      }
    } catch (error) {
      console.error('Session verification error:', error);
    }
  } else if (planIdParam && success !== 'true') {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (userId) {
      const existingSub = await db.select()
        .from(subscription)
        .where(eq(subscription.userId, userId))
        .then(res => res[0]);
      if (existingSub) {
        await db.update(subscription)
          .set({
            status: 'inactive',
            planId: 'free',
            updatedAt: new Date(),
          })
          .where(eq(subscription.id, existingSub.id));
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', req.url));
}

export async function POST(req: NextRequest) {
  try {
    const { userId, planId } = await req.json();

    const userData = await db.select().from(user).where(eq(user.id, userId)).then(res => res[0]);
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const existingSub = await db.select().from(subscription).where(eq(subscription.userId, userId)).then(res => res[0]);

    let customerId = existingSub?.stripeCustomerId;

    if (!customerId) {
      const customer = await getOrCreateStripeCustomer(userData.email, userData.name, { userId });
      customerId = customer.id;

      await db.insert(subscription).values({
        id: crypto.randomUUID(),
        userId,
        stripeCustomerId: customerId,
        planId,
        status: 'inactive',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (existingSub && existingSub.status !== 'active') {
      await db.update(subscription)
        .set({
          planId,
          status: 'inactive',
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, existingSub.id));
    } else if (existingSub && existingSub.status === 'active') {
      await db.update(subscription)
        .set({
          planId,
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, existingSub.id));
    }

    const priceId = planId === 'pro'
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_ENTERPRISE_PRICE_ID;

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.BETTER_AUTH_URL}/api/stripe/checkout?success=true&session_id={CHECKOUT_SESSION_ID}&userId=${userId}&plan=${planId}`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/api/stripe/checkout?canceled=true&userId=${userId}`,
      metadata: {
        userId,
        planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
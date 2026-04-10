import { NextRequest, NextResponse } from 'next/server';
import { stripe, getOrCreateStripeCustomer } from '@/lib/stripe';
import db from '@/db';
import { subscription, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
      success_url: `${process.env.BETTER_AUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.BETTER_AUTH_URL}/pricing?canceled=true`,
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
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/db';
import { subscription } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json();

    const userSub = await db.select().from(subscription)
      .where(eq(subscription.userId, userId))
      .then(res => res[0]);

    if (!userSub?.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    if (action === 'cancel') {
      if (userSub.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(userSub.stripeSubscriptionId);
      }
      await db.update(subscription)
        .set({
          status: 'inactive',
          planId: 'free',
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, userSub.id));
      return NextResponse.json({ success: true });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userSub.stripeCustomerId,
      return_url: `${process.env.BETTER_AUTH_URL}/cancellation-complete`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
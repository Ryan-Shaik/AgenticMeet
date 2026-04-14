import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/db';
import { subscription } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;

        if (!userId || !customerId) {
          console.error('Missing userId or customerId in checkout session');
          return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        const existingSub = await db.select()
          .from(subscription)
          .where(eq(subscription.userId, userId))
          .then(res => res[0]);

        if (existingSub) {
          await db.update(subscription)
            .set({
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: customerId, // Ensure it's synced
              status: 'active',
              planId: planId || existingSub.planId,
              updatedAt: new Date(),
            })
            .where(eq(subscription.id, existingSub.id));
          console.log(`Updated subscription for user ${userId}`);
        } else {
          await db.insert(subscription).values({
            id: crypto.randomUUID(),
            userId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            planId: planId || 'pro',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log(`Created new subscription for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        await db.update(subscription)
          .set({
            status: sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'canceled' : 'past_due',
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(subscription.stripeSubscriptionId, sub.id));
        console.log(`Updated subscription status for ${sub.id}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        await db.update(subscription)
          .set({
            status: 'inactive',
            planId: 'free',
            updatedAt: new Date(),
          })
          .where(eq(subscription.stripeSubscriptionId, sub.id));
        console.log(`Subscription ${sub.id} marked as deleted`);
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
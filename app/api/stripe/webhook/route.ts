import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import db from '@/db';
import { subscription } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as unknown as { 
        metadata?: { userId?: string, planId?: string }, 
        subscription?: string 
      };
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const subscriptionId = session.subscription as string;

      if (userId) {
        const existingSub = await db.select()
          .from(subscription)
          .where(eq(subscription.userId, userId))
          .then(res => res[0]);

        if (existingSub) {
          await db.update(subscription)
            .set({
              stripeSubscriptionId: subscriptionId,
              status: 'active',
              planId: planId || existingSub.planId,
              updatedAt: new Date(),
            })
            .where(eq(subscription.id, existingSub.id));
        } else {
          await db.insert(subscription).values({
            id: crypto.randomUUID(),
            userId,
            stripeCustomerId: (event.data.object as unknown as { customer?: string }).customer || '',
            stripeSubscriptionId: subscriptionId,
            planId: planId || 'pro',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as unknown as {
        id: string;
        status: string;
        current_period_start: number;
        current_period_end: number;
      };
      await db.update(subscription)
        .set({
          status: sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'canceled' : 'past_due',
          currentPeriodStart: new Date(sub.current_period_start * 1000),
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscription.stripeSubscriptionId, sub.id));
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as unknown as { id: string };
      await db.update(subscription)
        .set({
          status: 'inactive',
          planId: 'free',
          updatedAt: new Date(),
        })
        .where(eq(subscription.stripeSubscriptionId, sub.id));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
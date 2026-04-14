import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import db from '@/db';
import { subscription, plan, usage } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const userSubscription = await db
      .select({
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
        plan: {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          interval: plan.interval,
          meetingLimit: plan.meetingLimit,
          minuteLimit: plan.minuteLimit,
        },
      })
      .from(subscription)
      .leftJoin(plan, eq(subscription.planId, plan.id))
      .where(eq(subscription.userId, userId))
      .then(res => res[0]);

    if (!userSubscription) {
      return NextResponse.json({
        status: 'inactive',
        plan: null,
        usage: null,
      });
    }

    const now = new Date();
    const currentUsage = await db
      .select()
      .from(usage)
      .where(
        and(
          eq(usage.userId, userId),
          gte(usage.periodStart, new Date(now.getFullYear(), now.getMonth(), 1)),
          lt(usage.periodStart, new Date(now.getFullYear(), now.getMonth() + 1, 1))
        )
      )
      .then(res => res[0]);

    return NextResponse.json({
      subscription: userSubscription.subscription,
      plan: userSubscription.plan,
      usage: currentUsage || { meetingsUsed: 0, minutesUsed: 0 },
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json({ error: 'Failed to get subscription status' }, { status: 500 });
  }
}
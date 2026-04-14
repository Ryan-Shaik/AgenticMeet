import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { subscription, plan, usage } from '@/db/schema';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { userId, action, amount = 1 } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const userSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.userId, userId))
      .then(res => res[0]);

    if (!userSubscription || userSubscription.status !== 'active') {
      return NextResponse.json({
        allowed: false,
        reason: 'No active subscription',
      });
    }

    const userPlan = await db
      .select()
      .from(plan)
      .where(eq(plan.id, userSubscription.planId))
      .then(res => res[0]);

    if (!userPlan) {
      return NextResponse.json({ allowed: false, reason: 'Plan not found' });
    }

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let currentUsage = await db
      .select()
      .from(usage)
      .where(
        and(
          eq(usage.userId, userId),
          gte(usage.periodStart, periodStart),
          lt(usage.periodStart, periodEnd)
        )
      )
      .then(res => res[0]);

    if (!currentUsage) {
      const id = crypto.randomUUID();
      await db.insert(usage).values({
        id,
        userId,
        meetingsUsed: '0',
        minutesUsed: '0',
        aiInteractionsUsed: '0',
        periodStart,
        periodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      currentUsage = {
        id,
        userId,
        meetingsUsed: '0',
        minutesUsed: '0',
        aiInteractionsUsed: '0',
        periodStart,
        periodEnd,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const meetingsUsed = parseInt(currentUsage.meetingsUsed) || 0;
    const minutesUsed = parseInt(currentUsage.minutesUsed) || 0;
    const aiInteractionsUsed = parseInt(currentUsage.aiInteractionsUsed) || 0;

    const meetingLimit = userPlan.meetingLimit ? parseInt(userPlan.meetingLimit) : -1;
    const minuteLimit = userPlan.minuteLimit ? parseInt(userPlan.minuteLimit) : -1;
    const aiLimit = userPlan.aiLimit ? parseInt(userPlan.aiLimit) : -1;

    if (action === 'meeting') {
      if (meetingLimit !== -1 && meetingsUsed >= meetingLimit) {
        return NextResponse.json({
          allowed: false,
          reason: `Meeting limit exceeded. Limit: ${meetingLimit} per month.`,
        });
      }
      await db
        .update(usage)
        .set({
          meetingsUsed: String(meetingsUsed + amount),
          updatedAt: new Date(),
        })
        .where(eq(usage.id, currentUsage.id));
    }

    if (action === 'minute') {
      if (minuteLimit !== -1 && minutesUsed >= minuteLimit) {
        return NextResponse.json({
          allowed: false,
          reason: `Minute limit exceeded. Limit: ${minuteLimit} per month.`,
        });
      }
      await db
        .update(usage)
        .set({
          minutesUsed: String(minutesUsed + amount),
          updatedAt: new Date(),
        })
        .where(eq(usage.id, currentUsage.id));
    }

    if (action === 'ai') {
      if (aiLimit !== -1 && aiInteractionsUsed >= aiLimit) {
        return NextResponse.json({
          allowed: false,
          reason: `AI interaction limit exceeded. Limit: ${aiLimit} per month.`,
        });
      }
      await db
        .update(usage)
        .set({
          aiInteractionsUsed: String(aiInteractionsUsed + amount),
          updatedAt: new Date(),
        })
        .where(eq(usage.id, currentUsage.id));
    }

    return NextResponse.json({
      allowed: true,
      usage: {
        meetingsUsed: meetingsUsed + (action === 'meeting' ? amount : 0),
        minutesUsed: minutesUsed + (action === 'minute' ? amount : 0),
        aiInteractionsUsed: aiInteractionsUsed + (action === 'ai' ? amount : 0),
        meetingLimit,
        minuteLimit,
        aiLimit,
      },
    });
  } catch (error) {
    console.error('Check usage error:', error);
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireSystemAdmin } from '@/lib/admin';
import db from '@/db';
import { plan, subscription, user } from '@/db/schema';
import { count, desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsedPage = Number(req.nextUrl.searchParams.get('page') ?? 1);
  const parsedLimit = Number(req.nextUrl.searchParams.get('limit') ?? 20);
  const status = req.nextUrl.searchParams.get('status') ?? 'all';
  const page = Number.isFinite(parsedPage) ? Math.max(Math.trunc(parsedPage), 1) : 1;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), 100)
    : 20;
  const offset = (page - 1) * limit;

  const paymentsQuery = db
    .select({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      planName: plan.name,
      status: subscription.status,
      price: plan.price,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    })
    .from(subscription)
    .leftJoin(user, eq(subscription.userId, user.id))
    .leftJoin(plan, eq(subscription.planId, plan.id));

  const totalQuery = db
    .select({ total: count() })
    .from(subscription);

  const paymentsResult = status === 'all'
    ? await paymentsQuery
      .orderBy(desc(subscription.createdAt))
      .limit(limit)
      .offset(offset)
    : await paymentsQuery
      .where(eq(subscription.status, status))
      .orderBy(desc(subscription.createdAt))
      .limit(limit)
      .offset(offset);

  const totalResult = status === 'all'
    ? await totalQuery.then(res => res[0])
    : await totalQuery
      .where(eq(subscription.status, status))
      .then(res => res[0]);

  return NextResponse.json({
    payments: paymentsResult.map(row => ({
      userId: row.userId ?? '',
      userName: row.userName ?? 'Unknown',
      userEmail: row.userEmail ?? '',
      planName: row.planName ?? 'Unknown',
      status: row.status,
      price: row.price ?? '0',
      currentPeriodEnd: row.currentPeriodEnd,
      stripeSubscriptionId: row.stripeSubscriptionId,
    })),
    total: Number(totalResult?.total ?? 0),
    page,
  });
}

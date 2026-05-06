import { NextResponse } from 'next/server';
import { requireSystemAdmin } from '@/lib/admin';
import db from '@/db';
import { plan, subscription } from '@/db/schema';
import { and, count, eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const statusCountsResult = await db
    .select({
      status: subscription.status,
      count: count(),
    })
    .from(subscription)
    .groupBy(subscription.status);

  const planBreakdownResult = await db
    .select({
      planName: plan.name,
      count: count(),
    })
    .from(subscription)
    .leftJoin(plan, eq(subscription.planId, plan.id))
    .where(and(eq(subscription.status, 'active')))
    .groupBy(plan.name);

  const mrrResult = await db
    .select({
      mrr: sql<string>`COALESCE(SUM(
        CASE
          WHEN ${subscription.status} = 'active' AND ${plan.interval} = 'year'
            THEN COALESCE(NULLIF(${plan.price}, '')::numeric, 0) / 12
          WHEN ${subscription.status} = 'active'
            THEN COALESCE(NULLIF(${plan.price}, '')::numeric, 0)
          ELSE 0
        END
      ), 0)`,
    })
    .from(subscription)
    .leftJoin(plan, eq(subscription.planId, plan.id))
    .then(res => res[0]);

  return NextResponse.json({
    mrr: Number(mrrResult?.mrr ?? 0),
    statusCounts: statusCountsResult.map(row => ({
      status: row.status,
      count: Number(row.count),
    })),
    planBreakdown: planBreakdownResult.map(row => ({
      planName: row.planName ?? 'Unknown',
      count: Number(row.count),
    })),
  });
}

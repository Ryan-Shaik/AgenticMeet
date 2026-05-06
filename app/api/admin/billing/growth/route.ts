import { NextRequest, NextResponse } from 'next/server';
import { requireSystemAdmin } from '@/lib/admin';
import db from '@/db';
import { subscription } from '@/db/schema';
import { and, count, gte, lt, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export async function GET(req: NextRequest) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsedMonths = Number(req.nextUrl.searchParams.get('months') ?? 6);
  const months = Number.isFinite(parsedMonths)
    ? Math.min(Math.max(Math.trunc(parsedMonths), 1), 24)
    : 6;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const monthExpr = sql<string>`TO_CHAR(DATE_TRUNC('month', ${subscription.createdAt}), 'YYYY-MM')`;
  const monthGroup = sql`DATE_TRUNC('month', ${subscription.createdAt})`;

  const monthlyResult = await db
    .select({
      month: monthExpr,
      newSubscriptions: count(),
    })
    .from(subscription)
    .where(and(gte(subscription.createdAt, startDate), lt(subscription.createdAt, endDate)))
    .groupBy(monthGroup)
    .orderBy(monthGroup);

  const countsByMonth = new Map(
    monthlyResult.map(row => [row.month, Number(row.newSubscriptions)])
  );

  const data = Array.from({ length: months }, (_, index) => {
    const date = new Date(startDate.getFullYear(), startDate.getMonth() + index, 1);
    const month = getMonthKey(date);

    return {
      month,
      newSubscriptions: countsByMonth.get(month) ?? 0,
    };
  });

  return NextResponse.json(data);
}

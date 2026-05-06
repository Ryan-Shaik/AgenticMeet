import { NextResponse } from 'next/server';
import { requireSystemAdmin } from '@/lib/admin';
import db from '@/db';
import { plan, subscription, user } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function quoteCsvCell(value: string | number | Date | null | undefined) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = await db
    .select({
      userName: user.name,
      userEmail: user.email,
      planName: plan.name,
      price: plan.price,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
    })
    .from(subscription)
    .leftJoin(user, eq(subscription.userId, user.id))
    .leftJoin(plan, eq(subscription.planId, plan.id))
    .orderBy(desc(subscription.createdAt));

  const headers = [
    'Name',
    'Email',
    'Plan',
    'Price',
    'Status',
    'Period Start',
    'Period End',
    'Stripe ID',
  ];
  const rows = data.map(row => [
    row.userName,
    row.userEmail,
    row.planName,
    row.price,
    row.status,
    row.currentPeriodStart,
    row.currentPeriodEnd,
    row.stripeSubscriptionId,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(quoteCsvCell).join(','))
    .join('\n');
  const filenameDate = new Date().toISOString().slice(0, 7);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="billing-${filenameDate}.csv"`,
    },
  });
}

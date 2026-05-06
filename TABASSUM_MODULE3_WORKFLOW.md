# AgenticMeet — Module 3 Implementation Workflow
### Revenue Reporting & Billing Analytics Dashboard + Enterprise Team Subscription & Seat Management
**Engineer:** Tabassum Munir Mahi | **Course:** CSE471 System Analysis & Design | **Spring 2026**

---

## 0. BEFORE YOU TOUCH ANYTHING — READ THIS FIRST

This document is the **single source of truth** for any AI tool (Cursor, Claude Code, Kilo Code) 
working on Tabassum's Module 3. Read it fully before generating a single line of code.

### Project Tech Stack (DO NOT deviate)
- **Framework:** Next.js 16.2.2 (App Router — NOT pages router)
- **Language:** TypeScript (strict)
- **Styling:** TailwindCSS v4 + Shadcn UI
- **Database:** PostgreSQL via Neon DB
- **ORM:** Drizzle ORM with `drizzle-orm/pg-core`
- **Auth:** Better Auth (`@/lib/auth`, `@/lib/auth-client`)
- **Payments:** Stripe v22 (`@/lib/stripe`)
- **Deployment:** Vercel (no Node-only APIs in route handlers)

### How to Import Things in This Project
```typescript
// DB
import db from '@/db';
import { user, subscription, plan, usage } from '@/db/schema';

// Auth (server-side)
import { getSession } from '@/lib/auth';

// Auth (client-side)
import { authClient } from '@/lib/auth-client';

// Stripe
import { stripe } from '@/lib/stripe';

// Drizzle operators
import { eq, and, gte, lt, desc, sum, count, sql } from 'drizzle-orm';
```

---

## 1. WHAT ALREADY EXISTS (DO NOT RE-BUILD)

### Database Tables (in `db/schema.ts`)
| Table | Purpose |
|---|---|
| `user` | id, name, email, image, createdAt |
| `subscription` | userId, stripeCustomerId, stripeSubscriptionId, planId, status, currentPeriodStart, currentPeriodEnd |
| `plan` | id, name, stripePriceId, price, interval, meetingLimit, minuteLimit, aiLimit, features, isActive |
| `usage` | userId, meetingsUsed, minutesUsed, aiInteractionsUsed, periodStart, periodEnd |
| `meetings` | id, title, hostId, status, createdAt |

### Stripe APIs Already Wired
| File | What It Does |
|---|---|
| `app/api/stripe/checkout/route.ts` | Creates Stripe checkout session, handles success redirect |
| `app/api/stripe/webhook/route.ts` | Handles `checkout.session.completed`, subscription updated/deleted events |
| `app/api/stripe/portal/route.ts` | Opens Stripe Customer Portal, handles cancel action |
| `app/api/subscription/status/route.ts` | Returns current user's plan + usage |

### Existing UI Components
| Component | Location |
|---|---|
| `ManageSubscriptionButton` | `components/dashboard/manage-subscription.tsx` |
| Dashboard layout | `app/dashboard/page.tsx` — Server Component, uses `getSession()` |
| Plan display / Pricing | `app/pricing/page.tsx` |

---

## 2. WHAT YOU ARE BUILDING

### Feature A: Revenue Reporting & Billing Analytics Dashboard
**Who uses it:** System Admin only
**What it does:**
- Shows subscription growth over time (line/bar chart)
- Tracks MRR (Monthly Recurring Revenue) trends
- Displays payment statuses (active, past_due, canceled, inactive)
- Allows downloading billing reports as CSV

### Feature B: Enterprise Team Subscription & Seat Management
**Who uses it:** Team Admin (Enterprise plan users)
**What it does:**
- Team Admin can invite/remove team members
- Team Admin allocates subscription seats to members
- Billing is calculated per seat count
- Seat limits are enforced — cannot exceed plan's seat allocation
- Enterprise plan checkout creates a team subscription

---

## 3. DATABASE CHANGES NEEDED

### 3A. Add `teamSubscription` table (for Feature B)

Add to `db/schema.ts`:

```typescript
export const team = pgTable("team", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  adminId: text("admin_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planId: text("plan_id").notNull().references(() => plan.id),
  status: text("status").notNull().default("active"),
  seatCount: integer("seat_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMember = pgTable("team_member", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => team.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // "admin" | "member"
  status: text("status").notNull().default("pending"), // "pending" | "active" | "removed"
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  joinedAt: timestamp("joined_at"),
});
```

Also add relations:
```typescript
export const teamRelations = relations(team, ({ one, many }) => ({
  admin: one(user, { fields: [team.adminId], references: [user.id] }),
  plan: one(plan, { fields: [team.planId], references: [plan.id] }),
  members: many(teamMember),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(team, { fields: [teamMember.teamId], references: [team.id] }),
  user: one(user, { fields: [teamMember.userId], references: [user.id] }),
}));
```

### 3B. Add `systemRole` to `user` table

Add to the `user` table definition in `db/schema.ts`:
```typescript
systemRole: text("system_role").default("user"), // "user" | "team_admin" | "system_admin"
```

### 3C. Run Migration
After adding schema changes:
```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

---

## 4. FEATURE A — REVENUE REPORTING & BILLING ANALYTICS DASHBOARD

### 4.1 Access Control Helper

Create `lib/admin.ts`:
```typescript
import { getSession } from '@/lib/auth';
import db from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function requireSystemAdmin() {
  const session = await getSession();
  if (!session) return null;
  
  const userData = await db.select().from(user)
    .where(eq(user.id, session.user.id))
    .then(res => res[0]);
  
  if (userData?.systemRole !== 'system_admin') return null;
  return session;
}
```

### 4.2 API Routes to Build

#### `app/api/admin/billing/overview/route.ts`
**Method:** GET  
**Auth:** System Admin only  
**Returns:**
```typescript
{
  totalRevenue: number,         // sum of all active subscription prices
  mrr: number,                  // monthly recurring revenue
  subscriptionCounts: {
    active: number,
    past_due: number,
    canceled: number,
    inactive: number,
  },
  planBreakdown: Array<{
    planName: string,
    count: number,
    revenue: number,
  }>
}
```

**How to compute:**
- Query `subscription` joined with `plan`
- Group by `subscription.status` for counts
- Group by `plan.name` for breakdown
- MRR = sum of `plan.price` for all `status = 'active'` subscriptions where `plan.interval = 'month'`
- For annual plans: `plan.price / 12`

**Implementation skeleton:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireSystemAdmin } from '@/lib/admin';
import db from '@/db';
import { subscription, plan } from '@/db/schema';
import { eq, sql, count } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Query subscription counts by status
  const statusCounts = await db
    .select({
      status: subscription.status,
      count: count(),
    })
    .from(subscription)
    .groupBy(subscription.status);

  // Query plan breakdown with revenue
  const planBreakdown = await db
    .select({
      planName: plan.name,
      planPrice: plan.price,
      interval: plan.interval,
      count: count(),
    })
    .from(subscription)
    .leftJoin(plan, eq(subscription.planId, plan.id))
    .where(eq(subscription.status, 'active'))
    .groupBy(plan.name, plan.price, plan.interval);

  // Calculate MRR
  const mrr = planBreakdown.reduce((acc, row) => {
    const price = parseFloat(row.planPrice || '0');
    const monthly = row.interval === 'year' ? price / 12 : price;
    return acc + (monthly * row.count);
  }, 0);

  return NextResponse.json({
    mrr,
    statusCounts,
    planBreakdown,
  });
}
```

---

#### `app/api/admin/billing/growth/route.ts`
**Method:** GET  
**Query Params:** `?months=6` (default 6)  
**Auth:** System Admin only  
**Returns:** Monthly subscription counts and revenue for chart rendering

```typescript
// Returns array:
[
  { month: "2026-01", newSubscriptions: 12, canceledSubscriptions: 2, revenue: 450 },
  { month: "2026-02", newSubscriptions: 18, canceledSubscriptions: 1, revenue: 720 },
  ...
]
```

**How to compute:**
- Use `subscription.createdAt` grouped by month for new subscriptions
- Use `subscription.updatedAt` where status changed to `canceled`/`inactive` for cancellations
- Use SQL `DATE_TRUNC('month', created_at)` for grouping

**Drizzle SQL pattern for monthly grouping:**
```typescript
const monthly = await db
  .select({
    month: sql<string>`TO_CHAR(DATE_TRUNC('month', ${subscription.createdAt}), 'YYYY-MM')`,
    count: count(),
  })
  .from(subscription)
  .where(gte(subscription.createdAt, startDate))
  .groupBy(sql`DATE_TRUNC('month', ${subscription.createdAt})`)
  .orderBy(sql`DATE_TRUNC('month', ${subscription.createdAt})`);
```

---

#### `app/api/admin/billing/payments/route.ts`
**Method:** GET  
**Query Params:** `?page=1&limit=20&status=all`  
**Auth:** System Admin only  
**Returns:** Paginated list of subscriptions with user info and payment status

```typescript
// Returns:
{
  payments: Array<{
    userId: string,
    userName: string,
    userEmail: string,
    planName: string,
    status: string,
    price: string,
    currentPeriodEnd: Date | null,
    stripeSubscriptionId: string | null,
  }>,
  total: number,
  page: number,
}
```

---

#### `app/api/admin/billing/export/route.ts`
**Method:** GET  
**Auth:** System Admin only  
**Returns:** CSV file download  
**Headers:** `Content-Type: text/csv`, `Content-Disposition: attachment; filename="billing-report-YYYY-MM.csv"`

```typescript
export async function GET(req: NextRequest) {
  const admin = await requireSystemAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Fetch all subscriptions with user and plan data
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

  // Build CSV
  const headers = ['Name', 'Email', 'Plan', 'Price', 'Status', 'Period Start', 'Period End', 'Stripe ID'];
  const rows = data.map(row => [
    row.userName, row.userEmail, row.planName, row.price,
    row.status,
    row.currentPeriodStart?.toISOString() || '',
    row.currentPeriodEnd?.toISOString() || '',
    row.stripeSubscriptionId || '',
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="billing-report-${new Date().toISOString().slice(0, 7)}.csv"`,
    },
  });
}
```

---

### 4.3 Admin Dashboard Page

Create `app/admin/billing/page.tsx` — **Server Component**

```typescript
import { requireSystemAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { BillingOverviewCards } from '@/components/admin/BillingOverviewCards';
import { SubscriptionGrowthChart } from '@/components/admin/SubscriptionGrowthChart';
import { PaymentStatusTable } from '@/components/admin/PaymentStatusTable';
import { ExportReportButton } from '@/components/admin/ExportReportButton';

export default async function AdminBillingPage() {
  const admin = await requireSystemAdmin();
  if (!admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Billing Analytics</h1>
            <p className="text-white/50 mt-1">Revenue reporting & subscription metrics</p>
          </div>
          <ExportReportButton />
        </div>
        
        {/* KPI Cards */}
        <BillingOverviewCards />
        
        {/* Growth Chart */}
        <div className="mt-8">
          <SubscriptionGrowthChart />
        </div>
        
        {/* Payment Status Table */}
        <div className="mt-8">
          <PaymentStatusTable />
        </div>
      </div>
    </div>
  );
}
```

### 4.4 Components to Build

All components go in `components/admin/`.

#### `BillingOverviewCards.tsx` — Client Component
- Fetches from `/api/admin/billing/overview`
- Displays 4 cards: MRR, Active Subscriptions, Past Due, Churn Rate
- Use Tailwind for card styling (dark glass-morphism to match existing dashboard)

```typescript
'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, AlertTriangle, BarChart2 } from 'lucide-react';

interface OverviewData {
  mrr: number;
  statusCounts: Array<{ status: string; count: number }>;
  planBreakdown: Array<{ planName: string; count: number; revenue: number }>;
}

export function BillingOverviewCards() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/billing/overview')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // Derive values from data
  const active = data?.statusCounts.find(s => s.status === 'active')?.count || 0;
  const pastDue = data?.statusCounts.find(s => s.status === 'past_due')?.count || 0;
  const canceled = data?.statusCounts.find(s => s.status === 'canceled')?.count || 0;
  const total = (data?.statusCounts || []).reduce((a, s) => a + Number(s.count), 0);
  const churnRate = total > 0 ? ((canceled / total) * 100).toFixed(1) : '0';

  const cards = [
    { label: 'Monthly Recurring Revenue', value: `$${data?.mrr.toFixed(2) || '0.00'}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Active Subscriptions', value: String(active), icon: Users, color: 'text-blue-400' },
    { label: 'Past Due', value: String(pastDue), icon: AlertTriangle, color: 'text-yellow-400' },
    { label: 'Churn Rate', value: `${churnRate}%`, icon: BarChart2, color: 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <card.icon size={20} className={card.color} />
            <span className="text-white/50 text-sm">{card.label}</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {loading ? '—' : card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### `SubscriptionGrowthChart.tsx` — Client Component
- Fetches from `/api/admin/billing/growth?months=6`
- Renders a bar/line chart using native SVG or a lightweight chart library
- **Do NOT add recharts or chart.js** — use SVG bars directly for simplicity and to avoid adding dependencies

#### `PaymentStatusTable.tsx` — Client Component
- Fetches from `/api/admin/billing/payments`
- Shows paginated table: Name | Email | Plan | Status | Amount | Renewal Date
- Status badge: green=active, yellow=past_due, red=canceled, gray=inactive
- Supports filtering by status via dropdown

#### `ExportReportButton.tsx` — Client Component
```typescript
'use client';
export function ExportReportButton() {
  const handleExport = () => {
    window.location.href = '/api/admin/billing/export';
  };
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
    >
      Download CSV Report
    </button>
  );
}
```

---

## 5. FEATURE B — ENTERPRISE TEAM SUBSCRIPTION & SEAT MANAGEMENT

### 5.1 How Enterprise Billing Works

1. A user upgrades to Enterprise plan via Stripe checkout → their `subscription.planId = 'enterprise'`
2. They become a **Team Admin** (`user.systemRole = 'team_admin'`)
3. A `team` record is created for them
4. They can invite members by email up to their seat limit
5. Invited members accept → `teamMember.status` changes to `active`
6. Billing = seat count × price per seat (tracked in `team.seatCount`)
7. Stripe subscription quantity = seat count (update via Stripe API when seats change)

### 5.2 Stripe Webhook — Extend Existing Handler

In `app/api/stripe/webhook/route.ts`, add to the `checkout.session.completed` case:

```typescript
// After updating subscription status:
if (planId === 'enterprise') {
  const { nanoid } = await import('nanoid'); // or use crypto.randomUUID()
  
  // Set user as team_admin
  await db.update(user)
    .set({ systemRole: 'team_admin' })
    .where(eq(user.id, userId));

  // Create team if not exists
  const existingTeam = await db.select().from(team)
    .where(eq(team.adminId, userId))
    .then(r => r[0]);

  if (!existingTeam) {
    await db.insert(team).values({
      id: crypto.randomUUID(),
      name: `${userData.name}'s Team`,
      adminId: userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      planId: 'enterprise',
      status: 'active',
      seatCount: 1,
    });
  }
}
```

### 5.3 API Routes to Build

#### `app/api/team/route.ts`
**GET** — Returns the team for the authenticated Team Admin  
**POST** — Creates a team (called after enterprise checkout, usually handled by webhook)

```typescript
// GET response:
{
  id: string,
  name: string,
  seatCount: number,
  planName: string,
  status: string,
  members: Array<{
    id: string,
    email: string,
    name: string | null,
    role: string,
    status: string,
    joinedAt: Date | null,
  }>,
  seatsUsed: number,
  seatsRemaining: number,
}
```

---

#### `app/api/team/members/route.ts`
**POST** — Invite a new member  
**Body:** `{ email: string }`  
**Auth:** Team Admin only

```typescript
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check user is team_admin
  const userData = await db.select().from(user)
    .where(eq(user.id, session.user.id)).then(r => r[0]);
  
  if (userData?.systemRole !== 'team_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email } = await req.json();
  
  // Get the team
  const userTeam = await db.select().from(team)
    .where(eq(team.adminId, session.user.id)).then(r => r[0]);
  
  if (!userTeam) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  
  // Check seat limit
  const memberCount = await db.select({ count: count() }).from(teamMember)
    .where(and(
      eq(teamMember.teamId, userTeam.id),
      eq(teamMember.status, 'active')
    )).then(r => Number(r[0]?.count || 0));
  
  if (memberCount >= userTeam.seatCount) {
    return NextResponse.json({ error: 'Seat limit reached. Upgrade to add more members.' }, { status: 400 });
  }

  // Check if already invited
  const existing = await db.select().from(teamMember)
    .where(and(eq(teamMember.teamId, userTeam.id), eq(teamMember.email, email)))
    .then(r => r[0]);
  
  if (existing) return NextResponse.json({ error: 'Member already invited' }, { status: 400 });

  // Create invitation
  await db.insert(teamMember).values({
    id: crypto.randomUUID(),
    teamId: userTeam.id,
    email,
    role: 'member',
    status: 'pending',
  });

  // TODO: Send invitation email (use Next.js email or Resend if available)
  
  return NextResponse.json({ success: true, message: `Invitation sent to ${email}` });
}
```

---

#### `app/api/team/members/[memberId]/route.ts`
**DELETE** — Remove a member  
**Auth:** Team Admin only

```typescript
export async function DELETE(req: NextRequest, { params }: { params: { memberId: string } }) {
  // 1. Verify session + team_admin role
  // 2. Verify the member belongs to this admin's team
  // 3. Set teamMember.status = 'removed'
  // 4. Do NOT decrement seatCount (seat is freed but not removed from billing)
  // 5. Return { success: true }
}
```

---

#### `app/api/team/seats/route.ts`
**PUT** — Update seat count  
**Body:** `{ seatCount: number }`  
**Auth:** Team Admin only

```typescript
export async function PUT(req: NextRequest) {
  // 1. Verify session + team_admin role
  // 2. Get team
  // 3. Validate: seatCount >= current active member count (cannot reduce below active members)
  // 4. Update team.seatCount
  // 5. Update Stripe subscription quantity:
  //    await stripe.subscriptions.update(team.stripeSubscriptionId, {
  //      items: [{ id: subscriptionItem.id, quantity: seatCount }]
  //    });
  // 6. Return updated team
}
```

---

#### `app/api/team/billing/route.ts`
**GET** — Returns billing calculation for the team  
**Auth:** Team Admin only

```typescript
// Returns:
{
  seatCount: number,
  pricePerSeat: number,
  billingTotal: number,
  currency: string,
  interval: string,
  nextRenewal: Date | null,
}
```

---

### 5.4 Team Management Page

Create `app/team/page.tsx` — **Server Component**

```typescript
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import db from '@/db';
import { user, team } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { TeamMembersPanel } from '@/components/team/TeamMembersPanel';
import { SeatManagementPanel } from '@/components/team/SeatManagementPanel';
import { TeamBillingSummary } from '@/components/team/TeamBillingSummary';

export default async function TeamPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const userData = await db.select().from(user)
    .where(eq(user.id, session.user.id))
    .then(r => r[0]);

  if (userData?.systemRole !== 'team_admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Team Management</h1>
        <p className="text-white/50 mb-8">Manage members, seats, and billing</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <TeamMembersPanel />
          </div>
          <div>
            <SeatManagementPanel />
            <div className="mt-4">
              <TeamBillingSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5.5 Components to Build

All components go in `components/team/`.

#### `TeamMembersPanel.tsx` — Client Component
**Fetches:** `/api/team`  
**Shows:**
- Table of all members: Email | Name | Role | Status | Date Joined | Remove button
- "Invite Member" form at top (input + button)
- Status badges: pending=gray, active=green, removed=red

```typescript
'use client';
import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export function TeamMembersPanel() {
  const [team, setTeam] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');

  const fetchTeam = async () => {
    setLoading(true);
    const data = await fetch('/api/team').then(r => r.json());
    setTeam(data);
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);
    setError('');
    const res = await fetch('/api/team/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else { setEmail(''); fetchTeam(); }
    setInviting(false);
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member?')) return;
    await fetch(`/api/team/members/${memberId}`, { method: 'DELETE' });
    fetchTeam();
  };

  // Render: invite form + member table
  // ...
}
```

#### `SeatManagementPanel.tsx` — Client Component
**Fetches:** `/api/team`  
**Shows:**
- Current seats used / total seat count
- Progress bar (used/total)
- Number input to adjust seat count
- "Update Seats" button
- Warning if at/near limit

#### `TeamBillingSummary.tsx` — Client Component
**Fetches:** `/api/team/billing`  
**Shows:**
- Price per seat
- Total monthly/annual cost
- Next renewal date
- Link to Stripe Portal for billing management

---

## 6. NAVIGATION INTEGRATION

### 6A. Add Admin Link in Dashboard
In `app/dashboard/page.tsx`, inside the sidebar nav, add a link visible only to `system_admin`:

```typescript
// At top of Dashboard server component, after fetching session:
const userData = await db.select().from(user)
  .where(eq(user.id, session.user.id))
  .then(r => r[0]);

// In JSX, conditionally render:
{userData?.systemRole === 'system_admin' && (
  <Link href="/admin/billing" className="...">
    Billing Admin
  </Link>
)}
```

### 6B. Add Team Link in Dashboard
```typescript
{userData?.systemRole === 'team_admin' && (
  <Link href="/team" className="...">
    Team Management
  </Link>
)}
```

---

## 7. ENVIRONMENT VARIABLES NEEDED

No new env vars required for Feature A (uses existing Stripe).

For Feature B (seat-based billing), you need an Enterprise price ID in Stripe that supports quantity. Add to `.env.local`:
```
STRIPE_ENTERPRISE_PRICE_ID=price_xxxx  # Should already exist
```

The Enterprise Stripe Price must be configured as a **per-seat** price (quantity-based) in Stripe Dashboard.

---

## 8. BUILD ORDER — DO THIS IN SEQUENCE

```
Phase 1 — Foundation (No UI yet)
├── Step 1: Add systemRole to user table in schema.ts
├── Step 2: Add team + teamMember tables to schema.ts
├── Step 3: Run drizzle migration
└── Step 4: Create lib/admin.ts

Phase 2 — Feature A APIs
├── Step 5: app/api/admin/billing/overview/route.ts
├── Step 6: app/api/admin/billing/growth/route.ts
├── Step 7: app/api/admin/billing/payments/route.ts
└── Step 8: app/api/admin/billing/export/route.ts

Phase 3 — Feature A UI
├── Step 9: components/admin/BillingOverviewCards.tsx
├── Step 10: components/admin/SubscriptionGrowthChart.tsx
├── Step 11: components/admin/PaymentStatusTable.tsx
├── Step 12: components/admin/ExportReportButton.tsx
└── Step 13: app/admin/billing/page.tsx

Phase 4 — Feature B APIs
├── Step 14: Extend stripe webhook for enterprise plan logic
├── Step 15: app/api/team/route.ts (GET team)
├── Step 16: app/api/team/members/route.ts (POST invite)
├── Step 17: app/api/team/members/[memberId]/route.ts (DELETE)
├── Step 18: app/api/team/seats/route.ts (PUT update seats)
└── Step 19: app/api/team/billing/route.ts

Phase 5 — Feature B UI
├── Step 20: components/team/TeamMembersPanel.tsx
├── Step 21: components/team/SeatManagementPanel.tsx
├── Step 22: components/team/TeamBillingSummary.tsx
└── Step 23: app/team/page.tsx

Phase 6 — Integration
├── Step 24: Add systemAdmin/teamAdmin nav links in dashboard
└── Step 25: Manual test: seed a system_admin user in DB, verify all routes
```

---

## 9. PROMPTS FOR AI TOOLS

Use these exact prompts when delegating to Cursor / Kilo Code / Claude Code.

---

### PROMPT 1 — Schema Migration
```
I am working on AgenticMeet, a Next.js 16 app using Drizzle ORM with PostgreSQL (Neon DB).

In `db/schema.ts`, I need you to:
1. Add `systemRole: text("system_role").default("user")` to the existing `user` table
2. Add a new `team` table with: id, name, adminId (FK→user), stripeCustomerId, stripeSubscriptionId, planId (FK→plan), status, seatCount (integer, default 1), createdAt, updatedAt
3. Add a new `teamMember` table with: id, teamId (FK→team cascade), userId (FK→user set null), email, role (default "member"), status (default "pending"), invitedAt, joinedAt
4. Add teamRelations and teamMemberRelations using drizzle-orm relations()
5. Export types: Team, TeamMember

Follow the exact existing patterns in the file. Use `pgTable`, `text`, `integer`, `timestamp`, `relations` from drizzle-orm/pg-core. Do not use any other packages.

After editing schema.ts, tell me the exact commands to generate and run the migration.
```

---

### PROMPT 2 — Admin Billing Overview API
```
I am building an admin billing dashboard for AgenticMeet (Next.js 16, Drizzle ORM, PostgreSQL).

Create `app/api/admin/billing/overview/route.ts`.

Requirements:
- Import `requireSystemAdmin` from `@/lib/admin` — if it returns null, return 403
- Query the `subscription` table joined with `plan` table
- Return: { mrr: number, statusCounts: [{status, count}], planBreakdown: [{planName, count, revenue}] }
- MRR = sum of prices for active monthly subs + (annual price / 12) for annual subs
- Use drizzle-orm operators: eq, count, sql — import from 'drizzle-orm'
- Import db from '@/db', subscription and plan from '@/db/schema'
- This is a Next.js App Router route handler (no getServerSideProps, no pages router)
```

---

### PROMPT 3 — Growth Chart API
```
In AgenticMeet (Next.js 16 App Router, Drizzle ORM), create `app/api/admin/billing/growth/route.ts`.

- Auth: requireSystemAdmin from @/lib/admin, return 403 if unauthorized
- Accept query param: months (default 6, max 24)
- Calculate startDate = today minus `months` months
- Query subscription table grouped by month using:
  sql`TO_CHAR(DATE_TRUNC('month', ${subscription.createdAt}), 'YYYY-MM')`
- Return array: [{ month: "YYYY-MM", newSubscriptions: number, revenue: number }]
- Revenue per month = count * average plan price for that month (join with plan table)
- Import: db from '@/db', subscription, plan, user from '@/db/schema'
- Drizzle operators: eq, gte, count, sql, desc — from 'drizzle-orm'
```

---

### PROMPT 4 — Payment Status Table API
```
In AgenticMeet, create `app/api/admin/billing/payments/route.ts`.

- Auth: requireSystemAdmin from @/lib/admin
- Query params: page (default 1), limit (default 20), status (default "all")
- Join subscription + user + plan tables
- If status param !== "all", filter by subscription.status
- Return: { payments: [...], total: number, page: number }
- Each payment: { userId, userName, userEmail, planName, status, price, currentPeriodEnd, stripeSubscriptionId }
- Use drizzle offset/limit pagination
```

---

### PROMPT 5 — CSV Export API
```
In AgenticMeet, create `app/api/admin/billing/export/route.ts`.

- Auth: requireSystemAdmin from @/lib/admin, return 403 if unauthorized  
- Join subscription + user + plan — fetch all records ordered by createdAt desc
- Build CSV string with headers: Name, Email, Plan, Price (USD), Status, Period Start, Period End, Stripe ID
- Return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': attachment filename with current YYYY-MM } })
- No external CSV library — build the string manually with .map().join()
```

---

### PROMPT 6 — Billing Overview Cards Component
```
In AgenticMeet (Next.js 16, TailwindCSS v4, TypeScript), create `components/admin/BillingOverviewCards.tsx`.

- 'use client' component
- Fetch from /api/admin/billing/overview on mount with useEffect
- Show 4 cards in a responsive grid (1 col mobile, 4 col desktop):
  1. Monthly Recurring Revenue ($ amount, emerald icon)
  2. Active Subscriptions (count, blue icon)
  3. Past Due (count, yellow icon)  
  4. Churn Rate as % = canceled / total * 100, red icon
- While loading, show "—" in value
- Use lucide-react icons: TrendingUp, Users, AlertTriangle, BarChart2
- Cards styled: bg-white/5 border border-white/10 rounded-xl p-6 (dark theme, matches existing dashboard)
- No recharts, no chart.js — this is just stat cards
```

---

### PROMPT 7 — Subscription Growth Chart (SVG)
```
In AgenticMeet (Next.js 16, TailwindCSS v4, TypeScript), create `components/admin/SubscriptionGrowthChart.tsx`.

- 'use client' component  
- Fetch from /api/admin/billing/growth?months=6
- Render a bar chart using raw SVG — no recharts, no chart.js
- SVG viewBox="0 0 600 250", bars for each month
- Bar height proportional to newSubscriptions count
- Show month label below each bar (YYYY-MM)
- Show count above each bar
- Color: bg-emerald-500 for bars
- Container: bg-white/5 border border-white/10 rounded-xl p-6
- Title: "Subscription Growth (Last 6 Months)"
- Add month selector: buttons for 3, 6, 12 months
```

---

### PROMPT 8 — Payment Status Table Component
```
In AgenticMeet (Next.js 16, TailwindCSS v4, TypeScript), create `components/admin/PaymentStatusTable.tsx`.

- 'use client' component
- Fetch from /api/admin/billing/payments with page and status params
- Show table with columns: Name | Email | Plan | Status | Amount | Renewal Date
- Status badge colors: active=green, past_due=yellow, canceled=red, inactive=gray
- Status filter dropdown (All / Active / Past Due / Canceled)
- Pagination: Previous / Next buttons
- Container: bg-white/5 border border-white/10 rounded-xl p-6
- Title: "Payment Status"
- Table rows: text-sm text-white/70, hover:bg-white/5
- Loading state: show skeleton rows (opacity-50 animate-pulse divs)
```

---

### PROMPT 9 — Team Members Panel Component  
```
In AgenticMeet (Next.js 16, TailwindCSS v4, TypeScript), create `components/team/TeamMembersPanel.tsx`.

- 'use client' component
- Fetch team data from GET /api/team on mount
- Show: invite form (email input + "Invite" button) at top
- Show members table: Email | Name | Role | Status | Joined | Action
- Status badges: pending=gray, active=green, removed=red/strikethrough
- Remove button (Trash2 icon from lucide-react) — calls DELETE /api/team/members/{id}
- Invite: POST to /api/team/members with { email }
- Show error message if invite fails (e.g. "Seat limit reached")
- Show success toast or inline message on invite success
- After any action, re-fetch team data
- Disable invite button if seatsRemaining === 0, show tooltip "Upgrade plan to add more seats"
- Container: bg-white/5 border border-white/10 rounded-xl p-6
```

---

### PROMPT 10 — Seat Management Panel
```
In AgenticMeet (Next.js 16, TailwindCSS v4, TypeScript), create `components/team/SeatManagementPanel.tsx`.

- 'use client' component
- Fetch from GET /api/team
- Show: "Seats: X / Y used" with progress bar
- Number input to set new seat count (min = current active members)
- "Update Seats" button → PUT /api/team/seats with { seatCount }
- Warn if seatCount < seatsUsed: "Cannot reduce below current member count"
- Show billing implication: "Each seat costs $X/month"
- Container: bg-white/5 border border-white/10 rounded-xl p-6
- Progress bar: bg-emerald-500 width proportional to used/total
```

---

### PROMPT 11 — Team Invite API
```
In AgenticMeet (Next.js 16 App Router, Drizzle ORM, TypeScript), create `app/api/team/members/route.ts`.

POST handler:
- Get session via getSession() from '@/lib/auth'
- Get user from DB, check systemRole === 'team_admin', else 403
- Parse body: { email: string }
- Get team where adminId = session.user.id
- Count active members in teamMember where teamId = team.id AND status = 'active'
- If count >= team.seatCount: return 400 "Seat limit reached"
- Check if email already in teamMember for this team: return 400 if so
- Insert new teamMember: { id: crypto.randomUUID(), teamId, email, role: 'member', status: 'pending' }
- Return { success: true, message: "Invitation sent to {email}" }

Import: db from '@/db', team, teamMember, user from '@/db/schema'
Drizzle: eq, and, count from 'drizzle-orm'
```

---

### PROMPT 12 — Team Remove Member API
```
In AgenticMeet, create `app/api/team/members/[memberId]/route.ts`.

DELETE handler:
- Params: { memberId: string }
- Verify session (getSession from @/lib/auth)
- Get user, verify systemRole === 'team_admin'
- Get team where adminId = session.user.id
- Get teamMember where id = memberId AND teamId = team.id (prevents removing members from other teams)
- If not found: 404
- If member role === 'admin': 400 "Cannot remove the team admin"
- Update teamMember.status = 'removed'
- Return { success: true }
```

---

### PROMPT 13 — Dashboard Navigation Integration
```
In AgenticMeet, modify `app/dashboard/page.tsx` (Server Component):

1. After fetching session, also fetch userData from user table to get systemRole
2. In the existing sidebar navigation, add these conditional links:

   If systemRole === 'system_admin':
   - Link href="/admin/billing" with BarChart2 icon (from lucide-react) and label "Billing Admin"
   - Style to match existing sidebar links

   If systemRole === 'team_admin':  
   - Link href="/team" with Users icon (from lucide-react) and label "Team"
   - Style to match existing sidebar links

Do not change any existing navigation items. Only add new conditional ones.
Preserve all existing imports and logic.
```

---

## 10. TESTING CHECKLIST

After building, verify each item manually:

**Feature A — Admin Billing Dashboard**
- [ ] Navigating to `/admin/billing` as a non-admin redirects to `/dashboard`
- [ ] After setting `systemRole = 'system_admin'` in DB for test user, `/admin/billing` loads
- [ ] Overview cards show MRR and subscription counts from DB
- [ ] Growth chart renders bars (even if data is zero)
- [ ] Payment table shows rows from subscription table
- [ ] "Download CSV" button triggers file download
- [ ] CSV file opens correctly in Excel with all columns

**Feature B — Team Management**
- [ ] Enterprise checkout sets `systemRole = 'team_admin'` and creates a `team` record
- [ ] `/team` page loads for team_admin, redirects for regular users
- [ ] Invite form sends POST and member appears in table with "pending" status
- [ ] Cannot invite when at seat limit — error message shown
- [ ] Remove button sets status to "removed"
- [ ] Seat count update reflects in the progress bar
- [ ] Team billing panel shows correct price calculation

---

## 11. CRITICAL RULES FOR AI TOOLS

1. **Never use `pages/` router** — this is App Router. All routes are in `app/` folder.
2. **Server Components have `async`** — `export default async function Page()` ✅
3. **Client Components need `'use client'`** at top — for useState, useEffect, event handlers.
4. **Route handlers are in `route.ts`** files, not `[page].ts`.
5. **Always use `@/` path alias** — never relative `../../` imports for lib/db/components.
6. **Drizzle queries return arrays** — always `.then(r => r[0])` for single records.
7. **Never install new packages without checking `package.json` first.**
8. **Check `db/schema.ts` before every query** — use the exact column names defined there.
9. **Status values in subscription table:** `'active'`, `'inactive'`, `'canceled'`, `'past_due'`
10. **Plan IDs in use:** `'free'`, `'pro'`, `'enterprise'`

---

*Document prepared by Claude Sonnet 4.6 — AgenticMeet CSE471 Spring 2026*
*Last updated: April 2026*

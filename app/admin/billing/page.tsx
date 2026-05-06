import { redirect } from 'next/navigation';
import { BillingOverviewCards } from '@/components/admin/BillingOverviewCards';
import { ExportReportButton } from '@/components/admin/ExportReportButton';
import { PaymentStatusTable } from '@/components/admin/PaymentStatusTable';
import { SubscriptionGrowthChart } from '@/components/admin/SubscriptionGrowthChart';
import { requireSystemAdmin } from '@/lib/admin';

export default async function AdminBillingPage() {
  const admin = await requireSystemAdmin();
  if (!admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold">Billing Analytics</h1>
          <ExportReportButton />
        </div>

        <BillingOverviewCards />

        <div className="mt-8">
          <SubscriptionGrowthChart />
        </div>

        <div className="mt-8">
          <PaymentStatusTable />
        </div>
      </div>
    </div>
  );
}

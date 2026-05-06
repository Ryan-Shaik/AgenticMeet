'use client';

export function ExportReportButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = '/api/admin/billing/export';
      }}
      className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
    >
      Download CSV Report
    </button>
  );
}

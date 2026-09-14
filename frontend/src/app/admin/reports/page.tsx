"use client";

import * as React from "react";
import { ReportCard } from "@/components/admin/report-card";
import { RequireAdmin } from "@/components/navigation/require-admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdminReports } from "@/lib/api/admin";
import { REPORT_STATUSES, type AdminReport, type ReportStatus } from "@/types/admin";

const TABS: Array<{ value: ReportStatus | "all"; label: string }> = [
  { value: "pending", label: "Pending" },
  ...REPORT_STATUSES.filter((s) => s !== "pending").map((status) => ({
    value: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
  })),
  { value: "all", label: "All" },
];

function ReportsForStatus({ status }: { status: ReportStatus | "all" }) {
  const [reports, setReports] = React.useState<AdminReport[] | null>(null);

  const load = React.useCallback(() => {
    fetchAdminReports(status === "all" ? undefined : status)
      .then(setReports)
      .catch(() => setReports([]));
  }, [status]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to loading state when the status filter changes
    setReports(null);
    load();
  }, [load]);

  function handleStatusChanged(updated: AdminReport) {
    setReports((current) => {
      if (status === "all") {
        return (current ?? []).map((r) => (r.id === updated.id ? updated : r));
      }
      return (current ?? []).filter((r) => r.id !== updated.id);
    });
  }

  function handleReviewDeleted(reportId: number) {
    setReports((current) => (current ?? []).filter((r) => r.id !== reportId));
  }

  if (reports === null) {
    return <p className="text-sm text-muted-foreground">Loading reports...</p>;
  }

  if (reports.length === 0) {
    return <p className="text-sm text-muted-foreground">No reports here.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onStatusChanged={handleStatusChanged}
          onReviewDeleted={handleReviewDeleted}
        />
      ))}
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <RequireAdmin>
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Moderate reported Brew Scout reviews.</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              <ReportsForStatus status={tab.value} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </RequireAdmin>
  );
}
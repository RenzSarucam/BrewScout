import { apiClient } from "@/lib/api/client";
import type { AdminReport, ReportStatus } from "@/types/admin";

export function fetchAdminReports(status?: ReportStatus) {
  const query = status ? `?status=${status}` : "";
  return apiClient.get<AdminReport[]>(`/v1/admin/reports${query}`);
}

export function updateReportStatus(reportId: number, status: ReportStatus) {
  return apiClient.patch<AdminReport>(`/v1/admin/reports/${reportId}`, { status });
}
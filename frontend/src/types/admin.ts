import type { ReportReason } from "@/types/review";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export const REPORT_STATUSES: ReportStatus[] = ["pending", "reviewed", "resolved", "dismissed"];

export interface AdminReport {
  id: number;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  created_at: string;
  reporter: {
    id: number;
    name: string;
  };
  review: {
    id: number;
    rating: number;
    comment: string | null;
    author: {
      id: number;
      name: string;
    };
    place_id: string;
  } | null;
}
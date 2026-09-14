import { apiClient } from "@/lib/api/client";
import type { ReportReason } from "@/types/review";

export function reportReview(reviewId: number, reason: ReportReason, description: string) {
  return apiClient.post<{ id: number; status: string }>("/v1/reports", {
    review_id: reviewId,
    reason,
    description: description.length > 0 ? description : null,
  });
}
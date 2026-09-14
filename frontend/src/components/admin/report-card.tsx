"use client";

import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api/client";
import { deleteReview } from "@/lib/api/reviews";
import { updateReportStatus } from "@/lib/api/admin";
import { REPORT_REASONS } from "@/types/review";
import type { AdminReport, ReportStatus } from "@/types/admin";

interface ReportCardProps {
  report: AdminReport;
  onStatusChanged: (report: AdminReport) => void;
  onReviewDeleted: (reportId: number) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function reasonLabel(reason: string): string {
  return REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;
}

export function ReportCard({ report, onStatusChanged, onReviewDeleted }: ReportCardProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleSetStatus(status: ReportStatus) {
    setIsUpdating(true);
    try {
      const updated = await updateReportStatus(report.id, status);
      onStatusChanged(updated);
      toast.success(`Report marked as ${status}.`);
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteReview() {
    if (!report.review) return;

    setIsDeleting(true);
    try {
      await deleteReview(report.review.id);
      onReviewDeleted(report.id);
      toast.success("Review deleted.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const busy = isUpdating || isDeleting;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{reasonLabel(report.reason)}</span>
          <span className="text-xs text-muted-foreground">
            Reported by {report.reporter.name} on {formatDate(report.created_at)}
          </span>
        </div>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium capitalize text-secondary-foreground">
          {report.status}
        </span>
      </div>

      {report.description && <p className="text-sm text-muted-foreground">&ldquo;{report.description}&rdquo;</p>}

      {report.review ? (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-foreground">{report.review.author.name}</span>
            <span aria-hidden="true" className="text-primary">
              {"★".repeat(report.review.rating)}
              <span className="text-muted-foreground">{"★".repeat(5 - report.review.rating)}</span>
            </span>
          </div>
          {report.review.comment && <p className="text-sm text-foreground">{report.review.comment}</p>}
          <Link
            href={`/coffee/${encodeURIComponent(report.review.place_id)}`}
            className="w-fit text-xs text-primary hover:underline"
          >
            View coffee shop
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">The reported review no longer exists.</p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {report.status !== "reviewed" && (
          <Button type="button" variant="secondary" size="sm" onClick={() => handleSetStatus("reviewed")} disabled={busy}>
            Mark reviewed
          </Button>
        )}
        {report.status !== "resolved" && (
          <Button type="button" variant="secondary" size="sm" onClick={() => handleSetStatus("resolved")} disabled={busy}>
            Mark resolved
          </Button>
        )}
        {report.status !== "dismissed" && (
          <Button type="button" variant="secondary" size="sm" onClick={() => handleSetStatus("dismissed")} disabled={busy}>
            Dismiss
          </Button>
        )}
        {report.review && (
          <Button type="button" variant="destructive" size="sm" onClick={handleDeleteReview} disabled={busy}>
            {isDeleting ? "Deleting..." : "Delete review"}
          </Button>
        )}
      </div>
    </div>
  );
}
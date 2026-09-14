"use client";

import { Flag, MapPin, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReportReviewDialog } from "@/components/coffee/report-review-dialog";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { deleteReview } from "@/lib/api/reviews";
import type { Review } from "@/types/review";

interface ReviewCardProps {
  review: Review;
  onEdit: () => void;
  onDeleted: (reviewId: number) => void;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ReviewCard({ review, onEdit, onDeleted }: ReviewCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);

  function handleReportClick() {
    if (!user) {
      toast.error("Log in to report a review.");
      router.push("/login");
      return;
    }
    setReportOpen(true);
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteReview(review.id);
      onDeleted(review.id);
      toast.success("Review deleted.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{review.user.name}</span>
          <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
        </div>
        <span aria-hidden="true" className="text-primary">
          {"★".repeat(review.rating)}
          <span className="text-muted-foreground">{"★".repeat(5 - review.rating)}</span>
        </span>
      </div>

      {review.visit_verified && (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          <MapPin aria-hidden="true" className="h-3 w-3" />
          Location-verified visit
        </span>
      )}

      {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}

      <div className="flex gap-2 pt-1">
        {review.is_own ? (
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
              <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={handleReportClick}>
            <Flag aria-hidden="true" className="h-3.5 w-3.5" />
            Report
          </Button>
        )}
      </div>

      <ReportReviewDialog reviewId={review.id} open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
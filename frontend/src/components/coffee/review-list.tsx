"use client";

import * as React from "react";
import { ReviewCard } from "@/components/coffee/review-card";
import { ReviewFormDialog } from "@/components/coffee/review-form-dialog";
import { fetchReviews } from "@/lib/api/reviews";
import type { Review } from "@/types/review";

interface ReviewListProps {
  placeId: string;
  refreshKey: number;
}

export function ReviewList({ placeId, refreshKey }: ReviewListProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingReview, setEditingReview] = React.useState<Review | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/refresh
    setIsLoading(true);

    fetchReviews(placeId)
      .then((results) => {
        if (!cancelled) setReviews(results);
      })
      .catch(() => {
        // leave the list empty — the section header still explains there's nothing to show
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [placeId, refreshKey]);

  function handleDeleted(reviewId: number) {
    setReviews((current) => current.filter((r) => r.id !== reviewId));
  }

  function handleSaved(updated: Review) {
    setReviews((current) => current.map((r) => (r.id === updated.id ? updated : r)));
    setEditingReview(null);
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">No Brew Scout reviews yet. Be the first to share one!</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onEdit={() => setEditingReview(review)} onDeleted={handleDeleted} />
      ))}

      {editingReview && (
        <ReviewFormDialog
          placeId={placeId}
          review={editingReview}
          open
          onOpenChange={(open) => !open && setEditingReview(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
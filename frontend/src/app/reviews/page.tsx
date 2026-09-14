"use client";

import Link from "next/link";
import * as React from "react";
import { LoadingState } from "@/components/layout/loading-state";
import { RequireAuth } from "@/components/navigation/require-auth";
import { fetchMyReviews } from "@/lib/api/reviews";
import type { MyReview } from "@/types/review";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function MyReviewsList() {
  const [reviews, setReviews] = React.useState<MyReview[] | null>(null);

  React.useEffect(() => {
    fetchMyReviews()
      .then(setReviews)
      .catch(() => setReviews([]));
  }, []);

  if (reviews === null) {
    return <LoadingState label="Loading your reviews..." />;
  }

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground">
        You haven&apos;t written any reviews yet. Visit a coffee shop&apos;s page to write one.
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {reviews.map((review) => (
        <Link
          key={review.id}
          href={`/coffee/${encodeURIComponent(review.place.place_id)}`}
          className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-foreground">{review.place.name}</span>
            <span aria-hidden="true" className="text-primary">
              {"★".repeat(review.rating)}
              <span className="text-muted-foreground">{"★".repeat(5 - review.rating)}</span>
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
          {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}
        </Link>
      ))}
    </div>
  );
}

export default function Page() {
  return (
    <RequireAuth>
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold text-foreground">My Reviews</h1>
        <MyReviewsList />
      </main>
    </RequireAuth>
  );
}
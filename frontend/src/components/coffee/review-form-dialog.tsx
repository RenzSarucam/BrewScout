"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/coffee/star-rating-input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ApiRequestError } from "@/lib/api/client";
import { submitReview, updateReview } from "@/lib/api/reviews";
import { reviewSchema, type ReviewValues } from "@/lib/validation/review";
import type { Review } from "@/types/review";

interface ReviewFormDialogProps {
  placeId: string;
  review?: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (review: Review) => void;
}

export function ReviewFormDialog({ placeId, review, open, onOpenChange, onSaved }: ReviewFormDialogProps) {
  const geolocation = useGeolocation();
  const [verifyVisit, setVerifyVisit] = React.useState(false);

  const form = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: review?.rating ?? 0, comment: review?.comment ?? "" },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({ rating: review?.rating ?? 0, comment: review?.comment ?? "" });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form each time the dialog opens
      setVerifyVisit(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open]);

  async function onSubmit(values: ReviewValues) {
    try {
      const coordinates = verifyVisit ? geolocation.coordinates : null;
      const saved = review
        ? await updateReview(review.id, values.rating, values.comment ?? "")
        : await submitReview(placeId, values.rating, values.comment ?? "", coordinates);

      onSaved(saved);
      onOpenChange(false);
      toast.success(review ? "Review updated." : "Thanks for your review!");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{review ? "Edit your review" : "Write a review"}</DialogTitle>
          <DialogDescription>Share your experience with other coffee scouts.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <StarRatingInput value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="What did you think of the coffee?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!review && (
              <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={verifyVisit}
                  onChange={(event) => {
                    setVerifyVisit(event.target.checked);
                    if (event.target.checked && geolocation.status === "idle") {
                      geolocation.request();
                    }
                  }}
                  className="mt-1"
                />
                <span className="flex items-center gap-1">
                  <MapPin aria-hidden="true" className="h-4 w-4" />
                  I&apos;m here right now — verify my visit with my location.
                </span>
              </label>
            )}

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : review ? "Save changes" : "Submit review"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
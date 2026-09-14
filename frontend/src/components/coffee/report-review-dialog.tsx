"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiRequestError } from "@/lib/api/client";
import { reportReview } from "@/lib/api/reports";
import { reportSchema, type ReportValues } from "@/lib/validation/review";
import { REPORT_REASONS } from "@/types/review";

interface ReportReviewDialogProps {
  reviewId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportReviewDialog({ reviewId, open, onOpenChange }: ReportReviewDialogProps) {
  const emptyValues = { reason: "" as ReportValues["reason"], description: "" };

  const form = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (open) {
      form.reset(emptyValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open]);

  async function onSubmit(values: ReportValues) {
    try {
      await reportReview(reviewId, values.reason, values.description ?? "");
      onOpenChange(false);
      toast.success("Thanks — we'll review this.");
    } catch (error) {
      toast.error(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report review</DialogTitle>
          <DialogDescription>Let us know what&apos;s wrong with this review.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional details (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting..." : "Submit report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
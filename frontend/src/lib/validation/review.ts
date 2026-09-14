import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().trim().max(2000, "Keep it under 2000 characters.").optional(),
});

export type ReviewValues = z.infer<typeof reviewSchema>;

export const reportSchema = z.object({
  reason: z.enum(["spam", "harassment", "fake_content", "offensive_content", "other"], {
    error: "Choose a reason.",
  }),
  description: z.string().trim().max(1000, "Keep it under 1000 characters.").optional(),
});

export type ReportValues = z.infer<typeof reportSchema>;
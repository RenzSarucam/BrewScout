export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  visit_verified: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
  };
  is_own: boolean;
}

export interface MyReview {
  id: number;
  rating: number;
  comment: string | null;
  visit_verified: boolean;
  created_at: string;
  place: {
    place_id: string;
    name: string;
  };
}

export interface ArrivalCheckResult {
  verified: boolean;
  distance_meters: number;
  place_name: string | null;
}

export const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "fake_content", label: "Fake Content" },
  { value: "offensive_content", label: "Offensive Content" },
  { value: "other", label: "Other" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["value"];
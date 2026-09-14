import { apiClient } from "@/lib/api/client";
import type { ArrivalCheckResult, MyReview, Review } from "@/types/review";
import type { Coordinates } from "@/types/place";

export function fetchReviews(placeId: string) {
  return apiClient.get<Review[]>(`/v1/reviews?place_id=${encodeURIComponent(placeId)}`);
}

export function fetchMyReviews() {
  return apiClient.get<MyReview[]>("/v1/reviews/mine");
}

export function submitReview(placeId: string, rating: number, comment: string, coordinates: Coordinates | null) {
  return apiClient.post<Review>("/v1/reviews", {
    place_id: placeId,
    rating,
    comment: comment.length > 0 ? comment : null,
    ...(coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : {}),
  });
}

export function updateReview(reviewId: number, rating: number, comment: string) {
  return apiClient.put<Review>(`/v1/reviews/${reviewId}`, {
    rating,
    comment: comment.length > 0 ? comment : null,
  });
}

export function deleteReview(reviewId: number) {
  return apiClient.delete<null>(`/v1/reviews/${reviewId}`);
}

export function checkArrival(placeId: string, coordinates: Coordinates) {
  return apiClient.post<ArrivalCheckResult>("/v1/reviews/arrival-check", {
    place_id: placeId,
    lat: coordinates.lat,
    lng: coordinates.lng,
  });
}
import { apiClient } from "@/lib/api/client";
import type { PlaceSummary } from "@/types/place";

export function fetchSavedPlaces() {
  return apiClient.get<PlaceSummary[]>("/v1/saved-places");
}

export function savePlace(placeId: string) {
  return apiClient.post<null>("/v1/saved-places", { place_id: placeId });
}

export function unsavePlace(placeId: string) {
  return apiClient.delete<null>(`/v1/saved-places/${encodeURIComponent(placeId)}`);
}
import { apiClient } from "@/lib/api/client";
import type { Coordinates, NearbySearchParams, PlaceDetails, PlaceSummary } from "@/types/place";

export function fetchNearbyPlaces(params: NearbySearchParams) {
  const query = new URLSearchParams();
  query.set("lat", params.lat.toString());
  query.set("lng", params.lng.toString());
  if (params.radius) query.set("radius", params.radius.toString());
  if (params.min_rating) query.set("min_rating", params.min_rating.toString());
  if (params.open_now) query.set("open_now", "1");
  if (params.keyword) query.set("keyword", params.keyword);

  return apiClient.get<PlaceSummary[]>(`/v1/places/nearby?${query.toString()}`);
}

export function fetchPlaceDetails(googlePlaceId: string) {
  return apiClient.get<PlaceDetails>(`/v1/places/${encodeURIComponent(googlePlaceId)}`);
}

interface GeocodeResult extends Coordinates {
  formatted_address: string;
}

export function geocodeLocation(query: string) {
  return apiClient.get<GeocodeResult>(`/v1/places/geocode?query=${encodeURIComponent(query)}`);
}
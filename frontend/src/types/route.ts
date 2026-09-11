import type { Coordinates } from "@/types/place";

export type TravelMode = "WALK" | "TWO_WHEELER" | "DRIVE";

export interface RouteSummary {
  distance_meters: number;
  duration_seconds: number;
  polyline: string;
  travel_mode: TravelMode;
}

export interface ComputeRouteParams {
  origin: Coordinates;
  destination: Coordinates;
  travel_mode: TravelMode;
  place_id?: string;
}
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceSummary {
  place_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  review_count: number;
  price_level: number | null;
  open_now: boolean | null;
  distance_meters: number | null;
  location: Coordinates | null;
  photo: string | null;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  review_count: number;
  price_level: number | null;
  phone: string | null;
  website: string | null;
  location: Coordinates | null;
  open_now: boolean | null;
  opening_hours: string[];
  photos: string[];
  google_maps_url: string | null;
}

export type SearchRadius = 500 | 1000 | 2000 | 5000 | 10000 | 25000;

export interface NearbySearchParams {
  lat: number;
  lng: number;
  radius?: SearchRadius;
  min_rating?: number;
  open_now?: boolean;
  keyword?: string;
}
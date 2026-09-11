"use client";

import * as React from "react";
import type { DiscoverFiltersValue } from "@/components/coffee/discover-filters";
import { useGeolocation } from "@/hooks/use-geolocation";
import { fetchNearbyPlaces, geocodeLocation } from "@/lib/api/places";
import { ApiRequestError } from "@/lib/api/client";
import type { Coordinates, PlaceSummary } from "@/types/place";

export type FetchStatus = "idle" | "loading" | "success" | "error";

export function useCoffeeSearch(initialKeyword = "") {
  const geolocation = useGeolocation();

  const [modalDismissed, setModalDismissed] = React.useState(false);
  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [filters, setFilters] = React.useState<DiscoverFiltersValue>({
    radius: 5000,
    minRating: undefined,
    openNow: false,
  });
  const [places, setPlaces] = React.useState<PlaceSummary[]>([]);
  const [status, setStatus] = React.useState<FetchStatus>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [locationLabel, setLocationLabel] = React.useState<string | null>(null);

  const modalOpen = geolocation.status === "idle" && !modalDismissed;

  const loadPlaces = React.useCallback(
    (center?: Coordinates) => {
      const coordinates = center ?? geolocation.coordinates;
      if (!coordinates) return;

      setStatus("loading");
      setErrorMessage(undefined);

      fetchNearbyPlaces({
        lat: coordinates.lat,
        lng: coordinates.lng,
        radius: filters.radius,
        min_rating: filters.minRating,
        open_now: filters.openNow || undefined,
        keyword: keyword || undefined,
      })
        .then((results) => {
          setPlaces(results);
          setStatus("success");
        })
        .catch((error) => {
          setStatus("error");
          setErrorMessage(error instanceof ApiRequestError ? error.message : undefined);
        });
    },
    [geolocation.coordinates, filters, keyword]
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch when location/filters/keyword change
    loadPlaces();
  }, [loadPlaces]);

  async function handleSearch(query: string) {
    if (!query) return;

    if (!geolocation.coordinates) {
      setStatus("loading");
      setErrorMessage(undefined);
      try {
        const result = await geocodeLocation(query);
        geolocation.setManualCoordinates(result);
        setLocationLabel(result.formatted_address);
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof ApiRequestError ? error.message : "We couldn't find that location.");
      }
      return;
    }

    setKeyword(query);
  }

  function handleUseLocation() {
    setModalDismissed(true);
    setLocationLabel(null);
    geolocation.request();
  }

  return {
    geolocation,
    modalOpen,
    modalDismissed,
    keyword,
    filters,
    setFilters,
    places,
    status,
    errorMessage,
    locationLabel,
    loadPlaces,
    handleSearch,
    handleUseLocation,
    dismissModal: () => setModalDismissed(true),
  };
}
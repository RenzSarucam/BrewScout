"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { CoffeeList } from "@/components/coffee/coffee-list";
import { DiscoverFilters, type DiscoverFiltersValue } from "@/components/coffee/discover-filters";
import { ErrorState } from "@/components/layout/error-state";
import { LocationButton } from "@/components/navigation/location-button";
import { LocationPermissionModal } from "@/components/navigation/location-permission-modal";
import { SearchBar } from "@/components/navigation/search-bar";
import { useGeolocation } from "@/hooks/use-geolocation";
import { fetchNearbyPlaces, geocodeLocation } from "@/lib/api/places";
import { ApiRequestError } from "@/lib/api/client";
import type { PlaceSummary } from "@/types/place";

type FetchStatus = "idle" | "loading" | "success" | "error";

function DiscoverPageInner() {
  const searchParams = useSearchParams();
  const geolocation = useGeolocation();

  const [modalDismissed, setModalDismissed] = React.useState(false);
  const [keyword, setKeyword] = React.useState(searchParams.get("q") ?? "");
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

  const loadPlaces = React.useCallback(() => {
    if (!geolocation.coordinates) return;

    setStatus("loading");
    setErrorMessage(undefined);

    fetchNearbyPlaces({
      lat: geolocation.coordinates.lat,
      lng: geolocation.coordinates.lng,
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
  }, [geolocation.coordinates, filters, keyword]);

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

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground">
          {locationLabel ? `Showing coffee shops near ${locationLabel}` : "Find great coffee shops around you."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          defaultValue={keyword}
          onSearch={handleSearch}
          className="w-full sm:max-w-sm"
          placeholder={geolocation.coordinates ? "Search coffee shops..." : "Enter a city or place..."}
        />
        <LocationButton status={geolocation.status} onClick={handleUseLocation} />
      </div>

      {geolocation.coordinates && <DiscoverFilters value={filters} onChange={setFilters} />}

      {!geolocation.coordinates && (modalDismissed || geolocation.status === "denied") && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {geolocation.status === "denied"
            ? "Location access is disabled. Enter a location or search a city above to find coffee shops."
            : "Enter a location or search a city above to find coffee shops."}
        </div>
      )}

      {geolocation.coordinates ? (
        <CoffeeList places={places} status={status} errorMessage={errorMessage} onRetry={loadPlaces} />
      ) : (
        <>
          {status === "loading" && <CoffeeList places={[]} status="loading" />}
          {status === "error" && (
            <ErrorState
              title="We couldn't find that location."
              description={errorMessage ?? "Try a different city or place name."}
            />
          )}
        </>
      )}

      <LocationPermissionModal open={modalOpen} onAllow={handleUseLocation} onDismiss={() => setModalDismissed(true)} />
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <React.Suspense fallback={null}>
      <DiscoverPageInner />
    </React.Suspense>
  );
}
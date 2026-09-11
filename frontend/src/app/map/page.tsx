"use client";

import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CoffeeCard } from "@/components/coffee/coffee-card";
import { DiscoverFilters } from "@/components/coffee/discover-filters";
import { EmptyState } from "@/components/layout/empty-state";
import { ErrorState } from "@/components/layout/error-state";
import { LoadingState } from "@/components/layout/loading-state";
import { CoffeeMap } from "@/components/map/coffee-map";
import { LocationButton } from "@/components/navigation/location-button";
import { LocationPermissionModal } from "@/components/navigation/location-permission-modal";
import { SearchBar } from "@/components/navigation/search-bar";
import { useCoffeeSearch } from "@/hooks/use-coffee-search";
import type { Coordinates } from "@/types/place";

export default function MapPage() {
  const search = useCoffeeSearch();
  const { geolocation } = search;
  const [selectedPlaceId, setSelectedPlaceId] = React.useState<string | null>(null);
  const isDenied = geolocation.status === "denied";

  const selectedPlace = search.places.find((place) => place.place_id === selectedPlaceId) ?? null;

  function handleSearchThisArea(newCenter: Coordinates) {
    geolocation.setManualCoordinates(newCenter);
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar
          defaultValue={search.keyword}
          onSearch={search.handleSearch}
          className="w-full sm:w-auto sm:min-w-[16rem] sm:flex-1 sm:max-w-sm"
          placeholder={geolocation.coordinates ? "Search coffee shops..." : "Enter a city or place..."}
        />
        <LocationButton status={geolocation.status} onClick={search.handleUseLocation} />
        <Button asChild variant="secondary">
          <Link href="/discover">List view</Link>
        </Button>
      </div>

      {geolocation.coordinates && <DiscoverFilters value={search.filters} onChange={search.setFilters} />}

      {!geolocation.coordinates ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center">
          {search.status === "loading" ? (
            <LoadingState label="Scout your coffee..." />
          ) : search.status === "error" ? (
            <ErrorState
              title="We couldn't find that location."
              description={search.errorMessage ?? "Try a different city or place name."}
            />
          ) : (
            <EmptyState
              icon={
                <Image src="/logo-icon.png" alt="" width={64} height={64} aria-hidden="true" className="opacity-90" />
              }
              title={isDenied ? "Location access is disabled." : "See coffee shops on the map."}
              description={
                isDenied
                  ? "Enter a location or search a city above to see the map."
                  : "Use your location or search a city above to get started."
              }
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="h-[50vh] lg:h-[70vh]">
            <CoffeeMap
              center={geolocation.coordinates}
              places={search.places}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={setSelectedPlaceId}
              onSearchThisArea={handleSearchThisArea}
            />
          </div>

          <div className="flex flex-col gap-3 lg:h-[70vh] lg:overflow-y-auto">
            {search.status === "loading" && <LoadingState label="Scout your coffee..." />}
            {search.status === "error" && (
              <ErrorState
                title="We couldn't load coffee shops."
                description={search.errorMessage ?? "Please check your connection and try again."}
                onRetry={() => search.loadPlaces()}
              />
            )}
            {search.status === "success" && search.places.length === 0 && (
              <EmptyState
                title="No coffee shops found."
                description="Try another location or expand your search radius."
              />
            )}
            {search.status === "success" &&
              (selectedPlace ? (
                <CoffeeCard place={selectedPlace} />
              ) : (
                search.places.map((place) => <CoffeeCard key={place.place_id} place={place} />)
              ))}
          </div>
        </div>
      )}

      <LocationPermissionModal
        open={search.modalOpen}
        onAllow={search.handleUseLocation}
        onDismiss={search.dismissModal}
      />
    </main>
  );
}
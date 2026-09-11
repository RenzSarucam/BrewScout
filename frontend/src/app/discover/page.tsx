"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { CoffeeList } from "@/components/coffee/coffee-list";
import { DiscoverFilters } from "@/components/coffee/discover-filters";
import { ErrorState } from "@/components/layout/error-state";
import { LocationButton } from "@/components/navigation/location-button";
import { LocationPermissionModal } from "@/components/navigation/location-permission-modal";
import { SearchBar } from "@/components/navigation/search-bar";
import { useCoffeeSearch } from "@/hooks/use-coffee-search";

function DiscoverPageInner() {
  const searchParams = useSearchParams();
  const search = useCoffeeSearch(searchParams.get("q") ?? "");
  const { geolocation } = search;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
        <p className="text-sm text-muted-foreground">
          {search.locationLabel
            ? `Showing coffee shops near ${search.locationLabel}`
            : "Find great coffee shops around you."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          defaultValue={search.keyword}
          onSearch={search.handleSearch}
          className="w-full sm:max-w-sm"
          placeholder={geolocation.coordinates ? "Search coffee shops..." : "Enter a city or place..."}
        />
        <div className="flex gap-2">
          <LocationButton status={geolocation.status} onClick={search.handleUseLocation} />
          <Link
            href="/map"
            className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Map view
          </Link>
        </div>
      </div>

      {geolocation.coordinates && <DiscoverFilters value={search.filters} onChange={search.setFilters} />}

      {!geolocation.coordinates && (search.modalDismissed || geolocation.status === "denied") && (
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {geolocation.status === "denied"
            ? "Location access is disabled. Enter a location or search a city above to find coffee shops."
            : "Enter a location or search a city above to find coffee shops."}
        </div>
      )}

      {geolocation.coordinates ? (
        <CoffeeList
          places={search.places}
          status={search.status}
          errorMessage={search.errorMessage}
          onRetry={() => search.loadPlaces()}
        />
      ) : (
        <>
          {search.status === "loading" && <CoffeeList places={[]} status="loading" />}
          {search.status === "error" && (
            <ErrorState
              title="We couldn't find that location."
              description={search.errorMessage ?? "Try a different city or place name."}
            />
          )}
        </>
      )}

      <LocationPermissionModal
        open={search.modalOpen}
        onAllow={search.handleUseLocation}
        onDismiss={search.dismissModal}
      />
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
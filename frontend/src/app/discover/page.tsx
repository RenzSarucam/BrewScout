"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CoffeeList } from "@/components/coffee/coffee-list";
import { DiscoverFilters } from "@/components/coffee/discover-filters";
import { EmptyState } from "@/components/layout/empty-state";
import { ErrorState } from "@/components/layout/error-state";
import { LocationButton } from "@/components/navigation/location-button";
import { LocationPermissionModal } from "@/components/navigation/location-permission-modal";
import { SearchBar } from "@/components/navigation/search-bar";
import { useCoffeeSearch } from "@/hooks/use-coffee-search";

function DiscoverPageInner() {
  const searchParams = useSearchParams();
  const search = useCoffeeSearch(searchParams.get("q") ?? "");
  const { geolocation } = search;
  const isDenied = geolocation.status === "denied";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {search.locationLabel ? "Discover" : "Find Your Next Coffee"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {search.locationLabel
              ? `Showing coffee shops near ${search.locationLabel}`
              : "Search a city or use your location to see great coffee shops nearby."}
          </p>
        </div>

        <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <SearchBar
            defaultValue={search.keyword}
            onSearch={search.handleSearch}
            className="w-full sm:max-w-sm"
            placeholder={geolocation.coordinates ? "Search coffee shops..." : "Enter a city or place..."}
          />
          <div className="flex justify-center gap-2">
            <LocationButton status={geolocation.status} onClick={search.handleUseLocation} />
            <Button asChild variant="outline">
              <Link href="/map">Map view</Link>
            </Button>
          </div>
        </div>

        {geolocation.coordinates && <DiscoverFilters value={search.filters} onChange={search.setFilters} />}
      </div>

      {!geolocation.coordinates && search.status !== "loading" && search.status !== "error" && (
        <EmptyState
          icon={<Image src="/logo-icon.png" alt="" width={72} height={72} aria-hidden="true" className="opacity-90" />}
          title={isDenied ? "Location access is disabled." : "Ready to scout your next cup?"}
          description={
            isDenied
              ? "Enter a location or search a city above to find coffee shops."
              : "Enter a city above or share your location, and we'll find the best coffee shops nearby."
          }
        />
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
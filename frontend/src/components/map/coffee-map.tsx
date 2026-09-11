"use client";

import * as React from "react";
import { loadGoogleMaps } from "@/lib/maps/loader";
import { env } from "@/config/env";
import type { Coordinates, PlaceSummary } from "@/types/place";

interface CoffeeMapProps {
  center: Coordinates;
  places: PlaceSummary[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string) => void;
  onSearchThisArea?: (center: Coordinates) => void;
}

export function CoffeeMap({ center, places, selectedPlaceId, onSelectPlace, onSearchThisArea }: CoffeeMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const markersRef = React.useRef<Map<string, google.maps.marker.AdvancedMarkerElement>>(new Map());
  const userMarkerRef = React.useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const onSearchThisAreaRef = React.useRef(onSearchThisArea);

  React.useEffect(() => {
    onSearchThisAreaRef.current = onSearchThisArea;
  }, [onSearchThisArea]);

  const [loadError, setLoadError] = React.useState(false);
  const [showSearchArea, setShowSearchArea] = React.useState(false);

  const hasApiKey = Boolean(env.googleMapsApiKey);

  React.useEffect(() => {
    if (!hasApiKey) return;

    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;

        const map = new maps.maps.Map(containerRef.current, {
          center,
          zoom: 14,
          mapId: "BREW_SCOUT_MAP",
          disableDefaultUI: true,
          zoomControl: true,
        });

        mapRef.current = map;

        map.addListener("dragend", () => setShowSearchArea(true));
        map.addListener("zoom_changed", () => setShowSearchArea(true));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; center updates are handled separately below
  }, [hasApiKey]);

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(center);
    }
  }, [center]);

  React.useEffect(() => {
    if (!hasApiKey || !mapRef.current || loadError) return;

    let cancelled = false;

    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapRef.current) return;

      if (!userMarkerRef.current) {
        const userPin = new maps.maps.marker.PinElement({
          background: "var(--foreground)",
          borderColor: "var(--background)",
          glyphColor: "var(--background)",
          scale: 0.8,
        });
        userMarkerRef.current = new maps.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: center,
          content: userPin.element,
          title: "Your location",
          zIndex: 999,
        });
      } else {
        userMarkerRef.current.position = center;
      }
    });

    return () => {
      cancelled = true;
    };
  }, [center, loadError, hasApiKey]);

  React.useEffect(() => {
    if (!hasApiKey || !mapRef.current || loadError) return;

    let cancelled = false;

    loadGoogleMaps().then((maps) => {
      if (cancelled || !mapRef.current) return;

      markersRef.current.forEach((marker) => (marker.map = null));
      markersRef.current.clear();

      places.forEach((place) => {
        if (!place.location) return;

        const isSelected = place.place_id === selectedPlaceId;
        const pin = new maps.maps.marker.PinElement({
          background: isSelected ? "var(--primary)" : "var(--card)",
          borderColor: "var(--primary)",
          glyphColor: isSelected ? "var(--primary-foreground)" : "var(--primary)",
          scale: isSelected ? 1.1 : 0.9,
        });

        const marker = new maps.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: place.location,
          content: pin.element,
          title: place.name,
        });

        marker.addListener("click", () => onSelectPlace(place.place_id));
        markersRef.current.set(place.place_id, marker);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [places, selectedPlaceId, onSelectPlace, loadError, hasApiKey]);

  function handleSearchThisArea() {
    if (!mapRef.current) return;
    const newCenter = mapRef.current.getCenter();
    if (!newCenter) return;

    setShowSearchArea(false);
    onSearchThisAreaRef.current?.({ lat: newCenter.lat(), lng: newCenter.lng() });
  }

  if (!hasApiKey) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Map unavailable. A Google Maps API key hasn&apos;t been configured yet.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        We couldn&apos;t load the map. Please try again later.
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[50vh] w-full overflow-hidden rounded-2xl border border-border">
      <div ref={containerRef} className="h-full w-full" />

      {showSearchArea && (
        <button
          type="button"
          onClick={handleSearchThisArea}
          className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md"
        >
          Search this area
        </button>
      )}
    </div>
  );
}
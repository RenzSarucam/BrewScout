"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RouteDisclaimer } from "@/components/navigation/route-disclaimer";
import { RouteSummary } from "@/components/navigation/route-summary";
import { TravelModeSelector } from "@/components/navigation/travel-mode-selector";
import { computeRoute } from "@/lib/api/routes";
import { ApiRequestError } from "@/lib/api/client";
import type { Coordinates } from "@/types/place";
import type { RouteSummary as RouteSummaryData, TravelMode } from "@/types/route";

// Google Maps' consumer web/app URLs only support driving/walking/bicycling/transit —
// there's no public "motorcycle" mode, so TWO_WHEELER falls back to driving for the
// external handoff. Our own in-app estimate still uses the real TWO_WHEELER routing.
const EXTERNAL_TRAVEL_MODE: Record<TravelMode, string> = {
  WALK: "walking",
  TWO_WHEELER: "driving",
  DRIVE: "driving",
};

type Status = "idle" | "loading" | "success" | "error";

interface DirectionsButtonProps {
  destination: Coordinates;
  placeId: string;
}

export function DirectionsButton({ destination, placeId }: DirectionsButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState<Coordinates | null>(null);
  const [travelMode, setTravelMode] = React.useState<TravelMode>("WALK");
  const [route, setRoute] = React.useState<RouteSummaryData | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const loadRoute = React.useCallback(
    (from: Coordinates, mode: TravelMode) => {
      setStatus("loading");
      setErrorMessage(undefined);

      computeRoute({ origin: from, destination, travel_mode: mode, place_id: placeId })
        .then((result) => {
          setRoute(result);
          setStatus("success");
        })
        .catch((error) => {
          setStatus("error");
          setErrorMessage(error instanceof ApiRequestError ? error.message : undefined);
        });
    },
    [destination, placeId]
  );

  function handleOpen() {
    setOpen(true);

    if (origin) {
      loadRoute(origin, travelMode);
      return;
    }

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Location isn't available on this device.");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setOrigin(coords);
        loadRoute(coords, travelMode);
      },
      () => {
        setStatus("error");
        setErrorMessage("Enable location access to see an estimated travel time.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  function handleTravelModeChange(mode: TravelMode) {
    setTravelMode(mode);
    if (origin) {
      loadRoute(origin, mode);
    }
  }

  const externalHref = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=${EXTERNAL_TRAVEL_MODE[travelMode]}`;

  if (!open) {
    return <Button onClick={handleOpen}>Get Directions</Button>;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <TravelModeSelector value={travelMode} onChange={handleTravelModeChange} />

      {status === "loading" && <p className="text-sm text-muted-foreground">Getting your route...</p>}
      {status === "error" && (
        <p className="text-sm text-muted-foreground">{errorMessage ?? "We couldn't calculate a route."}</p>
      )}
      {status === "success" && route && <RouteSummary route={route} />}

      <Button asChild>
        <a href={externalHref} target="_blank" rel="noopener noreferrer">
          Start Navigation
        </a>
      </Button>

      <RouteDisclaimer />
    </div>
  );
}
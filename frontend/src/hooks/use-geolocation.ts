"use client";

import * as React from "react";
import type { Coordinates } from "@/types/place";

export type GeolocationStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

interface GeolocationState {
  status: GeolocationStatus;
  coordinates: Coordinates | null;
  accuracy: number | null;
  error: string | null;
}

interface UseGeolocationResult extends GeolocationState {
  request: () => void;
  setManualCoordinates: (coordinates: Coordinates) => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = React.useState<GeolocationState>({
    status: "idle",
    coordinates: null,
    accuracy: null,
    error: null,
  });

  const request = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unavailable", coordinates: null, accuracy: null, error: "Geolocation is not supported by this browser." });
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: "granted",
          coordinates: { lat: position.coords.latitude, lng: position.coords.longitude },
          accuracy: position.coords.accuracy,
          error: null,
        });
      },
      (error) => {
        setState({
          status: error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
          coordinates: null,
          accuracy: null,
          error: error.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const setManualCoordinates = React.useCallback((coordinates: Coordinates) => {
    setState({ status: "granted", coordinates, accuracy: null, error: null });
  }, []);

  return { ...state, request, setManualCoordinates };
}
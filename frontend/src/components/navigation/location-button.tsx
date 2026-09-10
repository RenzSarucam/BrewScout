"use client";

import { Button } from "@/components/ui/button";
import type { GeolocationStatus } from "@/hooks/use-geolocation";

interface LocationButtonProps {
  status: GeolocationStatus;
  onClick: () => void;
}

const LABELS: Record<GeolocationStatus, string> = {
  idle: "Use My Location",
  loading: "Locating...",
  granted: "Update My Location",
  denied: "Location Access Denied",
  unavailable: "Location Unavailable",
};

export function LocationButton({ status, onClick }: LocationButtonProps) {
  return (
    <Button onClick={onClick} disabled={status === "loading"} aria-label="Use my current location">
      {LABELS[status]}
    </Button>
  );
}
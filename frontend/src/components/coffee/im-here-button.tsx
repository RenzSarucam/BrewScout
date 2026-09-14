"use client";

import { MapPin } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/use-geolocation";
import { ApiRequestError } from "@/lib/api/client";
import { checkArrival } from "@/lib/api/reviews";

interface ImHereButtonProps {
  placeId: string;
}

export function ImHereButton({ placeId }: ImHereButtonProps) {
  const geolocation = useGeolocation();
  const [isChecking, setIsChecking] = React.useState(false);
  const requestedRef = React.useRef(false);

  React.useEffect(() => {
    if (!requestedRef.current || geolocation.status !== "granted" || !geolocation.coordinates) {
      return;
    }
    requestedRef.current = false;

    setIsChecking(true);
    checkArrival(placeId, geolocation.coordinates)
      .then((result) => {
        if (result.verified) {
          toast.success(`You're near ${result.place_name ?? "this coffee shop"}. Location-verified visit!`);
        } else {
          toast.info("You don't seem to be at this coffee shop right now.");
        }
      })
      .catch((error) => {
        toast.error(error instanceof ApiRequestError ? error.message : "Couldn't verify your location.");
      })
      .finally(() => setIsChecking(false));
  }, [geolocation.status, geolocation.coordinates, placeId]);

  function handleClick() {
    if (geolocation.status === "denied" || geolocation.status === "unavailable") {
      toast.error("Location access is unavailable. Please enable it in your browser settings.");
      return;
    }

    requestedRef.current = true;
    geolocation.request();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleClick} disabled={isChecking || geolocation.status === "loading"}>
      <MapPin aria-hidden="true" />
      {isChecking || geolocation.status === "loading" ? "Checking..." : "I'm Here"}
    </Button>
  );
}
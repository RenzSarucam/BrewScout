"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/layout/error-state";
import { LoadingState } from "@/components/layout/loading-state";
import { Rating } from "@/components/coffee/rating";
import { fetchPlaceDetails } from "@/lib/api/places";
import { ApiRequestError } from "@/lib/api/client";
import { formatPriceLevel } from "@/lib/utils/format";
import type { PlaceDetails } from "@/types/place";

type Status = "loading" | "success" | "error";

export default function CoffeeDetailsPage() {
  const params = useParams<{ placeId: string }>();
  const placeId = decodeURIComponent(params.placeId);

  const [place, setPlace] = React.useState<PlaceDetails | null>(null);
  const [status, setStatus] = React.useState<Status>("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();

  const load = React.useCallback(() => {
    setStatus("loading");
    fetchPlaceDetails(placeId)
      .then((details) => {
        setPlace(details);
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
        setErrorMessage(error instanceof ApiRequestError ? error.message : undefined);
      });
  }, [placeId]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount
    load();
  }, [load]);

  if (status === "loading") {
    return <LoadingState label="Scout your coffee..." />;
  }

  if (status === "error" || !place) {
    return (
      <ErrorState
        title="We couldn't load this coffee shop."
        description={errorMessage ?? "Please try again."}
        onRetry={load}
      />
    );
  }

  const priceLevel = formatPriceLevel(place.price_level);

  async function handleShare() {
    const shareData = {
      title: place!.name,
      text: `Check out ${place!.name} on Brew Scout`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled the share sheet — nothing to do
      }
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard.");
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10">
      {place.photos[0] && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-secondary">
          <Image src={place.photos[0]} alt={place.name} fill sizes="100vw" className="object-cover" priority />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">{place.name}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Rating value={place.rating} reviewCount={place.review_count} />
          {priceLevel && <span className="text-muted-foreground">{priceLevel}</span>}
          {place.open_now !== null && (
            <span className={place.open_now ? "font-medium text-primary" : "font-medium text-muted-foreground"}>
              {place.open_now ? "Open Now" : "Closed"}
            </span>
          )}
        </div>
        {place.address && <p className="text-sm text-muted-foreground">{place.address}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {place.location && (
          <Button asChild>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
          </Button>
        )}
        <Button variant="secondary" disabled title="Coming soon">
          Save
        </Button>
        <Button variant="secondary" onClick={handleShare}>
          Share
        </Button>
        <Button variant="secondary" disabled title="Coming soon">
          Write a Review
        </Button>
        {place.google_maps_url && (
          <Button asChild variant="ghost">
            <a href={place.google_maps_url} target="_blank" rel="noopener noreferrer">
              View on Google Maps
            </a>
          </Button>
        )}
      </div>

      {place.phone || place.website ? (
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-sm">
          {place.phone && (
            <a href={`tel:${place.phone}`} className="text-foreground hover:underline">
              {place.phone}
            </a>
          )}
          {place.website && (
            <a href={place.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {place.website}
            </a>
          )}
        </div>
      ) : null}

      {place.opening_hours.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold text-foreground">Opening Hours</h2>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {place.opening_hours.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {place.photos.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {place.photos.slice(1).map((photo) => (
            <div key={photo} className="relative aspect-square overflow-hidden rounded-lg bg-secondary">
              <Image src={photo} alt="" fill sizes="33vw" className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Route distances and travel times are estimates and may change due to traffic, road closures, weather,
        construction, GPS accuracy, local restrictions, or other conditions. Always follow applicable traffic laws
        and road signs.
      </p>
    </main>
  );
}
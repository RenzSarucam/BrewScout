import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/coffee/rating";
import { SaveButton } from "@/components/coffee/save-button";
import { formatDistance } from "@/lib/utils/format";
import type { PlaceSummary } from "@/types/place";

interface CoffeeCardProps {
  place: PlaceSummary;
}

export function CoffeeCard({ place }: CoffeeCardProps) {
  const distance = formatDistance(place.distance_meters);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] w-full bg-secondary">
        {place.photo ? (
          <Image src={place.photo} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            No photo available
          </div>
        )}
        {place.open_now !== null && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ${
              place.open_now ? "bg-primary text-primary-foreground" : "bg-black/60 text-white"
            }`}
          >
            {place.open_now ? "Open Now" : "Closed"}
          </span>
        )}
        <SaveButton place={place} iconOnly className="absolute right-3 top-3 size-8" />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-foreground">{place.name}</h3>
        </div>

        {place.badge && (
          <span
            className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            title="Brew Scout Recommendation"
          >
            ★ {place.badge}
          </span>
        )}

        <Rating value={place.rating} reviewCount={place.review_count} />

        {distance && <p className="text-sm text-muted-foreground">{distance}</p>}

        <div className="mt-2 flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/coffee/${encodeURIComponent(place.place_id)}`}>View</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="flex-1">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.location?.lat},${place.location?.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Directions
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
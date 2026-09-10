import { CoffeeCard } from "@/components/coffee/coffee-card";
import { EmptyState } from "@/components/layout/empty-state";
import { ErrorState } from "@/components/layout/error-state";
import { LoadingState } from "@/components/layout/loading-state";
import type { PlaceSummary } from "@/types/place";

interface CoffeeListProps {
  places: PlaceSummary[];
  status: "idle" | "loading" | "success" | "error";
  errorMessage?: string;
  onRetry?: () => void;
}

export function CoffeeList({ places, status, errorMessage, onRetry }: CoffeeListProps) {
  if (status === "loading" || status === "idle") {
    return <LoadingState label="Scout your coffee..." />;
  }

  if (status === "error") {
    return (
      <ErrorState
        title="We couldn't load coffee shops."
        description={errorMessage ?? "Please check your connection and try again."}
        onRetry={onRetry}
      />
    );
  }

  if (places.length === 0) {
    return (
      <EmptyState
        title="No coffee shops found."
        description="Try another location or expand your search radius."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <CoffeeCard key={place.place_id} place={place} />
      ))}
    </div>
  );
}
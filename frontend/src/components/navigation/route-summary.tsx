import { formatDuration, formatRouteDistance } from "@/lib/utils/format";
import type { RouteSummary as RouteSummaryData } from "@/types/route";

interface RouteSummaryProps {
  route: RouteSummaryData;
}

export function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">Estimated travel time</p>
      <p className="text-2xl font-semibold text-foreground">{formatDuration(route.duration_seconds)}</p>
      <p className="text-sm text-muted-foreground">{formatRouteDistance(route.distance_meters)}</p>
    </div>
  );
}
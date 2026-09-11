import { apiClient } from "@/lib/api/client";
import type { ComputeRouteParams, RouteSummary } from "@/types/route";

export function computeRoute(params: ComputeRouteParams) {
  return apiClient.post<RouteSummary>("/v1/routes", params);
}
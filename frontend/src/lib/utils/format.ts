export function formatDistance(meters: number | null): string | null {
  if (meters === null) return null;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export function formatPriceLevel(priceLevel: number | null): string | null {
  if (priceLevel === null) return null;
  return "₱".repeat(Math.max(1, priceLevel));
}

export function formatRouteDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}
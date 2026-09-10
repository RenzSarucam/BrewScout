export function formatDistance(meters: number | null): string | null {
  if (meters === null) return null;
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
}

export function formatPriceLevel(priceLevel: number | null): string | null {
  if (priceLevel === null) return null;
  return "₱".repeat(Math.max(1, priceLevel));
}
export const env = {
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Brew Scout",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
} as const;

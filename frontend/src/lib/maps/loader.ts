import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { env } from "@/config/env";

let optionsConfigured = false;

function ensureOptions() {
  if (!optionsConfigured) {
    setOptions({ key: env.googleMapsApiKey, v: "weekly" });
    optionsConfigured = true;
  }
}

export async function loadGoogleMaps(): Promise<typeof google> {
  ensureOptions();
  await importLibrary("maps");
  await importLibrary("marker");
  return google;
}

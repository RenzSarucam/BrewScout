"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchSavedPlaces, savePlace, unsavePlace } from "@/lib/api/saved-places";
import type { PlaceSummary } from "@/types/place";

interface SavedPlacesContextValue {
  places: PlaceSummary[];
  isLoading: boolean;
  isSaved: (placeId: string) => boolean;
  toggle: (place: PlaceSummary) => Promise<void>;
  refresh: () => Promise<void>;
}

const SavedPlacesContext = React.createContext<SavedPlacesContextValue | null>(null);

export function SavedPlacesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [places, setPlaces] = React.useState<PlaceSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!user) {
      setPlaces([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await fetchSavedPlaces();
      setPlaces(results);
    } catch {
      // leave the previous list in place — a failed refresh shouldn't wipe favorites from view
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync saved places when auth state changes
    refresh();
  }, [refresh]);

  const isSaved = React.useCallback((placeId: string) => places.some((p) => p.place_id === placeId), [places]);

  const toggle = React.useCallback(
    async (place: PlaceSummary) => {
      if (isSaved(place.place_id)) {
        const previous = places;
        setPlaces((current) => current.filter((p) => p.place_id !== place.place_id));
        try {
          await unsavePlace(place.place_id);
        } catch (error) {
          setPlaces(previous);
          throw error;
        }
        return;
      }

      // Optimistic add using the data the caller already has — the list
      // endpoint depends on Google being reachable, so we don't want a save
      // to look like it silently failed just because a background refresh did.
      setPlaces((current) => [place, ...current]);
      try {
        await savePlace(place.place_id);
      } catch (error) {
        setPlaces((current) => current.filter((p) => p.place_id !== place.place_id));
        throw error;
      }
      void refresh();
    },
    [isSaved, places, refresh]
  );

  const value = React.useMemo(
    () => ({ places, isLoading, isSaved, toggle, refresh }),
    [places, isLoading, isSaved, toggle, refresh]
  );

  return <SavedPlacesContext.Provider value={value}>{children}</SavedPlacesContext.Provider>;
}

export function useSavedPlaces(): SavedPlacesContextValue {
  const context = React.useContext(SavedPlacesContext);

  if (!context) {
    throw new Error("useSavedPlaces must be used within a SavedPlacesProvider");
  }

  return context;
}
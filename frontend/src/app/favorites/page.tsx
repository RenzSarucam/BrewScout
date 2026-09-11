"use client";

import { CoffeeList } from "@/components/coffee/coffee-list";
import { RequireAuth } from "@/components/navigation/require-auth";
import { useSavedPlaces } from "@/hooks/use-saved-places";

function FavoritesContent() {
  const { places, isLoading, refresh } = useSavedPlaces();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Saved Coffee</h1>
        <p className="text-sm text-muted-foreground">The coffee shops you&apos;ve saved for later.</p>
      </div>

      <CoffeeList
        places={places}
        status={isLoading ? "loading" : "success"}
        onRetry={() => refresh()}
        emptyTitle="No saved coffee shops yet."
        emptyDescription="Save a coffee shop and it will appear here."
      />
    </main>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesContent />
    </RequireAuth>
  );
}
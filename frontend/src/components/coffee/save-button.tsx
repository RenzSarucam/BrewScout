"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import type { PlaceSummary } from "@/types/place";
import { cn } from "cn";

interface SaveButtonProps {
  place: PlaceSummary;
  iconOnly?: boolean;
  className?: string;
}

export function SaveButton({ place, iconOnly = false, className }: SaveButtonProps) {
  const { user } = useAuth();
  const { isSaved, toggle } = useSavedPlaces();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const saved = isSaved(place.place_id);

  async function handleClick() {
    if (!user) {
      toast.error("Log in to save coffee shops.");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      await toggle(place);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (iconOnly) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleClick}
        disabled={isSubmitting}
        aria-label={saved ? "Remove from saved coffee shops" : "Save coffee shop"}
        aria-pressed={saved}
        className={cn(className)}
      >
        <Heart aria-hidden="true" className={saved ? "fill-primary text-primary" : ""} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleClick}
      disabled={isSubmitting}
      aria-pressed={saved}
      className={cn(className)}
    >
      <Heart aria-hidden="true" className={saved ? "fill-primary text-primary" : ""} />
      {saved ? "Saved" : "Save"}
    </Button>
  );
}
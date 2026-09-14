"use client";

import { Star } from "lucide-react";
import * as React from "react";
import { cn } from "cn";

interface StarRatingInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarRatingInput({ value, onChange, className }: StarRatingInputProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const displayed = hovered ?? value;

  return (
    <div className={cn("flex items-center gap-1", className)} role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="p-0.5"
        >
          <Star
            aria-hidden="true"
            className={cn(
              "h-6 w-6 transition-colors",
              star <= displayed ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );
}
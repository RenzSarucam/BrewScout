"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SearchRadius } from "@/types/place";

export interface DiscoverFiltersValue {
  radius: SearchRadius;
  minRating: number | undefined;
  openNow: boolean;
}

interface DiscoverFiltersProps {
  value: DiscoverFiltersValue;
  onChange: (value: DiscoverFiltersValue) => void;
}

const RADIUS_OPTIONS: { value: SearchRadius; label: string }[] = [
  { value: 500, label: "500 m" },
  { value: 1000, label: "1 km" },
  { value: 2000, label: "2 km" },
  { value: 5000, label: "5 km" },
  { value: 10000, label: "10 km" },
  { value: 25000, label: "25 km" },
];

const RATING_OPTIONS: { value: string; label: string }[] = [
  { value: "any", label: "Any rating" },
  { value: "3.5", label: "3.5+" },
  { value: "4", label: "4.0+" },
  { value: "4.5", label: "4.5+" },
];

export function DiscoverFilters({ value, onChange }: DiscoverFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value.radius.toString()}
        onValueChange={(radius) => onChange({ ...value, radius: Number(radius) as SearchRadius })}
      >
        <SelectTrigger aria-label="Search radius" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RADIUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.minRating?.toString() ?? "any"}
        onValueChange={(rating) => onChange({ ...value, minRating: rating === "any" ? undefined : Number(rating) })}
      >
        <SelectTrigger aria-label="Minimum rating" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RATING_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        variant={value.openNow ? "default" : "outline"}
        size="sm"
        aria-pressed={value.openNow}
        onClick={() => onChange({ ...value, openNow: !value.openNow })}
      >
        Open Now
      </Button>
    </div>
  );
}
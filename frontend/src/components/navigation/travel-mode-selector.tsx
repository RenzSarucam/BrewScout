"use client";

import { Bike, Car, Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TravelMode } from "@/types/route";

interface TravelModeSelectorProps {
  value: TravelMode;
  onChange: (mode: TravelMode) => void;
}

const MODES: { value: TravelMode; label: string; icon: typeof Footprints }[] = [
  { value: "WALK", label: "Walking", icon: Footprints },
  { value: "TWO_WHEELER", label: "Motorcycle", icon: Bike },
  { value: "DRIVE", label: "Car", icon: Car },
];

export function TravelModeSelector({ value, onChange }: TravelModeSelectorProps) {
  return (
    <div role="group" aria-label="Travel mode" className="flex gap-2">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const selected = value === mode.value;

        return (
          <Button
            key={mode.value}
            type="button"
            variant={selected ? "default" : "secondary"}
            size="sm"
            aria-pressed={selected}
            onClick={() => onChange(mode.value)}
          >
            <Icon aria-hidden="true" className="size-4" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
}
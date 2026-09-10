"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({
  defaultValue = "",
  placeholder = "Search coffee shops, cities, or places...",
  onSearch,
  className = "",
}: SearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className={className} role="search">
      <label htmlFor="coffee-search" className="sr-only">
        Search coffee shops, cities, or places
      </label>
      <Input
        id="coffee-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
      />
    </form>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/navigation/search-bar";

export default function Home() {
  const router = useRouter();

  function handleSearch(query: string) {
    router.push(query ? `/discover?q=${encodeURIComponent(query)}` : "/discover");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-6 py-24 text-center">
      <h1 className="sr-only">Brew Scout — Find your next great cup, wherever you are.</h1>
      <Image
        src="/logo.png"
        alt="Brew Scout — Find your next great cup, wherever you are."
        width={1748}
        height={899}
        priority
        className="w-full max-w-xl"
      />
      <p className="max-w-md text-muted-foreground">
        Discover great coffee shops around you, explore ratings and reviews, and find the best route to your next
        cup.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/discover">Find Coffee Near Me</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/map">Explore Map</Link>
        </Button>
      </div>

      <SearchBar onSearch={handleSearch} className="w-full max-w-md" />
    </main>
  );
}
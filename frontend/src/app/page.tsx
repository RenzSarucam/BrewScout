import Image from "next/image";

export default function Home() {
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
    </main>
  );
}
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-background px-6 py-24 text-center">
      <Image src="/logo.png" alt="Brew Scout" width={96} height={96} priority className="rounded-2xl" />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Find Your Next Coffee.</h1>
        <p className="max-w-md text-muted-foreground">
          Discover great coffee shops around you, explore ratings and reviews, and find the best route to your next
          cup.
        </p>
      </div>
    </main>
  );
}
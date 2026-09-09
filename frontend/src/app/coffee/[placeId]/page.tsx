export default async function CoffeeDetailsPage({
  params,
}: {
  params: Promise<{ placeId: string }>;
}) {
  const { placeId } = await params;

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-2 px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Coffee Shop Details</h1>
      <p className="text-muted-foreground">Details for place {placeId} are coming soon.</p>
    </main>
  );
}

"use client";

import { RequireAdmin } from "@/components/navigation/require-admin";

export default function Page() {
  return (
    <RequireAdmin>
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-2 px-6 py-16">
        <h1 className="text-3xl font-semibold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">This page is coming soon.</p>
      </main>
    </RequireAdmin>
  );
}

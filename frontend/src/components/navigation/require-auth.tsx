"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/hooks/use-auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
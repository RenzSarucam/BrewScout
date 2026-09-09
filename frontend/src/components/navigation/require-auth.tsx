"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { LoadingState } from "@/components/layout/loading-state";
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
    return <LoadingState />;
  }

  return <>{children}</>;
}
"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useAuth } from "@/hooks/use-auth";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6 py-16 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
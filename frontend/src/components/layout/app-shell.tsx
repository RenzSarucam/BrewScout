"use client";

import * as React from "react";
import { Footer } from "@/components/layout/footer";
import { LoadingState } from "@/components/layout/loading-state";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/use-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center">
        <LoadingState label="Brewing your coffee..." />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <Toaster />
    </>
  );
}
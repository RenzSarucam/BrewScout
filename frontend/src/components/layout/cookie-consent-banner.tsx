"use client";

import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "brew-scout-cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    let alreadyAccepted = false;
    try {
      alreadyAccepted = window.localStorage.getItem(STORAGE_KEY) === "accepted";
    } catch {
      // localStorage unavailable (private browsing, blocked site data) — just show the banner
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored choice once on mount
    setVisible(!alreadyAccepted);
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // localStorage unavailable — the banner will just reappear next visit, which is fine
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-6 py-4 shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Brew Scout uses only strictly necessary cookies to keep you signed in and to protect your account.
          See our{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>{" "}
          for details.
        </p>
        <Button type="button" size="sm" onClick={accept} className="shrink-0">
          Got it
        </Button>
      </div>
    </div>
  );
}
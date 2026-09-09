"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
        <Image src="/logo.png" alt="" width={28} height={28} className="rounded-md" aria-hidden="true" />
        Brew Scout
      </Link>

      <nav className="flex items-center gap-3">
        {!isLoading && user ? (
          <>
            <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </>
        ) : (
          !isLoading && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )
        )}
      </nav>
    </header>
  );
}
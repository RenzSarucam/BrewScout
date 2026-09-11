"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const PUBLIC_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/map", label: "Map" },
];

const AUTH_LINKS = [
  { href: "/favorites", label: "Saved" },
  { href: "/reviews", label: "Reviews" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-wordmark.png"
            alt="Brew Scout"
            width={1252}
            height={534}
            priority
            className="h-11 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-4 text-sm font-medium text-muted-foreground sm:flex">
          {PUBLIC_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {!isLoading &&
            user &&
            AUTH_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </Link>
            ))}
        </nav>
      </div>

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
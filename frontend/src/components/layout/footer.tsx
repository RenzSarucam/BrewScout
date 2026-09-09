import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card px-6 py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} Brew Scout</span>
        <nav className="flex flex-wrap gap-4">
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/cookies" className="hover:underline">
            Cookies
          </Link>
          <Link href="/accessibility" className="hover:underline">
            Accessibility
          </Link>
        </nav>
      </div>
    </footer>
  );
}
export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-bold">1. Information we collect</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>
              <strong>Account information:</strong> your name, email address, and password (stored as a
              one-way hash — we never see or store your plain-text password).
            </li>
            <li>
              <strong>Content you create:</strong> reviews, ratings, saved coffee shops, and reports you file
              against other reviews.
            </li>
            <li>
              <strong>Location, only when you choose to share it:</strong> to search for nearby coffee shops,
              get directions, or confirm you&apos;re at a shop for the &ldquo;I&apos;m Here&rdquo;
              location-verified badge. Your browser always asks for permission first, and we only use your
              coordinates for that specific action — we don&apos;t track or store a location history.
            </li>
            <li>
              <strong>Basic technical data:</strong> the session cookie that keeps you signed in, and the
              anti-forgery (CSRF) token that protects your account from cross-site attacks.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1 font-bold">2. How we use it</h2>
          <p>
            To run the core features of Brew Scout: showing you nearby coffee shops, ranking them with our
            recommendation score, saving your favorites, publishing your reviews, verifying visits, and
            keeping your account secure.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">3. Third parties we share data with</h2>
          <p>
            To search for coffee shops, show place details and photos, and calculate routes, we send your
            search coordinates (and, for directions, your chosen origin) to Google Maps Platform. We don&apos;t
            sell your personal information to anyone, and we don&apos;t share your account details with
            advertisers.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">4. Cookies</h2>
          <p>
            We use strictly necessary cookies to keep you signed in and to protect your account (see our{" "}
            <a href="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </a>{" "}
            for details). We don&apos;t use advertising or cross-site tracking cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">5. Your choices</h2>
          <p>
            You can edit or delete any review you&apos;ve written, unsave a coffee shop at any time, and deny
            or revoke location access from your browser settings whenever you like — the app still works for
            browsing without it.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">6. Data retention</h2>
          <p>
            We keep your account and content for as long as your account is active. If you&apos;d like your
            account and data deleted, contact us and we&apos;ll take care of it.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">7. Contact</h2>
          <p>Questions about this policy? Reach out through the contact details on our website.</p>
        </section>
      </div>
    </main>
  );
}
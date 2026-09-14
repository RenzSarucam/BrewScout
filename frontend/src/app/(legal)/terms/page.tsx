export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Terms of Use</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="mb-1 font-semibold">1. Acceptance of terms</h2>
          <p>
            By creating an account or using Brew Scout, you agree to these Terms of Use and to our{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">2. What Brew Scout is</h2>
          <p>
            Brew Scout helps you discover coffee shops, compare them using our recommendation score, get
            directions, save favorites, and read or write reviews. Coffee shop listings, ratings, and photos
            are sourced from Google Maps Platform and are shown alongside — never mixed with — reviews written
            by Brew Scout users.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">3. Your account</h2>
          <p>
            You&apos;re responsible for the accuracy of the information you provide and for keeping your
            password secure. You must be old enough to form a binding contract in your country to create an
            account.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">4. Reviews and content you submit</h2>
          <p>
            When you write a review, you&apos;re sharing your own honest experience. Reviews must not contain
            spam, harassment, fake content, or offensive material — content that violates this can be reported
            by other users and removed by our moderators. A review marked &ldquo;Location-verified&rdquo;
            simply means we checked that your device was near the coffee shop when you submitted it; it does
            not guarantee a purchase was made.
          </p>
          <p className="mt-2">
            You keep ownership of what you write, but you give Brew Scout permission to display it as part of
            the service. You can edit or delete your own reviews at any time.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">5. Acceptable use</h2>
          <p>
            Don&apos;t misuse the service: no scraping, no impersonating others, no uploading unlawful content,
            and no attempting to disrupt or reverse-engineer the platform.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">6. Third-party services</h2>
          <p>
            Coffee shop search, place details, directions, and maps are powered by Google Maps Platform, which
            has its own terms and privacy practices. Brew Scout is not responsible for the accuracy of
            third-party data.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">7. Changes and termination</h2>
          <p>
            We may update these terms as the service evolves, and we&apos;ll post the new version here. We may
            suspend accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">8. Contact</h2>
          <p>Questions about these terms? Reach out through the contact details on our website.</p>
        </section>
      </div>
    </main>
  );
}
export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Accessibility</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <p>
            We want Brew Scout to be usable by as many people as possible, including people who rely on
            keyboards, screen readers, or other assistive technology.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">What we do</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Build with semantic HTML and accessible components (shadcn/ui, built on Radix primitives).</li>
            <li>Support keyboard navigation for menus, dialogs, forms, and the review and rating controls.</li>
            <li>Provide text alternatives for icons and images used for meaning, not just decoration.</li>
            <li>Maintain readable color contrast in both light and dark themes.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-1 font-bold">Known limitations</h2>
          <p>
            Interactive maps are inherently visual; where possible we pair map views with list and text
            alternatives so the same information is available without one. We&apos;re continuing to improve
            coverage as the app grows.
          </p>
        </section>

        <section>
          <h2 className="mb-1 font-bold">Feedback</h2>
          <p>
            If you run into an accessibility barrier anywhere in Brew Scout, please let us know through the
            contact details on our website — we want to fix it.
          </p>
        </section>
      </div>
    </main>
  );
}
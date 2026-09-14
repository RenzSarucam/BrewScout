export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Cookie Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <section>
          <p>
            Brew Scout only uses cookies that are strictly necessary to run the service. We don&apos;t use
            advertising cookies, and we don&apos;t track you across other websites.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">Cookies we use</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[500px] border-collapse text-left text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Cookie</th>
                  <th className="px-3 py-2 font-medium">Purpose</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">brew_scout_session</td>
                  <td className="px-3 py-2">Keeps you signed in between page visits.</td>
                  <td className="px-3 py-2">Session</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">XSRF-TOKEN</td>
                  <td className="px-3 py-2">
                    Protects your account from cross-site request forgery when you save, review, or change
                    account settings.
                  </td>
                  <td className="px-3 py-2">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-1 font-semibold">Managing cookies</h2>
          <p>
            Since these cookies are required for the app to function (staying signed in and keeping your
            account secure), turning them off in your browser will effectively sign you out. You can clear
            them at any time from your browser&apos;s settings.
          </p>
        </section>
      </div>
    </main>
  );
}
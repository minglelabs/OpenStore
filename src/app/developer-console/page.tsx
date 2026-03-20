import { Badge } from "@/components/ui/badge";
import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { getCaller } from "@/server/api/server";

export default async function DeveloperConsolePage() {
  const caller = getCaller();
  const entries = await caller.store.developerConsole.summary();

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Developer Console"
          title="Portfolio, monetization, and order visibility"
          description="This first pass keeps the scope operational: catalog, pricing model, report inbox, and recent sales."
        />
      </section>

      <section className="space-y-6">
        {entries.map((entry) => (
          <div
            key={entry.developer.slug}
            className="rounded-[32px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{entry.developer.region}</Badge>
                  {entry.developer.verified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : null}
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink-strong)]">
                  {entry.developer.name}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  {entry.developer.headline}
                </p>
              </div>
              <div className="grid gap-3 text-right text-sm text-[var(--ink-soft)] sm:grid-cols-3">
                <div className="rounded-[22px] bg-[var(--accent-soft)]/55 px-4 py-3">
                  <p>Paid apps</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                    {entry.monetization.paidApps}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--accent-soft)]/55 px-4 py-3">
                  <p>Subscriptions</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                    {entry.monetization.subscriptionApps}
                  </p>
                </div>
                <div className="rounded-[22px] bg-[var(--accent-soft)]/55 px-4 py-3">
                  <p>Open reports</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--ink-strong)]">
                    {entry.inbox.openAppReports + entry.inbox.openDeveloperReports}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <SectionHeading title="Published apps" />
                <div className="grid gap-4">
                  {entry.apps.map((app) => (
                    <AppRow key={app.slug} app={app} compact />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
                  <SectionHeading title="Sales snapshot" />
                  <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
                    {entry.sales.count}
                  </p>
                  <p className="mt-2 text-sm text-white/72">Succeeded orders</p>
                  <div className="mt-4 space-y-2 text-sm text-white/82">
                    {entry.sales.totalsByCurrency.length ? (
                      entry.sales.totalsByCurrency.map((total) => (
                        <div
                          key={total.currencyCode}
                          className="flex items-center justify-between rounded-[20px] bg-white/8 px-4 py-3"
                        >
                          <span>{total.currencyCode}</span>
                          <span>{total.label}</span>
                        </div>
                      ))
                    ) : (
                      <p>No checkout revenue recorded yet.</p>
                    )}
                  </div>
                </div>
                <div className="rounded-[26px] border border-white/40 bg-white p-5">
                  <SectionHeading title="Inbox" />
                  <div className="mt-4 grid gap-3 text-sm text-[var(--ink-soft)]">
                    <div className="flex items-center justify-between rounded-[20px] bg-[var(--accent-soft)]/45 px-4 py-3">
                      <span>App reports</span>
                      <span className="font-semibold text-[var(--ink-strong)]">
                        {entry.inbox.openAppReports}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-[20px] bg-[var(--accent-soft)]/45 px-4 py-3">
                      <span>Developer reports</span>
                      <span className="font-semibold text-[var(--ink-strong)]">
                        {entry.inbox.openDeveloperReports}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

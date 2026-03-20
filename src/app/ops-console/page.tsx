import Link from "next/link";

import {
  resolveAppReportAction,
  resolveDeveloperReportAction,
} from "@/app/_actions/store-actions";
import { SectionHeading } from "@/components/store/section-heading";
import { SubmitButton } from "@/components/store/submit-button";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

export default async function OpsConsolePage() {
  const caller = getCaller();
  const dashboard = await caller.store.ops.dashboard();

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Ops Console"
          title="Reports, orders, and operator activity"
          description="This is the first operational surface for moderation and commerce oversight."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <p className="text-sm text-[var(--ink-soft)]">Open reports</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {dashboard.summary.openReports}
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <p className="text-sm text-[var(--ink-soft)]">Pending orders</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {dashboard.summary.pendingOrders}
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <p className="text-sm text-[var(--ink-soft)]">Succeeded orders</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {dashboard.summary.succeededOrders}
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <p className="text-sm text-[var(--ink-soft)]">Active subscriptions</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
              {dashboard.summary.activeSubscriptions}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <SectionHeading title="Open app reports" />
          {dashboard.openAppReports.length ? (
            dashboard.openAppReports.map((report) => (
              <form
                key={report.id}
                action={resolveAppReportAction}
                className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <input name="id" type="hidden" value={report.id} />
                <input name="returnPath" type="hidden" value="/ops-console" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{report.reason}</Badge>
                      <Badge>{report.app.name}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      {report.detail || "No additional detail was provided."}
                    </p>
                    <Link
                      className="mt-3 inline-flex text-sm font-medium text-[var(--accent-strong)]"
                      href={`/apps/${report.app.slug}`}
                    >
                      View app
                    </Link>
                  </div>
                  <SubmitButton pendingLabel="Resolving..." size="sm">
                    Resolve
                  </SubmitButton>
                </div>
              </form>
            ))
          ) : (
            <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 text-sm text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
              No open app reports.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SectionHeading title="Open developer reports" />
          {dashboard.openDeveloperReports.length ? (
            dashboard.openDeveloperReports.map((report) => (
              <form
                key={report.id}
                action={resolveDeveloperReportAction}
                className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <input name="id" type="hidden" value={report.id} />
                <input name="returnPath" type="hidden" value="/ops-console" />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="muted">{report.reason}</Badge>
                      <Badge>{report.developer.name}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                      {report.detail || "No additional detail was provided."}
                    </p>
                    <Link
                      className="mt-3 inline-flex text-sm font-medium text-[var(--accent-strong)]"
                      href={`/developers/${report.developer.slug}`}
                    >
                      View developer
                    </Link>
                  </div>
                  <SubmitButton pendingLabel="Resolving..." size="sm">
                    Resolve
                  </SubmitButton>
                </div>
              </form>
            ))
          ) : (
            <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 text-sm text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
              No open developer reports.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeading title="Recent checkout orders" />
          <div className="space-y-4">
            {dashboard.recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink-strong)]">
                      {order.app.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {order.provider} · {order.lane} · {order.selectedPaymentMethod}
                    </p>
                  </div>
                  <Badge variant={order.status === "SUCCEEDED" ? "success" : "muted"}>
                    {order.status}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--ink-soft)]">
                  <span>{order.amountLabel}</span>
                  <span>
                    {order.countryCode}/{order.currencyCode}
                  </span>
                  <span>{order.platform}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
          <SectionHeading title="Recent activity" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/82">
            {dashboard.recentActivity.map((item) => (
              <li key={`${item.title}-${item.timestamp}`}>
                <p className="font-medium text-white">{item.title}</p>
                <p>{item.detail}</p>
                <p className="text-white/55">{item.timestamp}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

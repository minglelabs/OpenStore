import Link from "next/link";
import { CreditCard, ShieldCheck, Smartphone, BellRing } from "lucide-react";

import {
  signOutDeviceAction,
  toggleNotificationAction,
} from "@/app/_actions/store-actions";
import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { SubmitButton } from "@/components/store/submit-button";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

export default async function AccountPage() {
  const caller = getCaller();
  const account = await caller.store.account();

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge>{account.plan}</Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
              {account.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{account.email}</p>
          </div>
          <div className="rounded-[26px] bg-[var(--accent-soft)]/55 p-4 text-right">
            <p className="text-sm text-[var(--ink-soft)]">Wallet credit</p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
              {account.walletCredit}
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{account.region}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Notifications"
            title="What the store is allowed to tell you"
            description="Notification settings should feel explicit and reversible."
          />
          <div className="space-y-4">
            {account.notifications.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink-strong)]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {item.description}
                    </p>
                  </div>
                  <Badge variant={item.enabled ? "success" : "muted"}>
                    {item.enabled ? "On" : "Off"}
                  </Badge>
                </div>
                <form action={toggleNotificationAction} className="mt-4">
                  <input name="label" type="hidden" value={item.label} />
                  <input name="enabled" type="hidden" value={String(!item.enabled)} />
                  <input name="returnPath" type="hidden" value="/account" />
                  <SubmitButton pendingLabel="Saving..." size="sm" variant="secondary">
                    Turn {item.enabled ? "off" : "on"}
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            eyebrow="Security"
            title="Trusted devices and controls"
            description="The account surface should stay operational, not decorative."
          />
          <div className="space-y-4">
            {account.devices.map((device) => (
              <div
                key={device.name}
                className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-[var(--ink-strong)]">
                      {device.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {device.platform}
                    </p>
                  </div>
                  <Badge variant={device.trusted ? "success" : "muted"}>
                    {device.trusted ? "Trusted" : "Review"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  Last seen {device.lastSeen}
                </p>
                <form action={signOutDeviceAction} className="mt-4">
                  <input name="name" type="hidden" value={device.name} />
                  <input name="returnPath" type="hidden" value="/account" />
                  <SubmitButton pendingLabel="Signing out..." size="sm" variant="outline">
                    Sign out this device
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Subscriptions"
          title="Active subscriptions"
          description="Subscriptions need to be inspectable without drilling through multiple settings layers."
        />
        <div className="grid gap-4">
          {account.activeSubscriptions.map((app) => (
            <AppRow key={app.slug} app={app} compact />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          <CreditCard className="h-5 w-5 text-[var(--accent-strong)]" />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">Billing</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
            {account.billing.map((item) => (
              <li key={item.label}>
                <p className="font-medium text-[var(--ink-strong)]">{item.label}</p>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          <BellRing className="h-5 w-5 text-[var(--accent-strong)]" />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
            Communication
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
            OpenStore should keep release, billing, and security messaging separate so users can tune each stream.
          </p>
        </div>
        <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
          <ShieldCheck className="h-5 w-5 text-[#ffcc82]" />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
            Purchase controls
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/82">
            {account.controls.map((control) => (
              <li key={control} className="flex gap-3">
                <Smartphone className="mt-1 h-4 w-4 shrink-0" />
                <span>{control}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/developer-console"
          className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
        >
          <p className="text-sm font-medium text-[var(--ink-soft)]">Developer console</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
            Review app portfolio and checkout sales
          </p>
        </Link>
        <Link
          href="/ops-console"
          className="rounded-[28px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]"
        >
          <p className="text-sm font-medium text-white/70">Ops console</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
            Resolve reports and inspect checkout orders
          </p>
        </Link>
      </section>
    </>
  );
}

import { Clock3, DownloadCloud, LibraryBig, RefreshCw } from "lucide-react";

import {
  hidePurchaseAction,
  pauseDownloadAction,
  queueInstallAction,
  removeFromWishlistAction,
  restorePurchasesAction,
  resumeDownloadAction,
  retryDownloadAction,
  unhidePurchaseAction,
} from "@/app/_actions/store-actions";
import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { SubmitButton } from "@/components/store/submit-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCaller } from "@/server/api/server";

export default async function LibraryPage() {
  const caller = getCaller();
  const [library, purchaseHistory, hiddenPurchases] = await Promise.all([
    caller.store.library(),
    caller.store.libraryTools.purchaseHistory(),
    caller.store.libraryTools.hiddenPurchases(),
  ]);

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Library"
          title="Your installs, updates, and queue"
          description="Library is where the product shifts from discovery into ownership."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <LibraryBig className="h-5 w-5 text-[var(--accent-strong)]" />
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              {library.installed.length}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Installed apps</p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <RefreshCw className="h-5 w-5 text-[var(--accent-strong)]" />
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              {library.updates.length}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Updates in progress</p>
          </div>
          <div className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4">
            <DownloadCloud className="h-5 w-5 text-[var(--accent-strong)]" />
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              {library.queueAverage}%
            </p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Average queue progress</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading
            eyebrow="Updates"
            title="Available updates"
            description="Visible progress and clear status matter more than decorative motion here."
          />
          <form action={restorePurchasesAction}>
            <input name="returnPath" type="hidden" value="/library" />
            <SubmitButton pendingLabel="Restoring..." variant="secondary">
              Restore purchases
            </SubmitButton>
          </form>
        </div>
        <div className="grid gap-4">
          {library.updates.map((item) => (
            <div
              key={item.app.slug}
              className="rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <AppRow app={item.app} compact />
                </div>
                <Badge variant="success">{item.eta}</Badge>
              </div>
              <Progress className="mt-4" value={item.progress} />
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={pauseDownloadAction}>
                  <input name="slug" type="hidden" value={item.app.slug} />
                  <input name="returnPath" type="hidden" value="/library" />
                  <SubmitButton pendingLabel="Pausing..." size="sm" variant="outline">
                    Pause
                  </SubmitButton>
                </form>
                <form action={resumeDownloadAction}>
                  <input name="slug" type="hidden" value={item.app.slug} />
                  <input name="returnPath" type="hidden" value="/library" />
                  <SubmitButton pendingLabel="Resuming..." size="sm" variant="secondary">
                    Resume
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Installed"
          title="Apps ready to open"
          description="Installed apps should always be easy to find without searching again."
        />
        <div className="grid gap-4">
          {library.installed.map((app) => (
            <AppRow key={app.slug} app={app} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Queue"
            title="Downloads in progress"
            description="Queued installs and updates need explicit progress, retry context, and a predictable order."
          />
          <div className="space-y-4">
            {library.queue.map((item) => (
              <div
                key={item.app.slug}
                className="rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <AppRow app={item.app} compact />
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
                  <span>{item.eta}</span>
                  <span>{item.progress}%</span>
                </div>
                <Progress className="mt-3" value={item.progress} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={pauseDownloadAction}>
                    <input name="slug" type="hidden" value={item.app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Pausing..." size="sm" variant="outline">
                      Pause
                    </SubmitButton>
                  </form>
                  <form action={resumeDownloadAction}>
                    <input name="slug" type="hidden" value={item.app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Resuming..." size="sm" variant="secondary">
                      Resume
                    </SubmitButton>
                  </form>
                  <form action={retryDownloadAction}>
                    <input name="slug" type="hidden" value={item.app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Retrying..." size="sm">
                      Retry
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Wishlist"
            title="Saved for later"
            description="Wishlist gives the store a slower, more intentional shopping loop."
          />
          <div className="space-y-4">
            {library.wishlist.map((app) => (
              <div
                key={app.slug}
                className="rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <AppRow app={app} compact />
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={queueInstallAction}>
                    <input name="slug" type="hidden" value={app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Queueing..." size="sm">
                      Queue install
                    </SubmitButton>
                  </form>
                  <form action={removeFromWishlistAction}>
                    <input name="slug" type="hidden" value={app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Removing..." size="sm" variant="outline">
                      Remove
                    </SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-white/72">
              <Clock3 className="h-4 w-4" />
              Recent activity
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/82">
              {library.activity.map((item) => (
                <li key={`${item.title}-${item.timestamp}`}>
                  <p className="font-medium text-white">{item.title}</p>
                  <p>{item.detail}</p>
                  <p className="text-white/55">{item.timestamp}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Purchase history"
            title="Owned apps and visibility controls"
            description="Ownership history should be reviewable and reversible."
          />
          <div className="space-y-4">
            {purchaseHistory.map((entry) => (
              <div
                key={`${entry.slug}-${entry.purchasedAt}`}
                className="rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <AppRow app={entry.app} compact />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
                  <span>
                    {entry.purchasedAt} · {entry.pricePaid}
                  </span>
                  {entry.hidden ? <Badge variant="muted">Hidden</Badge> : null}
                </div>
                {!entry.hidden ? (
                  <form action={hidePurchaseAction} className="mt-4">
                    <input name="slug" type="hidden" value={entry.app.slug} />
                    <input name="returnPath" type="hidden" value="/library" />
                    <SubmitButton pendingLabel="Updating..." size="sm" variant="outline">
                      Hide purchase
                    </SubmitButton>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeading
            eyebrow="Hidden purchases"
            title="Restore visibility"
            description="Users should be able to hide and unhide ownership records without friction."
          />
          <div className="space-y-4">
            {hiddenPurchases.map((entry) => (
              <div
                key={entry.slug}
                className="rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              >
                <AppRow app={entry.app} compact />
                <p className="mt-4 text-sm text-[var(--ink-soft)]">
                  Hidden {entry.hiddenAt}
                </p>
                <form action={unhidePurchaseAction} className="mt-4">
                  <input name="slug" type="hidden" value={entry.app.slug} />
                  <input name="returnPath" type="hidden" value="/library" />
                  <SubmitButton pendingLabel="Restoring..." size="sm" variant="secondary">
                    Unhide purchase
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { Clock3, DownloadCloud, LibraryBig, RefreshCw } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getCaller } from "@/server/api/server";

export default async function LibraryPage() {
  const caller = getCaller();
  const library = await caller.store.library();

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
          <Button variant="secondary">Resume all</Button>
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
              <AppRow key={app.slug} app={app} compact />
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
    </>
  );
}

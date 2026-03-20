import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Download, ShieldCheck, Star } from "lucide-react";

import { AppArtwork } from "@/components/store/app-artwork";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCaller } from "@/server/api/server";
import { formatCompactNumber } from "@/lib/utils";

function getPrimaryAction(status: string) {
  switch (status) {
    case "installed":
      return "Open";
    case "update":
      return "Update";
    case "queued":
      return "Queued";
    case "wishlist":
      return "Install";
    default:
      return "Get";
  }
}

type AppDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const caller = getCaller();
  const app = await caller.store.appBySlug({ slug }).catch(() => null);

  if (!app) {
    notFound();
  }

  return (
    <>
      <section
        className="overflow-hidden rounded-[40px] border border-white/45 p-6 shadow-[0_24px_60px_rgba(17,28,55,0.12)]"
        style={{
          background: `linear-gradient(135deg, ${app.gradient.from}, ${app.gradient.to})`,
        }}
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5 text-white">
            <div className="flex items-start gap-5">
              <AppArtwork name={app.name} gradient={app.gradient} size="lg" />
              <div>
                <Badge className="bg-white/18 text-white">{app.category.name}</Badge>
                <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
                  {app.name}
                </h1>
                <p className="mt-2 text-base text-white/82">{app.tagline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/82">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {app.rating.toFixed(1)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {formatCompactNumber(app.downloadCount)}
                  </span>
                  <span>{app.version}</span>
                  <span>{app.size}</span>
                </div>
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-white/84">
              {app.description}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button>{getPrimaryAction(app.status)}</Button>
              <Button variant="secondary">Share</Button>
              <Button variant="outline">Save for later</Button>
            </div>
          </div>
          <div className="rounded-[32px] border border-white/20 bg-black/12 p-5 text-white/90 backdrop-blur">
            <p className="text-sm font-medium text-white/72">Editorial note</p>
            <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
              {app.editorialQuote}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[22px] bg-white/10 p-3">
                <p className="text-white/60">Age rating</p>
                <p className="mt-2 font-semibold text-white">{app.ageRating}</p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-3">
                <p className="text-white/60">Price</p>
                <p className="mt-2 font-semibold text-white">{app.priceLabel}</p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-3">
                <p className="text-white/60">Developer</p>
                <p className="mt-2 font-semibold text-white">{app.developer.name}</p>
              </div>
              <div className="rounded-[22px] bg-white/10 p-3">
                <p className="text-white/60">Updated</p>
                <p className="mt-2 font-semibold text-white">{app.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <div className="rounded-[34px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading
              eyebrow="Screens"
              title="Preview the app experience"
              description="These screenshot placeholders mark the screen inventory and content rhythm the final product should support."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {app.screenshots.map((screen) => (
                <div
                  key={screen.title}
                  className="overflow-hidden rounded-[28px] border border-white/40 bg-[var(--accent-soft)]/45"
                >
                  <div
                    className="h-48"
                    style={{
                      background: `linear-gradient(180deg, ${app.gradient.from}, ${app.gradient.to})`,
                    }}
                  />
                  <div className="p-4">
                    <p className="font-semibold text-[var(--ink-strong)]">{screen.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {screen.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading eyebrow="Highlights" title="Why users install it" />
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {app.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4 text-sm leading-6 text-[var(--ink-strong)]"
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/40 bg-white/75 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading eyebrow="Reviews" title="What people are saying" />
            <div className="mt-5 space-y-4">
              {app.reviews.map((review) => (
                <div
                  key={`${review.author}-${review.title}`}
                  className="rounded-[24px] border border-white/40 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[var(--ink-strong)]">{review.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{review.author}</p>
                    </div>
                    <Badge variant="muted">{review.submittedAt}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                    {review.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[34px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="What&apos;s new" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {app.whatsNew.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[34px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="Features" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {app.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[34px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="Privacy and purchases" />
            <div className="mt-4 space-y-4 text-sm leading-6 text-[var(--ink-soft)]">
              <div>
                <p className="font-medium text-[var(--ink-strong)]">Permissions</p>
                <ul className="mt-2 space-y-2">
                  {app.permissions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-[var(--ink-strong)]">In-app purchases</p>
                <ul className="mt-2 space-y-2">
                  {app.inAppPurchases.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
            <ShieldCheck className="h-5 w-5 text-[#ffcb83]" />
            <p className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
              Developer and category
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-white/82">
              <Link
                href={`/developers/${app.developer.slug}`}
                className="flex items-center justify-between rounded-[20px] bg-white/8 px-4 py-3"
              >
                <span>{app.developer.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/categories/${app.category.slug}`}
                className="flex items-center justify-between rounded-[20px] bg-white/8 px-4 py-3"
              >
                <span>{app.category.name}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}

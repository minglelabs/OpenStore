import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Star } from "lucide-react";

import { AppArtwork } from "@/components/store/app-artwork";
import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCaller } from "@/server/api/server";

export default async function TodayPage() {
  const caller = getCaller();
  const feed = await caller.store.today();
  const hero = feed.hero;
  const primaryCollection = feed.collections[0];

  return (
    <>
      {hero ? (
        <section
          className="overflow-hidden rounded-[40px] border border-white/45 p-6 shadow-[0_24px_60px_rgba(17,28,55,0.12)]"
          style={{
            background: `linear-gradient(135deg, ${hero.gradient.from}, ${hero.gradient.to})`,
          }}
        >
          <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-5 text-white">
              <Badge className="bg-white/18 text-white">Editor&apos;s Pick</Badge>
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.24em] text-white/75">
                  Today
                </p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-[-0.06em]">
                  {hero.name}
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/82">
                  {hero.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/82">
                <span className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  {hero.rating.toFixed(1)} from {hero.ratingCount.toLocaleString()} reviews
                </span>
                <span>{hero.version}</span>
                <span>{hero.updatedAt}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/apps/${hero.slug}`}>Open app detail</Link>
                </Button>
                {primaryCollection ? (
                  <Button asChild variant="secondary">
                    <Link href={`/collections/${primaryCollection.slug}`}>
                      Explore collection
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="rounded-[32px] border border-white/20 bg-black/12 p-5 text-white/90 backdrop-blur">
              <div className="flex items-start gap-4">
                <AppArtwork name={hero.name} gradient={hero.gradient} size="lg" />
                <div>
                  <p className="text-sm font-medium text-white/70">
                    Why it matters
                  </p>
                  <p className="mt-2 text-lg font-semibold">{hero.editorialQuote}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm leading-6">
                {hero.highlights.map((highlight) => (
                  <li key={highlight} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Release Radar"
          title="Fresh updates worth looking at"
          description="A fast editorial snapshot of the releases and launches that changed meaningfully this week."
        />
        <div className="grid gap-4">
          {feed.releaseRadar.map((app) => (
            <AppRow key={app.slug} app={app} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Featured Apps"
          title="Quiet excellence across work and wellness"
          description="The store should feel curated, not merely sorted by scale."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {feed.spotlightApps.map((app) => (
            <Link
              key={app.slug}
              href={`/apps/${app.slug}`}
              className="rounded-[30px] border border-white/45 bg-white/72 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)] transition hover:-translate-y-1 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <AppArtwork name={app.name} gradient={app.gradient} />
                <Badge variant="muted">{app.priceLabel}</Badge>
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">
                {app.name}
              </h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{app.tagline}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--ink-soft)]">
                {app.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Collections"
          title="Curated routes through the catalog"
          description="Collections should help users make good decisions quickly, especially on mobile."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {feed.collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="overflow-hidden rounded-[34px] border border-white/40 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              style={{
                background: `linear-gradient(135deg, ${collection.theme.from}, ${collection.theme.to})`,
              }}
            >
              <Badge className="bg-white/20 text-white">Collection</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                {collection.name}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                {collection.description}
              </p>
              <div className="mt-6 flex items-center justify-between text-sm text-white/82">
                <span>{collection.apps.length} apps</span>
                <span className="inline-flex items-center gap-1">
                  Open
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-white/40 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Trust"
          title="Store safety should be visible"
          description="OpenStore aims to explain why an app deserves trust before the download button becomes the focus."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {feed.safetyNotes.map((note) => (
            <div
              key={note}
              className="rounded-[24px] bg-[var(--accent-soft)]/55 p-4 text-sm leading-6 text-[var(--ink-strong)]"
            >
              <ShieldCheck className="mb-3 h-5 w-5 text-[var(--accent-strong)]" />
              {note}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

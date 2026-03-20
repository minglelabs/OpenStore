import Link from "next/link";
import { ArrowRight, Sparkles, Verified } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

export default async function DiscoverPage() {
  const caller = getCaller();
  const feed = await caller.store.discover();

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Discover"
          title="Browse by taste, not only by rank"
          description="The discover surface should make the catalog feel legible for new users and rewarding for returning ones."
        />
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {feed.categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-[26px] bg-[var(--accent-soft)]/60 p-4 transition hover:-translate-y-0.5"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                Category
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
                {category.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {category.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Collections"
          title="Editorial pathways through the store"
          description="Collections are where OpenStore explains context and taste instead of merely stacking cards."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {feed.collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/collections/${collection.slug}`}
              className="overflow-hidden rounded-[30px] border border-white/40 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
              style={{
                background: `linear-gradient(135deg, ${collection.theme.from}, ${collection.theme.to})`,
              }}
            >
              <Badge className="bg-white/18 text-white">Curated</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                {collection.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/82">
                {collection.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-white">
                View collection
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Developers"
          title="Studios worth following"
          description="Verified teams with a clear product point of view."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {feed.featuredDevelopers.map((developer) => (
            <Link
              key={developer.slug}
              href={`/developers/${developer.slug}`}
              className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)] transition hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <Badge variant="muted">{developer.region}</Badge>
                {developer.verified ? (
                  <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                    <Verified className="h-4 w-4" />
                    Verified
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
                {developer.name}
              </h2>
              <p className="mt-2 text-sm font-medium text-[var(--ink-strong)]">
                {developer.headline}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                {developer.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Hidden Gems"
          title="Smaller apps with sharper ideas"
          description="This is the part of the store where discovery should feel generous."
        />
        <div className="grid gap-4">
          {feed.hiddenGems.map((app) => (
            <AppRow key={app.slug} app={app} />
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-white/40 bg-[var(--ink-strong)] p-6 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
        <SectionHeading
          eyebrow="Principles"
          title="What this store should optimize for"
          description="OpenStore should feel premium, legible, and more explicit about trust than the status quo."
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {feed.principles.map((principle) => (
            <div key={principle} className="rounded-[24px] bg-white/8 p-4 text-sm leading-6">
              <Sparkles className="mb-3 h-5 w-5 text-[#ffc47a]" />
              {principle}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

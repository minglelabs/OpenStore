import { notFound } from "next/navigation";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

type CollectionDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { slug } = await params;
  const caller = getCaller();
  const collection = await caller.store.collectionBySlug({ slug }).catch(() => null);

  if (!collection) {
    notFound();
  }

  return (
    <>
      <section
        className="overflow-hidden rounded-[40px] border border-white/45 p-6 shadow-[0_24px_60px_rgba(17,28,55,0.12)]"
        style={{
          background: `linear-gradient(135deg, ${collection.theme.from}, ${collection.theme.to})`,
        }}
      >
        <Badge className="bg-white/18 text-white">Collection</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white">
          {collection.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/82">
          {collection.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/82">
          <span>Curated by {collection.curator}</span>
          <span>{collection.apps.length} apps included</span>
          {collection.category ? <span>{collection.category.name}</span> : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Included Apps"
            title="Everything in this route"
            description="Collections should help users understand why these products belong together."
          />
          <div className="grid gap-4">
            {collection.apps.map((app) => (
              <AppRow key={app.slug} app={app} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="Editorial note" />
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              This collection is built around a single user state rather than a loose category. The goal is to reduce decision fatigue on mobile.
            </p>
          </div>
          <div className="rounded-[30px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading title="Why this grouping works" />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              <li>Each app solves a distinct part of the user journey.</li>
              <li>Quality and tone feel coherent across the bundle.</li>
              <li>The collection can be understood quickly on a phone-sized screen.</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

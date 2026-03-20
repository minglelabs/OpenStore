import { notFound } from "next/navigation";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { getCaller } from "@/server/api/server";

type CategoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const caller = getCaller();
  const category = await caller.store.categoryBySlug({ slug }).catch(() => null);

  if (!category) {
    notFound();
  }

  const featuredApps = [...category.apps]
    .sort((left, right) => right.rating - left.rating)
    .slice(0, 3);

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <Badge>{category.name}</Badge>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em]">
          {category.name}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
          {category.summary}
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <SectionHeading
            eyebrow="Featured"
            title="Top picks in this category"
            description="Featured picks should demonstrate quality, clarity, and different use cases."
          />
          <div className="grid gap-4">
            {featuredApps.map((app) => (
              <AppRow key={app.slug} app={app} />
            ))}
          </div>
        </div>
        <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
          <SectionHeading title="Buying guide" />
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/82">
            {category.buyingGuide.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Browse all"
          title="Everything in this category"
          description="Category pages need both a quick top layer and a full browse layer."
        />
        <div className="grid gap-4">
          {category.apps.map((app) => (
            <AppRow key={app.slug} app={app} />
          ))}
        </div>
      </section>
    </>
  );
}

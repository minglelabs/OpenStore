import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCaller } from "@/server/api/server";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

const trendingSearches = ["privacy", "ai", "sleep", "remote work", "arcade"];

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  const caller = getCaller();
  const results = await caller.store.search({ query });
  const hasResults =
    results.apps.length > 0 ||
    results.developers.length > 0 ||
    results.categories.length > 0;

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <SectionHeading
          eyebrow="Search"
          title="Find apps, developers, and categories"
          description="Search should feel useful even before the user knows exactly what they are looking for."
        />
        <form action="/search" className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label="Search OpenStore"
            defaultValue={query}
            name="q"
            placeholder="Search apps, developers, or categories"
          />
          <Button type="submit" className="sm:w-auto">
            <span className="inline-flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Search
            </span>
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {trendingSearches.map((term) => (
            <Link key={term} href={`/search?q=${encodeURIComponent(term)}`}>
              <Badge variant="muted">{term}</Badge>
            </Link>
          ))}
        </div>
      </section>

      {query ? (
        hasResults ? (
          <>
            <section className="space-y-4">
              <SectionHeading
                eyebrow="Apps"
                title={`Results for ${query}`}
                description="High-signal app results first, then the surrounding catalog context."
              />
              <div className="grid gap-4">
                {results.apps.map((app) => (
                  <AppRow key={app.slug} app={app} />
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <SectionHeading title="Developers" />
                <div className="space-y-3">
                  {results.developers.map((developer) => (
                    <Link
                      key={developer.slug}
                      href={`/developers/${developer.slug}`}
                      className="block rounded-[26px] border border-white/40 bg-white/75 p-4 text-sm leading-6 text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
                    >
                      <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
                        {developer.name}
                      </h3>
                      <p className="mt-2 font-medium text-[var(--ink-strong)]">
                        {developer.headline}
                      </p>
                      <p className="mt-2">{developer.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <SectionHeading title="Categories" />
                <div className="space-y-3">
                  {results.categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/categories/${category.slug}`}
                      className="block rounded-[26px] border border-white/40 bg-white/75 p-4 text-sm leading-6 text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]"
                    >
                      <h3 className="text-xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
                        {category.name}
                      </h3>
                      <p className="mt-2">{category.summary}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-[30px] border border-white/40 bg-white/72 p-6 text-sm leading-6 text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            No results matched <span className="font-medium text-[var(--ink-strong)]">{query}</span>. Try a category like <span className="font-medium text-[var(--ink-strong)]">privacy</span> or a use case like <span className="font-medium text-[var(--ink-strong)]">remote work</span>.
          </section>
        )
      ) : (
        <section className="rounded-[30px] border border-white/40 bg-white/72 p-6 text-sm leading-6 text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          Start with a use case, a category, or a product type. This prototype currently searches apps, developers, and categories from the mock catalog.
        </section>
      )}
    </>
  );
}

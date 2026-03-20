import Link from "next/link";
import { BarChart3, Filter, Layers3, Sparkles } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCaller } from "@/server/api/server";

const chartViews = [
  { key: "free", label: "Top Free" },
  { key: "paid", label: "Top Paid" },
  { key: "grossing", label: "Top Grossing" },
  { key: "trending", label: "Trending" },
] as const;

const timeframes = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

type ChartViewKey = (typeof chartViews)[number]["key"];
type ChartTimeframeKey = (typeof timeframes)[number]["key"];

type ChartPageProps = {
  searchParams: Promise<{
    view?: string | string[];
    timeframe?: string | string[];
    category?: string | string[];
  }>;
};

function buildChartsHref({
  view,
  timeframe,
  categorySlug,
}: {
  view: ChartViewKey;
  timeframe: ChartTimeframeKey;
  categorySlug?: string;
}) {
  const params = new URLSearchParams({
    view,
    timeframe,
  });

  if (categorySlug) {
    params.set("category", categorySlug);
  }

  return `/charts?${params.toString()}`;
}

function getEntryNote({
  highlight,
  previousRank,
  editorialReason,
}: {
  highlight: string;
  previousRank: number | null;
  editorialReason?: string;
}) {
  const previousText =
    previousRank === null ? "New to this chart window." : `Previously #${previousRank}.`;

  return editorialReason
    ? `${highlight} ${editorialReason} ${previousText}`
    : `${highlight} ${previousText}`;
}

function isChartView(value?: string): value is ChartViewKey {
  return chartViews.some((item) => item.key === value);
}

function isChartTimeframe(value?: string): value is ChartTimeframeKey {
  return timeframes.some((item) => item.key === value);
}

export default async function ChartsPage({ searchParams }: ChartPageProps) {
  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const requestedTimeframe = Array.isArray(params.timeframe)
    ? params.timeframe[0]
    : params.timeframe;
  const requestedCategory = Array.isArray(params.category)
    ? params.category[0]
    : params.category;
  const view: ChartViewKey = isChartView(requestedView) ? requestedView : "free";
  const timeframe: ChartTimeframeKey = isChartTimeframe(requestedTimeframe)
    ? requestedTimeframe
    : "weekly";

  const caller = getCaller();
  const categories = await caller.store.catalog.categories();
  const categorySlug = categories.some((category) => category.slug === requestedCategory)
    ? requestedCategory
    : undefined;
  const chart = await caller.store.charts({
    view,
    timeframe,
    categorySlug,
  });

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow="Leaderboard"
            title={chart.title}
            description={chart.description}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{chart.label}</Badge>
            <Badge variant="muted">{chart.updatedAt}</Badge>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              <BarChart3 className="h-3.5 w-3.5" />
              Chart Type
            </div>
            <div className="inline-flex flex-wrap gap-2 rounded-full bg-[var(--accent-soft)]/55 p-1.5">
              {chartViews.map((item) => (
                <Link
                  key={item.key}
                  href={buildChartsHref({
                    view: item.key,
                    timeframe,
                    categorySlug,
                  })}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition",
                    view === item.key && "bg-white text-[var(--ink-strong)] shadow",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                <Layers3 className="h-3.5 w-3.5" />
                Time Window
              </div>
              <div className="inline-flex flex-wrap gap-2">
                {timeframes.map((item) => (
                  <Link
                    key={item.key}
                    href={buildChartsHref({
                      view,
                      timeframe: item.key,
                      categorySlug,
                    })}
                    className={cn(
                      "rounded-full border border-white/55 bg-white/75 px-4 py-2 text-sm font-medium text-[var(--ink-soft)] shadow-[0_12px_30px_rgba(17,28,55,0.06)] transition",
                      timeframe === item.key &&
                        "border-transparent bg-[var(--ink-strong)] text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                <Filter className="h-3.5 w-3.5" />
                Category Chart
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildChartsHref({ view, timeframe })}
                  className={cn(
                    "rounded-full border border-white/55 bg-white/75 px-4 py-2 text-sm font-medium text-[var(--ink-soft)] shadow-[0_12px_30px_rgba(17,28,55,0.06)] transition",
                    !categorySlug &&
                      "border-transparent bg-[var(--accent-strong)] text-white",
                  )}
                >
                  All categories
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={buildChartsHref({
                      view,
                      timeframe,
                      categorySlug: category.slug,
                    })}
                    className={cn(
                      "rounded-full border border-white/55 bg-white/75 px-4 py-2 text-sm font-medium text-[var(--ink-soft)] shadow-[0_12px_30px_rgba(17,28,55,0.06)] transition",
                      categorySlug === category.slug &&
                        "border-transparent bg-[var(--accent-strong)] text-white",
                    )}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Coverage
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink-strong)]">
            {chart.stats.totalApps}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {chart.stats.categoryLabel
              ? `${chart.stats.categoryLabel} apps in this filtered leaderboard.`
              : "Apps currently ranked in this leaderboard window."}
          </p>
        </div>
        <div className="rounded-[28px] border border-white/40 bg-white/75 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Editorial Overrides
          </p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink-strong)]">
            {chart.stats.editorialOverrides}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            Labeled placements where editorial context affected discovery.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Biggest Mover
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.05em]">
            {chart.stats.biggestMover
              ? `${chart.stats.biggestMover.name} up ${chart.stats.biggestMover.movement}`
              : "No major rank climb"}
          </p>
          <p className="mt-2 text-sm leading-6 text-white/78">
            {chart.stats.biggestMover
              ? "The largest upward move inside the current leaderboard window."
              : "This snapshot is mostly stable across recent refreshes."}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.82fr]">
        <section className="space-y-4">
          {chart.entries.length > 0 ? (
            chart.entries.map((entry) => (
              <AppRow
                key={entry.app.slug}
                app={entry.app}
                rank={entry.rank}
                compact
                chartNote={getEntryNote({
                  highlight: entry.highlight,
                  previousRank: entry.previousRank,
                  editorialReason: entry.editorialReason,
                })}
                movement={entry.movement}
                movementDirection={entry.movementDirection}
                editorialBadge={entry.editorialBadge}
              />
            ))
          ) : (
            <div className="rounded-[30px] border border-dashed border-white/70 bg-white/72 p-6 text-sm leading-6 text-[var(--ink-soft)] shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
              No apps match this category in the current leaderboard window. Try a
              different chart type or clear the category filter.
              <div className="mt-4">
                <Button asChild variant="secondary" size="sm">
                  <Link href={buildChartsHref({ view, timeframe })}>Clear category</Link>
                </Button>
              </div>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[30px] border border-white/40 bg-white/72 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading
              eyebrow="Feature Inventory"
              title="What this leaderboard system now covers"
              description="This is the functional surface area the charts tab should expose, not only a sorted list."
            />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {chart.featureChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[30px] border border-white/40 bg-white/72 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <SectionHeading
              eyebrow="Methodology"
              title="How the ranking model behaves"
              description="Each chart declares its own logic so ranking is inspectable instead of mysterious."
            />
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {chart.methodology.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
              <Sparkles className="h-4 w-4" />
              Ranking health
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              {chart.rankingHealth}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/78">
              {chart.stats.categoryLabel
                ? `${chart.stats.categoryLabel} chart view is active. Rankings are re-based within the selected category.`
                : "All-category view is active. Switch category chips above to inspect local leaderboards."}
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { AppRow } from "@/components/store/app-row";
import { SectionHeading } from "@/components/store/section-heading";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCaller } from "@/server/api/server";

const chartViews = [
  { key: "free", label: "Top Free" },
  { key: "grossing", label: "Top Grossing" },
  { key: "trending", label: "Trending" },
] as const;

type ChartPageProps = {
  searchParams: Promise<{
    view?: string | string[];
  }>;
};

export default async function ChartsPage({ searchParams }: ChartPageProps) {
  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const view =
    requestedView === "grossing" || requestedView === "trending"
      ? requestedView
      : "free";

  const caller = getCaller();
  const chart = await caller.store.charts({ view });

  return (
    <>
      <section className="rounded-[36px] border border-white/45 bg-white/72 p-6 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <SectionHeading
            eyebrow="Charts"
            title="See what is winning right now"
            description="Charts are useful, but they should explain themselves. OpenStore pairs ranking with context."
          />
          <Badge variant="muted">Updated hourly</Badge>
        </div>
        <div className="mt-6 inline-flex flex-wrap gap-2 rounded-full bg-[var(--accent-soft)]/55 p-1.5">
          {chartViews.map((item) => (
            <Link
              key={item.key}
              href={`/charts?view=${item.key}`}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-[var(--ink-soft)] transition",
                view === item.key && "bg-white text-[var(--ink-strong)] shadow",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
        <section className="space-y-4">
          {chart.map((app, index) => (
            <AppRow key={app.slug} app={app} rank={index + 1} compact />
          ))}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[30px] border border-white/40 bg-white/72 p-5 shadow-[0_16px_40px_rgba(17,28,55,0.08)]">
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[var(--ink-strong)]">
              How ranking works
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              <li>Free charts prioritize installs, retention, and review quality.</li>
              <li>Grossing charts weigh subscription health and paid conversion.</li>
              <li>Trending charts react to update velocity, editorial interest, and search momentum.</li>
            </ul>
          </div>
          <div className="rounded-[30px] border border-white/40 bg-[var(--ink-strong)] p-5 text-white shadow-[0_16px_40px_rgba(17,28,55,0.14)]">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
              <BarChart3 className="h-4 w-4" />
              Ranking health
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              Stable with room for editorial overrides
            </p>
            <p className="mt-3 text-sm leading-6 text-white/78">
              This prototype treats charts as a discovery aid, not the entire product. Editorial curation still matters.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

import Link from "next/link";
import { ChevronRight, Download, Star } from "lucide-react";

import { AppArtwork } from "@/components/store/app-artwork";
import { Badge } from "@/components/ui/badge";
import type { EnrichedApp } from "@/lib/store-data";
import { cn, formatCompactNumber } from "@/lib/utils";

export function AppRow({
  app,
  rank,
  compact,
}: {
  app: EnrichedApp;
  rank?: number;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className={cn(
        "flex items-center gap-4 rounded-[28px] border border-white/40 bg-white/75 p-4 shadow-[0_16px_40px_rgba(17,28,55,0.08)] transition hover:-translate-y-0.5 hover:bg-white",
        compact && "rounded-[22px] p-3",
      )}
    >
      {rank ? (
        <span className="w-5 text-sm font-semibold text-[var(--ink-soft)]">
          {rank}
        </span>
      ) : null}
      <AppArtwork name={app.name} gradient={app.gradient} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold text-[var(--ink-strong)]">
            {app.name}
          </h3>
          <Badge variant="muted">{app.priceLabel}</Badge>
        </div>
        <p className="truncate text-sm text-[var(--ink-soft)]">{app.tagline}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[var(--ink-soft)]">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
            {app.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {formatCompactNumber(app.downloadCount)}
          </span>
          <span>{app.category.name}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-[var(--ink-soft)]" />
    </Link>
  );
}

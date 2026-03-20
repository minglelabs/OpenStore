import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  Download,
  Minus,
  Sparkles,
  Star,
} from "lucide-react";

import { AppArtwork } from "@/components/store/app-artwork";
import { Badge } from "@/components/ui/badge";
import type { ChartMovementDirection, EnrichedApp } from "@/lib/store-data";
import { cn, formatCompactNumber } from "@/lib/utils";

const movementIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: Minus,
  new: Minus,
} as const;

function getMovementLabel(
  movementDirection: ChartMovementDirection,
  movement: number,
) {
  if (movementDirection === "new") {
    return "New";
  }

  if (movementDirection === "flat" || movement === 0) {
    return "No change";
  }

  return movementDirection === "up" ? `Up ${movement}` : `Down ${movement}`;
}

export function AppRow({
  app,
  rank,
  compact,
  chartNote,
  movement,
  movementDirection,
  editorialBadge,
}: {
  app: EnrichedApp;
  rank?: number;
  compact?: boolean;
  chartNote?: string;
  movement?: number;
  movementDirection?: ChartMovementDirection;
  editorialBadge?: string;
}) {
  const MovementIcon = movementDirection ? movementIcons[movementDirection] : null;

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
          {editorialBadge ? (
            <Badge className="gap-1">
              <Sparkles className="h-3 w-3" />
              {editorialBadge}
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-sm text-[var(--ink-soft)]">{app.tagline}</p>
        {chartNote ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--ink-soft)]">
            {chartNote}
          </p>
        ) : null}
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
      <div className="flex flex-col items-end gap-2">
        {movementDirection ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
              movementDirection === "up" &&
                "bg-emerald-100 text-emerald-700",
              movementDirection === "down" &&
                "bg-rose-100 text-rose-700",
              (movementDirection === "flat" || movementDirection === "new") &&
                "bg-white/70 text-[var(--ink-soft)]",
            )}
          >
            {MovementIcon ? <MovementIcon className="h-3.5 w-3.5" /> : null}
            {getMovementLabel(movementDirection, movement ?? 0)}
          </span>
        ) : null}
        <ChevronRight className="h-4 w-4 text-[var(--ink-soft)]" />
      </div>
    </Link>
  );
}

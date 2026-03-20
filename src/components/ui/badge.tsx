import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "muted" | "success";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
  muted: "bg-white/70 text-[var(--ink-soft)]",
  success: "bg-emerald-100 text-emerald-700",
};

export function Badge({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

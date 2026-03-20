import { cn } from "@/lib/utils";

export function Progress({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[rgba(19,38,65,0.08)]",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-strong),#49c8ff)] transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

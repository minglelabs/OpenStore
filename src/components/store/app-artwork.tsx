import { cn } from "@/lib/utils";
import type { Gradient } from "@/lib/store-data";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AppArtwork({
  name,
  gradient,
  size = "md",
}: {
  name: string;
  gradient: Gradient;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[24px] text-white shadow-[0_16px_32px_rgba(17,28,55,0.18)]",
        size === "sm" && "h-14 w-14 rounded-[18px]",
        size === "md" && "h-16 w-16 rounded-[22px]",
        size === "lg" && "h-24 w-24 rounded-[28px]",
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
      <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tracking-[0.18em]">
        {getInitials(name)}
      </span>
    </div>
  );
}

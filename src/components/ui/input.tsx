import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-12 w-full rounded-2xl border border-white/40 bg-white/80 px-4 text-sm text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] outline-none ring-0 backdrop-blur placeholder:text-[var(--ink-soft)] focus:border-[var(--accent-strong)]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-28 w-full rounded-3xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-[var(--ink-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] outline-none ring-0 backdrop-blur placeholder:text-[var(--ink-soft)] focus:border-[var(--accent-strong)]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-[var(--accent-strong)] text-white shadow-[0_16px_30px_rgba(25,60,140,0.22)] hover:brightness-110",
  secondary:
    "bg-white/75 text-[var(--ink-strong)] shadow-[inset_0_0_0_1px_rgba(19,38,65,0.08)] hover:bg-white",
  outline:
    "bg-transparent text-[var(--ink-strong)] shadow-[inset_0_0_0_1px_rgba(19,38,65,0.16)] hover:bg-white/55",
  ghost: "bg-transparent text-[var(--ink-strong)] hover:bg-white/40",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-11 px-4 text-sm",
  sm: "h-9 px-3 text-xs",
  lg: "h-12 px-5 text-sm",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-strong)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

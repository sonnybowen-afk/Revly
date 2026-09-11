import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-hover shadow-sm hover:shadow-md",
  secondary:
    "bg-card text-foreground border border-border-strong hover:bg-muted",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
  danger:
    "bg-destructive-soft text-destructive-soft-foreground hover:brightness-95 border border-transparent",
};

// Every size clears the 44px minimum touch target.
const SIZES: Record<Size, string> = {
  sm: "min-h-11 px-3.5 text-sm gap-1.5",
  md: "min-h-11 px-5 text-sm gap-2",
  lg: "min-h-12 px-6 text-base gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-semibold cursor-pointer " +
  "transition-[background-color,box-shadow,color,transform] duration-200 ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function buttonStyles(variant: Variant = "primary", size: Size = "md") {
  return cn(BASE, VARIANTS[variant], SIZES[size]);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonStyles(variant, size), className)} {...props}>
      {children}
    </button>
  );
}

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(buttonStyles(variant, size), className)} {...props}>
      {children}
    </Link>
  );
}

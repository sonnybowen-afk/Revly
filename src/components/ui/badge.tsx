import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "brand" | "study" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "border-border-strong text-muted-foreground",
  brand: "border-primary/35 text-primary",
  study: "border-primary/35 text-primary",
  success: "border-success/40 text-success",
  warning: "border-warning/40 text-warning",
  danger: "border-destructive/40 text-destructive",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-0.5",
        "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
        // Labels wrap rather than truncate, and long tokens reflow.
        "max-w-full [overflow-wrap:anywhere]",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

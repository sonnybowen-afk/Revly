import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-28", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

/**
 * Editorial section head: a full-width hairline, a small-caps label sitting
 * on it, then the serif title. The rule does the work that a coloured
 * eyebrow used to do, and costs no colour.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={cn(centered && "text-center")}>
      {eyebrow ? (
        <div
          className={cn(
            "flex items-center gap-4 border-t border-rule/25 pt-4",
            centered && "justify-center",
          )}
        >
          <span className="eyebrow">{eyebrow}</span>
        </div>
      ) : null}

      <h2
        className={cn(
          "mt-5 font-display text-[2rem] leading-[1.06] md:text-[2.75rem]",
          "max-w-[20ch]",
          centered && "mx-auto",
        )}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={cn(
            "mt-5 max-w-[62ch] text-base leading-relaxed text-muted-foreground md:text-[1.0625rem]",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

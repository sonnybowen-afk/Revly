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
    <section id={id} className={cn("py-14 md:py-24", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}

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
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-bold max-w-[22ch]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-[68ch]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

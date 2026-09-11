import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-border bg-background-subtle">
      <div className="container-page py-12 md:py-16">
        <div className="max-w-3xl">
          {eyebrow ? <Badge tone="brand">{eyebrow}</Badge> : null}
          <h1 className="mt-4 text-3xl font-bold md:text-5xl max-w-[18ch]">
            {title}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}

/** A numbered vertical timeline — used for UCAS stages and NEA phases. */
export function Timeline({
  items,
}: {
  items: { title: string; meta?: string; body: ReactNode }[];
}) {
  return (
    <ol className="relative space-y-8 border-l-2 border-border pl-8">
      {items.map((item, i) => (
        <li key={item.title} className="relative">
          <span
            aria-hidden="true"
            className="tabular absolute -left-[2.6rem] grid size-8 place-items-center rounded-full border-2 border-border bg-card text-sm font-bold"
          >
            {i + 1}
          </span>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-lg font-bold">{item.title}</h3>
            {item.meta ? (
              <span className="text-sm font-semibold text-primary">
                {item.meta}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-muted-foreground leading-relaxed">
            {item.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning";
  title: string;
  children: ReactNode;
}) {
  const warning = tone === "warning";
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border p-5",
        warning
          ? "border-warning/30 bg-warning-soft"
          : "border-primary/25 bg-primary-soft",
      )}
    >
      <Info
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-5 shrink-0",
          warning ? "text-warning" : "text-primary",
        )}
      />
      <div
        className={cn(
          "min-w-0 text-sm leading-relaxed",
          warning
            ? "text-warning-soft-foreground"
            : "text-primary-soft-foreground",
        )}
      >
        <p className="font-bold">{title}</p>
        <div className="mt-1.5 space-y-2">{children}</div>
      </div>
    </div>
  );
}

/** Native disclosure — keyboard accessible with no JS and no focus traps. */
export function FAQ({
  items,
}: {
  items: { question: string; answer: ReactNode }[];
}) {
  return (
    <div className="divide-y divide-border rounded-card border border-card-border bg-card">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronRight
              aria-hidden="true"
              className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
            />
          </summary>
          <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}

export function LinkCard({
  href,
  title,
  description,
  meta,
  external,
}: {
  href: string;
  title: string;
  description: string;
  meta?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        {meta ? (
          <span className="shrink-0 text-xs font-semibold text-muted-foreground">
            {meta}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </>
  );

  const className =
    "card-surface block p-5 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] motion-reduce:hover:translate-y-0";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

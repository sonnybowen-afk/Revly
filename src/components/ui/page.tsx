import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
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
    <header className="border-b border-border">
      <div className="container-page py-14 md:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-rule/40" aria-hidden="true" />
              <span className="eyebrow">{eyebrow}</span>
            </div>
          ) : null}
          <h1 className="mt-6 max-w-[16ch] font-display text-[2.5rem] leading-[1.03] tracking-[-0.02em] md:text-[3.75rem]">
            {title}
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            {description}
          </p>
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}

/** Numbered stages, ruled rather than dotted. */
export function Timeline({
  items,
}: {
  items: { title: string; meta?: string; body: ReactNode }[];
}) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="grid gap-x-6 gap-y-2 py-7 sm:grid-cols-[3.5rem_1fr]"
        >
          <span
            aria-hidden="true"
            className="figures-display text-2xl text-muted-foreground"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h3 className="font-display text-xl leading-tight">
                {item.title}
              </h3>
              {item.meta ? (
                <span className="eyebrow text-primary">{item.meta}</span>
              ) : null}
            </div>
            <div className="mt-2.5 max-w-[68ch] leading-relaxed text-muted-foreground">
              {item.body}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** A marginal note: carried on a left rule, not inside a tinted box. */
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
        "flex gap-4 border-l-2 py-1 pl-5",
        warning ? "border-warning" : "border-primary",
      )}
    >
      <Info
        aria-hidden="true"
        className={cn(
          "mt-1 size-4 shrink-0",
          warning ? "text-warning" : "text-primary",
        )}
      />
      <div className="min-w-0 text-sm leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">{title}</p>
        <div className="mt-2 space-y-2">{children}</div>
      </div>
    </div>
  );
}

export function FAQ({
  items,
}: {
  items: { question: string; answer: ReactNode }[];
}) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-open:rotate-90"
            />
          </summary>
          <div className="max-w-[70ch] pb-6 leading-relaxed text-muted-foreground">
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
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-lg">{title}</h3>
        {meta ? (
          <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </>
  );

  const className =
    "block bg-card p-6 transition-colors duration-150 hover:bg-muted";

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

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FaqItem = { readonly q: string; readonly a: string };

/**
 * Frequently asked questions.
 *
 * Built on <details>/<summary>, so it opens without JavaScript, is
 * keyboard-operable for free, and browser find-in-page can reach the
 * answers. The only state React holds is which rows are open, purely to
 * rotate the icon.
 */
export function Faq({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  return (
    <ul className="divide-y divide-border border-y border-border">
      {items.map((item, i) => (
        <li key={i}>
          <details
            onToggle={(e) =>
              setOpen((prev) => ({
                ...prev,
                [i]: (e.currentTarget as HTMLDetailsElement).open,
              }))
            }
            className="group"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              <span className="text-[1.0625rem] leading-snug text-balance">
                {item.q}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] transition-transform duration-300 ease-out",
                  open[i] && "rotate-45 bg-primary-soft",
                )}
              >
                <Plus className="size-4 text-primary" />
              </span>
            </summary>
            <p className="max-w-[68ch] pb-6 text-pretty leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}

/**
 * FAQPage structured data, so the questions can surface directly in a
 * search result. It is built from the same array the page renders, which
 * is the only way the markup and the visible text cannot drift apart —
 * Google treats a mismatch as a violation.
 */
export function FaqJsonLd({ items }: { items: readonly FaqItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

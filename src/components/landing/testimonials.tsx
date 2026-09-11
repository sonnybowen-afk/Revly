import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/ui/section";

/*
 * ⚠️  PLACEHOLDER CONTENT — REPLACE BEFORE LAUNCH
 *
 * These are illustrative examples written to show the layout, NOT real
 * student quotes. Publishing invented testimonials as genuine is misleading
 * and, for a paid service in the UK, falls foul of the CAP Code and the
 * Digital Markets, Competition and Consumers Act 2024.
 *
 * Swap in real, attributable quotes with documented permission, or delete
 * the <Testimonials /> block from src/app/page.tsx until you have some.
 */
const PLACEHOLDER_QUOTES = [
  {
    quote:
      "Placeholder quote — replace with a real student's words about how the scheduling changed their revision.",
    name: "Student name",
    detail: "Year 13 · 3 A-Levels",
  },
  {
    quote:
      "Placeholder quote — a parent or tutor perspective works well in this slot.",
    name: "Parent name",
    detail: "Parent of a Year 11 student",
  },
  {
    quote:
      "Placeholder quote — a specific, measurable outcome is far more persuasive than praise.",
    name: "Student name",
    detail: "Year 11 · 9 GCSEs",
  },
];

export function Testimonials() {
  return (
    <>
      <SectionHeading
        eyebrow="Social proof"
        title="What students say"
        description="Replace these placeholders with real, attributable quotes before you launch."
        align="center"
      />

      <ul className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-3 md:gap-6">
        {PLACEHOLDER_QUOTES.map((item, i) => (
          <li key={i} className="card-surface flex flex-col p-6 md:p-7">
            <Quote
              aria-hidden="true"
              className="size-7 text-border-strong"
            />
            <blockquote className="mt-4 flex-1 text-base leading-relaxed">
              {item.quote}
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
              {/* Neutral monogram stands in for a real photo. */}
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold text-muted-foreground"
              >
                {item.name.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {item.name}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </figcaption>
          </li>
        ))}
      </ul>
    </>
  );
}

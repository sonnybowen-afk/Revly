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
      />

      <ul className="mt-12 grid gap-10 border-t border-border pt-10 md:grid-cols-3 md:gap-8">
        {PLACEHOLDER_QUOTES.map((item, i) => (
          <li key={i} className="flex flex-col">
            <Quote
              aria-hidden="true"
              className="size-5 text-border-strong"
            />
            <blockquote className="mt-4 flex-1 font-display text-lg leading-snug">
              {item.quote}
            </blockquote>
            <figcaption className="mt-6 text-sm">
              <span className="block font-semibold">{item.name}</span>
              <span className="block text-muted-foreground">{item.detail}</span>
            </figcaption>
          </li>
        ))}
      </ul>
    </>
  );
}

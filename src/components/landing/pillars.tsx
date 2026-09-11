import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Pillar {
  href: string;
  index: string;
  title: string;
  body: string;
  detail?: string[];
}

const PILLARS: Pillar[] = [
  {
    href: "/revision/flashcards",
    index: "01",
    title: "Flashcards that schedule themselves",
    body: "An Anki-grade spaced-repetition engine. Grade a card and it returns exactly when you are about to forget it — not before, not after.",
    detail: [
      "SM-2 scheduling with learning steps and lapse handling",
      "Active recall enforced: the answer is not on the page until you commit",
      "Retention stats and a 30-day workload forecast",
    ],
  },
  {
    href: "/timetable",
    index: "02",
    title: "Revision timetable",
    body: "Your subjects, exam dates and free evenings in — a balanced week out, weighted towards what you are weakest at.",
  },
  {
    href: "/tutoring",
    index: "03",
    title: "Tutoring",
    body: "Vetted subject specialists, for the topics that will not shift on their own.",
  },
  {
    href: "/ucas",
    index: "04",
    title: "UCAS support",
    body: "Deadlines, the three personal statement questions, and what each offer actually commits you to.",
  },
  {
    href: "/nea",
    index: "05",
    title: "NEA & coursework",
    body: "Stage-by-stage guidance for the assessment that quietly decides a grade boundary.",
  },
  {
    href: "/revision#resources",
    index: "06",
    title: "Vetted resources",
    body: "Past papers and mark schemes, straight from the board that sets your paper.",
  },
];

/**
 * A ruled index rather than a grid of shadowed cards. The 1px gaps come
 * from the container's background showing through, so the whole block
 * reads as one table — closer to a contents page than a dashboard.
 */
export function Pillars() {
  const [lead, ...rest] = PILLARS;

  return (
    <div className="overflow-hidden rounded-[6px] border border-border bg-border">
      <div className="grid gap-px lg:grid-cols-3">
        {/* Lead entry spans two columns and carries the detail list. */}
        <Link
          href={lead.href}
          className="group flex flex-col justify-between bg-card p-7 transition-colors duration-150 hover:bg-muted md:p-9 lg:col-span-2 lg:row-span-2"
        >
          <div>
            <span className="figures-display text-sm text-muted-foreground">
              {lead.index}
            </span>
            <h3 className="mt-4 max-w-[20ch] font-display text-2xl leading-tight md:text-[1.75rem]">
              {lead.title}
            </h3>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground md:text-base">
              {lead.body}
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 border-t border-border pt-6">
            {lead.detail?.map((d) => (
              <li
                key={d}
                className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.6em] h-px w-3 shrink-0 bg-border-strong"
                />
                {d}
              </li>
            ))}
          </ul>

          <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
            Open the flashcards
            <ArrowRight
              className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </Link>

        {rest.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex flex-col bg-card p-7 transition-colors duration-150 hover:bg-muted"
          >
            <span className="figures-display text-sm text-muted-foreground">
              {p.index}
            </span>
            <h3 className="mt-3 font-display text-xl leading-tight">
              {p.title}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
            <ArrowRight
              aria-hidden="true"
              className="mt-6 size-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

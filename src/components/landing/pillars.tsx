import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  CalendarRange,
  GraduationCap,
  Layers,
  Library,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Pillar {
  href: string;
  title: string;
  body: string;
  Icon: typeof Layers;
  tone: string;
  /** Bento span — the lead tile is deliberately larger. */
  span: string;
  points?: string[];
}

const PILLARS: Pillar[] = [
  {
    href: "/revision/flashcards",
    title: "Flashcards that schedule themselves",
    body: "An Anki-grade spaced-repetition engine. Grade a card and it reappears exactly when you are about to forget it — not before, not after.",
    Icon: Layers,
    tone: "text-primary",
    span: "md:col-span-2 md:row-span-2",
    points: [
      "SM-2 scheduling with learning steps and lapse handling",
      "Active recall enforced — answer hidden until you commit",
      "Retention stats and a 30-day workload forecast",
    ],
  },
  {
    href: "/timetable",
    title: "Revision timetable",
    body: "Tell it your subjects, exam dates and free evenings. It builds a balanced plan and rebalances when you fall behind.",
    Icon: CalendarRange,
    tone: "text-study",
    span: "md:col-span-2",
  },
  {
    href: "/tutoring",
    title: "Tutoring",
    body: "Matched, vetted subject specialists for the topics that are not shifting on their own.",
    Icon: Users,
    tone: "text-success",
    span: "",
  },
  {
    href: "/ucas",
    title: "UCAS support",
    body: "Deadlines, personal statement structure and offer decisions, without the guesswork.",
    Icon: GraduationCap,
    tone: "text-warning",
    span: "",
  },
  {
    href: "/nea",
    title: "NEA & coursework",
    body: "Stage-by-stage guidance for the non-exam assessment that quietly decides a grade boundary.",
    Icon: BookOpenCheck,
    tone: "text-primary",
    span: "md:col-span-2",
  },
  {
    href: "/revision#resources",
    title: "Vetted resources",
    body: "Past papers, mark schemes and the handful of channels actually worth your time.",
    Icon: Library,
    tone: "text-study",
    span: "md:col-span-2",
  },
];

export function Pillars() {
  return (
    <ul className="grid gap-4 md:grid-cols-4 md:auto-rows-[minmax(11rem,auto)]">
      {PILLARS.map((pillar) => (
        <li key={pillar.href} className={cn("flex", pillar.span)}>
          <Link
            href={pillar.href}
            className={cn(
              "group card-surface flex w-full flex-col p-6 md:p-7",
              "transition-[transform,box-shadow] duration-200 ease-out",
              "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
              "motion-reduce:hover:translate-y-0",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-xl bg-muted",
                  pillar.tone,
                )}
              >
                <pillar.Icon className="size-5" aria-hidden="true" />
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold">{pillar.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {pillar.body}
            </p>

            {pillar.points ? (
              <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                {pillar.points.map((point) => (
                  <li
                    key={point}
                    className="flex gap-2.5 text-sm text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

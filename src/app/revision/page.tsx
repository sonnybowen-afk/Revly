import type { Metadata } from "next";
import {
  CalendarRange,
  FileText,
  Layers,
  Lightbulb,
  Timer,
  Users,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { Callout, LinkCard, PageHeader } from "@/components/ui/page";
import { DECKS, totalCards } from "@/lib/decks";

export const metadata: Metadata = {
  title: "Revision hub",
  description:
    "Flashcards, timetabling and vetted resources for GCSE and A-Level revision, built around active recall and spaced repetition.",
};

const TOOLS = [
  {
    href: "/revision/flashcards",
    Icon: Layers,
    title: "Flashcards",
    body: `${totalCards()} cards across ${DECKS.length} decks, scheduled automatically. The core of the hub.`,
    cta: "Start reviewing",
  },
  {
    href: "/timetable",
    Icon: CalendarRange,
    title: "Timetable builder",
    body: "A weekly plan weighted by confidence and exam dates, with subjects interleaved.",
    cta: "Build a plan",
  },
  {
    href: "/tutoring",
    Icon: Users,
    title: "Tutoring",
    body: "For the topics that refuse to shift no matter how many cards you do.",
    cta: "See tutoring",
  },
];

/**
 * Official exam-board sources only. These are the primary, free, and
 * authoritative places for past papers and specifications.
 *
 * TODO (owner): add your own curated third-party resources below. Check each
 * one's terms before linking, and note that some publishers restrict deep
 * links to paper PDFs.
 */
const EXAM_BOARDS = [
  {
    title: "AQA",
    href: "https://www.aqa.org.uk/find-past-papers-and-mark-schemes",
    description:
      "Past papers, mark schemes and examiner reports for the UK's largest exam board.",
    meta: "GCSE · A-Level",
  },
  {
    title: "Pearson Edexcel",
    href: "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html",
    description:
      "Past papers and mark schemes across Edexcel GCSE, IGCSE and A-Level specifications.",
    meta: "GCSE · IGCSE · A-Level",
  },
  {
    title: "OCR",
    href: "https://www.ocr.org.uk/qualifications/past-paper-finder/",
    description:
      "OCR's past paper finder, including the A and B specification variants.",
    meta: "GCSE · A-Level",
  },
  {
    title: "WJEC / Eduqas",
    href: "https://www.eduqas.co.uk/home/past-papers/",
    description:
      "Past papers for Eduqas and WJEC specifications, widely used in Wales and England.",
    meta: "GCSE · A-Level",
  },
];

const TECHNIQUES = [
  {
    Icon: Lightbulb,
    title: "Active recall",
    body: "Retrieve the answer before you look at it. Effortful retrieval is what forms the memory — recognising a page you have re-read does not.",
  },
  {
    Icon: Timer,
    title: "Spaced repetition",
    body: "Review material just before you would forget it. Each successful recall lengthens the gap, so mature knowledge costs almost no time to maintain.",
  },
  {
    Icon: Layers,
    title: "Interleaving",
    body: "Mix subjects and question types within a session. It feels harder and less fluent than blocking, and it transfers far better to an exam paper.",
  },
  {
    Icon: FileText,
    title: "Past papers under timing",
    body: "The single highest-yield activity close to an exam. Mark honestly against the scheme, then turn every lost mark into a flashcard.",
  },
];

export default function RevisionPage() {
  return (
    <>
      <PageHeader
        eyebrow="Revision hub"
        title="Everything you need, in one place"
        description="Start with the flashcards, plan the week around them, and use past papers to find what to add next."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/revision/flashcards" size="lg">
            Open flashcards
          </ButtonLink>
          <ButtonLink href="/timetable" variant="secondary" size="lg">
            Build a timetable
          </ButtonLink>
        </div>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="Tools"
          title="Three things that do the heavy lifting"
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.href} className="card-surface flex flex-col p-6">
              <span className="grid size-10 place-items-center rounded-[4px] border border-border text-primary">
                <tool.Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{tool.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {tool.body}
              </p>
              <ButtonLink
                href={tool.href}
                variant="secondary"
                size="sm"
                className="mt-5 w-full"
              >
                {tool.cta}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-y border-border bg-background-subtle">
        <SectionHeading
          eyebrow="The method"
          title="Four techniques worth your time"
          description="Everything in this hub is built on these. If a revision activity doesn't map to one of them, it is probably not earning its place."
        />
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {TECHNIQUES.map((t) => (
            <li key={t.title} className="card-surface flex gap-4 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-[4px] border border-border text-primary">
                <t.Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-bold">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="resources" className="scroll-mt-20">
        <SectionHeading
          eyebrow="Resources"
          title="Past papers, straight from the source"
          description="Start with the exam board that actually sets your paper. Their mark schemes and examiner reports tell you precisely how marks are awarded."
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-2">
          {EXAM_BOARDS.map((board) => (
            <li key={board.title} className="bg-card">
              <LinkCard
                href={board.href}
                title={board.title}
                description={board.description}
                meta={board.meta}
                external
              />
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Callout title="More resources coming here">
            <p>
              This section is where your curated list of third-party resources
              will live — revision sites, video channels, question banks and
              subject-specific tools.
            </p>
            <p>
              The grid above is the pattern to follow: edit{" "}
              <code className="rounded bg-card px-1.5 py-0.5 text-xs">
                EXAM_BOARDS
              </code>{" "}
              in{" "}
              <code className="rounded bg-card px-1.5 py-0.5 text-xs break-anywhere">
                src/app/revision/page.tsx
              </code>{" "}
              to add entries.
            </p>
          </Callout>
        </div>
      </Section>
    </>
  );
}

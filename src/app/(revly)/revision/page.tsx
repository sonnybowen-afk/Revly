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
import { Callout, PageHeader } from "@/components/ui/page";
import { ResourceBrowser } from "@/components/resources/resource-browser";
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
          <ButtonLink href="/revision/flashcards/new" variant="secondary" size="lg">
            Create a deck
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
          title="Filtered down to what your board actually sets"
          description="The web has thousands of revision sites and most students never find the good ones. Narrow by board, subject and level to get a short list instead of a search page."
        />

        <div className="mt-10">
          <ResourceBrowser />
        </div>

        <div className="mt-10 max-w-2xl">
          <Callout title="How this list is kept honest">
            <p>
              Official exam-board sources always rank first, then free before
              paid. Cost is stated plainly — nothing free-looking that turns
              out to be a paywall — and there are no affiliate links anywhere
              in it.
            </p>
            <p>
              Add or edit entries in{" "}
              <code className="break-anywhere">src/lib/resources.ts</code>.
              Every entry carries a one-line reason it earned its place; if
              you cannot write one, it probably has not.
            </p>
          </Callout>
        </div>
      </Section>

    </>
  );
}

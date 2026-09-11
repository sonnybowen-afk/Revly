import { ArrowRight, Brain, Check, Clock, Repeat, X } from "lucide-react";
import { Hero } from "@/components/landing/hero";
import { Pillars } from "@/components/landing/pillars";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { Testimonials } from "@/components/landing/testimonials";

const FAILING = [
  "Re-reading notes until they feel familiar",
  "Highlighting whole pages in three colours",
  "Copying the textbook out again, neatly",
  "Six-hour cram sessions the night before",
];

const WORKING = [
  "Retrieving the answer from memory, cold",
  "Reviewing right before you'd forget it",
  "Short, frequent sessions across weeks",
  "Being told exactly what to study today",
];

const STEPS = [
  {
    Icon: Brain,
    title: "Answer before you look",
    body: "Every card hides its answer until you commit. That moment of effortful retrieval is what builds the memory — recognition does not.",
  },
  {
    Icon: Clock,
    title: "Grade how it felt",
    body: "Four buttons: Again, Hard, Good, Easy. The scheduler reads your grade and works out the next interval from your own ease factor.",
  },
  {
    Icon: Repeat,
    title: "Come back at the right moment",
    body: "Cards return just as recall starts to fade. Easy material spreads out over months; anything shaky comes back within minutes.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* ── Problem ─────────────────────────────────────────────── */}
      <Section className="border-y border-border bg-background-subtle">
        <SectionHeading
          eyebrow="The problem"
          title="Most revision feels productive and isn't"
          description="Familiarity is not memory. The techniques that feel hardest in the moment are the ones that actually hold under exam conditions."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          <Comparison
            tone="danger"
            title="Feels productive"
            items={FAILING}
            Icon={X}
          />
          <Comparison
            tone="success"
            title="Actually works"
            items={WORKING}
            Icon={Check}
          />
        </div>
      </Section>

      {/* ── Solution / pillars ──────────────────────────────────── */}
      <Section>
        <SectionHeading
          eyebrow="The hub"
          title="Everything in one place, no tab juggling"
          description="Each one solves a real bottleneck between now and results day."
        />
        <div className="mt-10">
          <Pillars />
        </div>
      </Section>

      {/* ── How it works ────────────────────────────────────────── */}
      <Section
        id="how-it-works"
        className="border-y border-border bg-background-subtle scroll-mt-20"
      >
        <SectionHeading
          eyebrow="How the scheduler works"
          title="Three steps, then it runs itself"
          align="center"
        />

        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card-surface relative p-6 md:p-7">
              <span
                aria-hidden="true"
                className="tabular absolute right-6 top-6 text-4xl font-bold text-border-strong"
              >
                {i + 1}
              </span>
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary-soft-foreground">
                <step.Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Testimonials />
      </Section>

      {/* ── Final CTA ───────────────────────────────────────────── */}
      <Section className="pb-20 md:pb-28">
        <div className="card-surface relative overflow-hidden px-6 py-14 text-center md:px-16 md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="absolute left-1/2 top-0 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <h2 className="mx-auto max-w-[20ch] text-3xl font-bold md:text-4xl">
            Start with one deck today
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-base text-muted-foreground md:text-lg">
            No account, no card details. Your progress saves in your browser and
            the scheduler starts working from the very first review.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/revision/flashcards" size="lg">
              Open the flashcards
              <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/timetable" variant="secondary" size="lg">
              Build a timetable
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}

function Comparison({
  tone,
  title,
  items,
  Icon,
}: {
  tone: "danger" | "success";
  title: string;
  items: string[];
  Icon: typeof Check;
}) {
  const danger = tone === "danger";
  return (
    <div className="card-surface p-6 md:p-8">
      <h3 className="flex items-center gap-2.5 text-lg font-bold">
        <span
          className={
            danger
              ? "grid size-8 place-items-center rounded-lg bg-destructive-soft text-destructive-soft-foreground"
              : "grid size-8 place-items-center rounded-lg bg-success-soft text-success-soft-foreground"
          }
        >
          <Icon className="size-4" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm md:text-base">
            <Icon
              aria-hidden="true"
              className={
                danger
                  ? "mt-0.5 size-5 shrink-0 text-destructive"
                  : "mt-0.5 size-5 shrink-0 text-success"
              }
            />
            <span
              className={danger ? "text-muted-foreground" : "text-foreground"}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

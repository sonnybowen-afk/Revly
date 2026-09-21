import { ArrowRight, Check, X } from "lucide-react";
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
  "Reviewing right before you would forget it",
  "Short, frequent sessions across weeks",
  "Being told exactly what to study today",
];

const STEPS = [
  {
    n: "01",
    title: "Answer before you look",
    body: "Every card hides its answer until you commit. That moment of effortful retrieval is what builds the memory. Recognition does not.",
  },
  {
    n: "02",
    title: "Grade how it felt",
    body: "Again, Hard, Good, Easy. The scheduler reads your grade and works out the next interval from your own ease factor for that card.",
  },
  {
    n: "03",
    title: "Come back at the right moment",
    body: "Cards return as recall starts to fade. Easy material spreads out over months; anything shaky comes back within minutes.",
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* ── Problem ─────────────────────────────────────────────── */}
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="The problem"
          title="Most revision feels productive and isn’t"
          description="Familiarity is not memory. The techniques that feel hardest in the moment are the ones that hold up under exam conditions."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border md:grid-cols-2">
          <Comparison
            tone="danger"
            label="Feels productive"
            items={FAILING}
          />
          <Comparison tone="success" label="Actually works" items={WORKING} />
        </div>
      </Section>

      {/* ── The hub ─────────────────────────────────────────────── */}
      <Section className="border-b border-border">
        <SectionHeading
          eyebrow="The hub"
          title="Six things, one place, no tab juggling"
          description="Each one solves a real bottleneck between now and results day."
        />
        <div className="mt-12">
          <Pillars />
        </div>
      </Section>

      {/* ── How it works ────────────────────────────────────────── */}
      <Section
        id="how-it-works"
        className="border-b border-border bg-background-subtle"
      >
        <SectionHeading
          eyebrow="How the scheduler works"
          title="Three steps, then it runs itself"
        />

        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-rule/25 pt-6">
              <span className="figures-display block text-4xl text-primary">
                {step.n}
              </span>
              <h3 className="mt-4 font-display text-xl leading-tight">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section className="border-b border-border">
        <Testimonials />
      </Section>

      {/* ── Closing ─────────────────────────────────────────────── */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
          <div>
            <h2 className="max-w-[16ch] font-display text-[2.25rem] leading-[1.05] md:text-[3rem]">
              Start with one deck today
            </h2>
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
              No account, no card details. Progress saves in your browser and
              the scheduler starts working from the very first review.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
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
  label,
  items,
}: {
  tone: "danger" | "success";
  label: string;
  items: string[];
}) {
  const danger = tone === "danger";
  const Icon = danger ? X : Check;
  return (
    <div className="bg-card p-7 md:p-9">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Icon
          aria-hidden="true"
          className={
            danger ? "size-4 text-destructive" : "size-4 text-success"
          }
        />
        <span className="eyebrow">{label}</span>
      </div>

      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li
            key={item}
            className={
              danger
                ? "text-base leading-relaxed text-muted-foreground line-through decoration-destructive/40 decoration-1"
                : "text-base leading-relaxed"
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

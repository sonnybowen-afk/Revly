import type { Metadata } from "next";
import {
  ClipboardCheck,
  MessagesSquare,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Callout, FAQ, PageHeader } from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";
import { EnquiryForm } from "@/components/tutoring/enquiry-form";

export const metadata: Metadata = {
  title: "Tutoring",
  description:
    "One-to-one GCSE and A-Level tutoring with vetted subject specialists, built around your revision rather than bolted on top of it.",
};

const STEPS = [
  {
    Icon: MessagesSquare,
    title: "Tell us what's not shifting",
    body: "The specific topic, the paper you keep dropping marks on, or the grade you need. Vague briefs get vague matches.",
  },
  {
    Icon: UserCheck,
    title: "Get matched to a specialist",
    body: "A tutor who teaches your exam board and level — not a generalist who covered it at university once.",
  },
  {
    Icon: ClipboardCheck,
    title: "Work to a plan",
    body: "Sessions target the gaps your flashcard data and past papers have already identified, so nothing is guesswork.",
  },
];

/**
 * Rates are set by each tutor, not by a fixed price list — experience,
 * subject scarcity and level all move the number. What is fixed is the
 * floor: no tutor on the platform charges below MINIMUM_HOURLY_RATE.
 *
 * The exact rate for a given tutor is shown on their profile before any
 * booking is confirmed, so nobody is quoted a range and billed something
 * else.
 */
export const MINIMUM_HOURLY_RATE = 25;

const LEVELS = [
  {
    name: "GCSE",
    rate: `From £${MINIMUM_HOURLY_RATE}`,
    unit: "per hour · set by tutor",
    features: [
      "One-to-one, online or in person",
      "Matched to your exam board",
      "Session notes after each lesson",
      "Flashcards added for whatever you missed",
    ],
  },
  {
    name: "A-Level",
    rate: `From £${MINIMUM_HOURLY_RATE}`,
    unit: "per hour · set by tutor",
    featured: true,
    features: [
      "Subject specialists only",
      "Past-paper marking with examiner-style feedback",
      "NEA and coursework planning support",
      "Progress reviewed against your timetable",
    ],
  },
  {
    name: "Exam intensive",
    rate: "Block rate",
    unit: "six sessions · priced by tutor",
    features: [
      "Six sessions in the run-up to exams",
      "Full diagnostic in session one",
      "Priority scheduling during study leave",
      "Progress updates shared with parents",
    ],
  },
];

const FAQS = [
  {
    question: "How are tutors vetted?",
    answer:
      "Describe your actual process here: identity checks, qualification verification, enhanced DBS certificates, references, and a subject-knowledge assessment. Parents will look for this specifically, so be concrete rather than reassuring.",
  },
  {
    question: "Online or in person?",
    answer:
      "State what you offer and where. If you cover a defined geographic area for in-person work, name it — it helps with local search as well as with expectations.",
  },
  {
    question: "What happens in the first session?",
    answer:
      "Usually a diagnostic: a short piece of past-paper work to establish where the marks are actually being lost, then a plan for the sessions that follow.",
  },
  {
    question: "Can parents see progress?",
    answer:
      "Explain your reporting — session notes, periodic summaries, and whether parents can attend or observe. Be clear about what a student aged 16+ can keep private.",
  },
  {
    question: "Why do rates differ between tutors?",
    answer:
      "Because experience and subject scarcity differ. Every tutor sets their own hourly rate above a £25 floor, and it is shown in full on their profile before you book. A higher rate usually reflects examining experience, a shortage subject, or a track record at the grade you are chasing — not a better tier of service.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "Set out the notice period and what happens to the fee. Ambiguity here causes most tutoring disputes, so write it plainly.",
  },
];

export default function TutoringPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tutoring"
        title="For the topics that won't shift on their own"
        description="Flashcards handle recall. Some things need a person who can see why your method is going wrong."
      />

      <Section>
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a matched tutor"
        />
        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card-surface relative p-6 md:p-7">
              <span
                aria-hidden="true"
                className="tabular absolute right-6 top-6 text-4xl font-bold text-border-strong"
              >
                {i + 1}
              </span>
              <span className="grid size-10 place-items-center rounded-[4px] border border-border text-primary">
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

      <Section className="border-y border-border bg-background-subtle">
        <SectionHeading
          eyebrow="Pricing"
          title="Tutors set their own rate, starting at £25"
          align="center"
        />

        <div className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-muted-foreground leading-relaxed">
            There is no single price, because there is no single tutor. A
            newly qualified GCSE tutor and a Chief Examiner with twenty years
            in A-Level Physics are not the same service, and pricing them
            identically would be dishonest to both.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            What is fixed is the floor:{" "}
            <strong className="font-semibold text-foreground">
              no tutor charges less than £{MINIMUM_HOURLY_RATE} an hour
            </strong>
            . Each tutor&apos;s exact rate appears on their profile before you
            book — you will never be shown a range and billed something else.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3 md:gap-6">
          {LEVELS.map((tier) => (
            <li
              key={tier.name}
              className={
                tier.featured
                  ? "card-surface relative flex flex-col p-6 ring-2 ring-primary md:p-8"
                  : "card-surface flex flex-col p-6 md:p-8"
              }
            >
              {tier.featured ? (
                <span className="absolute -top-3 left-6">
                  <Badge tone="brand">Most requested</Badge>
                </span>
              ) : null}
              <h3 className="text-lg font-bold">{tier.name}</h3>
              <p className="mt-4">
                <span className="tabular text-3xl font-bold">{tier.rate}</span>
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {tier.unit}
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-border pt-6">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 max-w-2xl">
          <Callout tone="warning" title="Still to confirm before launch">
            <p>
              The £{MINIMUM_HOURLY_RATE} floor is set. You still need to state
              your cancellation terms and, if you are VAT-registered, whether
              displayed rates include VAT — both are required for consumer
              pricing to be compliant, and ambiguity here causes most billing
              disputes.
            </p>
          </Callout>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:items-start">
          <div>
            <span className="grid size-10 place-items-center rounded-[4px] border border-border text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 text-3xl font-bold">Safeguarding first</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              You are working with under-18s, so this section carries real
              weight with parents and real legal obligations for you. Set out
              your DBS policy, your safeguarding lead, how sessions are
              recorded or observed, and how concerns are reported.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Treat it as a compliance page, not marketing copy — and have it
              reviewed by someone qualified before you publish.
            </p>
          </div>

          <EnquiryForm />
        </div>
      </Section>

      <Section className="border-t border-border bg-background-subtle">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <Badge tone="brand">FAQ</Badge>
            <h2 className="mt-4 text-3xl font-bold">
              What parents and students ask
            </h2>
            <p className="mt-4 text-muted-foreground">
              These answers are outlines. Replace them with your actual
              policies.
            </p>
          </div>
          <FAQ items={FAQS} />
        </div>
      </Section>
    </>
  );
}

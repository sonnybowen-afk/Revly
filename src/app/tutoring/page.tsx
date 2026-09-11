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

/*
 * TODO (owner): replace with your real pricing before launch.
 * UK tutoring rates are typically quoted per hour and vary by level and
 * tutor experience. Whatever you set, display it inclusive of VAT if you
 * are VAT-registered, and make the cancellation terms explicit.
 */
const PRICING = [
  {
    name: "GCSE",
    price: "£00",
    unit: "per hour",
    features: [
      "One-to-one, online or in person",
      "Exam-board specific",
      "Session notes after each lesson",
      "Flashcards added for what you missed",
    ],
  },
  {
    name: "A-Level",
    price: "£00",
    unit: "per hour",
    featured: true,
    features: [
      "Subject specialists only",
      "Past-paper marking with examiner-style feedback",
      "NEA and coursework planning support",
      "Progress reviewed against your timetable",
    ],
  },
  {
    name: "Intensive",
    price: "£000",
    unit: "per block",
    features: [
      "Six sessions in the run-up to exams",
      "Full diagnostic in session one",
      "Priority scheduling during study leave",
      "Shared progress updates for parents",
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
              <span className="grid size-11 place-items-center rounded-xl bg-study-soft text-study">
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
          title="Clear rates, no packages you don't need"
          align="center"
        />

        <div className="mx-auto mt-6 max-w-2xl">
          <Callout tone="warning" title="Placeholder pricing">
            <p>
              The figures below are dummy values. Set your real rates in{" "}
              <code className="rounded bg-card px-1.5 py-0.5 text-xs break-anywhere">
                src/app/tutoring/page.tsx
              </code>{" "}
              before launch, and make sure the cancellation terms and any VAT
              treatment are stated.
            </p>
          </Callout>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3 md:gap-6">
          {PRICING.map((tier) => (
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
                <span className="tabular text-4xl font-bold">{tier.price}</span>
                <span className="ml-1.5 text-sm text-muted-foreground">
                  {tier.unit}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
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
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16 lg:items-start">
          <div>
            <span className="grid size-11 place-items-center rounded-xl bg-success-soft text-success">
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

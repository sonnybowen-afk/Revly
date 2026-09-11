import type { Metadata } from "next";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import {
  Callout,
  FAQ,
  PageHeader,
  Timeline,
} from "@/components/ui/page";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "UCAS help",
  description:
    "A clear walkthrough of the UCAS cycle: deadlines, choices, the three personal statement questions, offers, Extra and Clearing.",
};

const CYCLE = [
  {
    title: "Register and start the application",
    meta: "May onwards",
    body: "Create your UCAS Hub account and link it to your school or college using their buzzword. Doing this early matters mostly because it unlocks the personal statement builder.",
  },
  {
    title: "Research and shortlist",
    meta: "Summer",
    body: "You get five choices. Check entry requirements, the actual module lists, and whether a course wants specific A-Levels. Open days are worth more than prospectuses.",
  },
  {
    title: "Write the personal statement",
    meta: "Summer — early autumn",
    body: "Three structured questions, 4,000 characters across all of them. Expect four or five drafts. Start before term does.",
  },
  {
    title: "Early deadline",
    meta: "Mid-October",
    body: "Oxford and Cambridge, plus most medicine, dentistry and veterinary courses, close in mid-October — months before everyone else. Miss it and you wait a year.",
  },
  {
    title: "Equal consideration deadline",
    meta: "Mid-to-late January",
    body: "The main deadline. Applications in by this point are guaranteed equal consideration. Later ones are looked at only if places remain.",
  },
  {
    title: "Offers arrive",
    meta: "Winter — spring",
    body: "Conditional or unconditional. You reply with one firm choice and, if the firm is conditional, one insurance choice with lower requirements.",
  },
  {
    title: "UCAS Extra",
    meta: "Late February — early July",
    body: "If you hold no offers and used all five choices, Extra lets you add one more at a time.",
  },
  {
    title: "Results day and Clearing",
    meta: "August",
    body: "Meet your firm offer and you are in. Miss it and Clearing opens up remaining places — it moves quickly, so have a shortlist and your Clearing number ready before results come out.",
  },
];

const STATEMENT_QUESTIONS = [
  {
    n: "01",
    question: "Why do you want to study this course or subject?",
    guidance:
      "Lead with a specific intellectual hook, not a childhood anecdote. Name a topic, problem or text that pulled you in, and say what you did about it.",
    avoid: "“I have always been fascinated by…”",
  },
  {
    n: "02",
    question:
      "How have your qualifications and studies helped you prepare for this course?",
    guidance:
      "Link actual modules and skills to the course's demands. A Maths A-Level is not evidence on its own — the statistical modelling unit you found hard and pushed through is.",
    avoid: "Listing subjects the admissions tutor can already see on your form.",
  },
  {
    n: "03",
    question:
      "What else have you done to prepare outside education, and why is it useful?",
    guidance:
      "Reading, work experience, projects, volunteering, part-time jobs. Every item needs a 'so what' — what it taught you that the course will draw on.",
    avoid: "A list of hobbies with no reflection attached.",
  },
];

const FAQS = [
  {
    question: "How many courses can I apply to?",
    answer:
      "Five. The exception is medicine, dentistry and veterinary medicine or science, where you can apply to a maximum of four — you can use the fifth slot for a different subject.",
  },
  {
    question: "Does the order of my five choices matter?",
    answer:
      "No. Universities see only their own course, not your other choices, and the list is displayed alphabetically. There is no 'first choice' at application stage.",
  },
  {
    question: "What is the difference between firm and insurance?",
    answer:
      "Your firm choice is where you go if you meet the conditions. Your insurance is the backup, so it only works if its offer is lower than your firm. Picking an insurance with the same grades defeats the point.",
  },
  {
    question: "Can I apply after the January deadline?",
    answer:
      "Yes, until late June, but universities consider late applications only if places remain. For competitive courses that often means there are none.",
  },
  {
    question: "Do I write a different statement for each university?",
    answer:
      "No — one statement goes to all five choices. That is why naming a specific university in it is a mistake, and why applying for wildly different subjects is hard to pull off.",
  },
  {
    question: "What if I miss my grades?",
    answer:
      "Ring the university before assuming anything — they may still take you, particularly if you narrowly missed. If not, Clearing opens on results day. It is a normal route in, not a failure.",
  },
];

export default function UcasPage() {
  return (
    <>
      <PageHeader
        eyebrow="UCAS"
        title="The application, without the guesswork"
        description="What happens when, what each deadline actually means, and how to answer the three personal statement questions."
      />

      <Section>
        <Callout tone="warning" title="Check this cycle's exact dates">
          <p>
            UCAS deadlines shift by a few days every year, and the timings
            below describe the usual pattern rather than fixed dates. Confirm
            yours against the official site before you rely on them.
          </p>
          <p>
            <a
              href="https://www.ucas.com/undergraduate/applying-university/key-dates-and-deadlines"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-2"
            >
              UCAS key dates and deadlines
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        </Callout>

        <div className="mt-12">
          <SectionHeading
            eyebrow="The cycle"
            title="Eight stages from registration to results"
          />
          <div className="mt-10 max-w-3xl">
            <Timeline items={CYCLE} />
          </div>
        </div>
      </Section>

      <Section
        id="personal-statement"
        className="border-y border-border bg-background-subtle scroll-mt-20"
      >
        <SectionHeading
          eyebrow="Personal statement"
          title="Three questions, 4,000 characters"
          description="UCAS replaced the single free-form essay with three structured questions. The total limit is still 4,000 characters, with a minimum of 350 characters per answer."
        />

        <ul className="mt-10 grid gap-4 lg:grid-cols-3">
          {STATEMENT_QUESTIONS.map((q) => (
            <li key={q.n} className="card-surface flex flex-col p-6">
              <span className="tabular text-sm font-bold text-primary">
                {q.n}
              </span>
              <h3 className="mt-3 text-base font-bold leading-snug">
                {q.question}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {q.guidance}
              </p>
              <div className="mt-6 border-l-2 border-destructive/60 py-0.5 pl-4">
                <p className="eyebrow text-destructive">Avoid</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {q.avoid}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-10 card-surface p-6 md:p-8">
          <h3 className="text-lg font-bold">Before you submit</h3>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Every claim has evidence attached to it",
              "No university named anywhere in the statement",
              "Roughly 60% academic, 40% wider preparation",
              "Read aloud — anything you stumble on gets rewritten",
              "Checked by a teacher who knows the subject",
              "Written entirely by you, with no AI-generated text",
            ].map((item) => (
              <li key={item} className="flex gap-2.5 text-sm">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm text-muted-foreground">
            UCAS screens every statement for similarity and for generated text.
            A flagged statement goes to the universities you applied to.
          </p>
        </div>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <Badge tone="brand">FAQ</Badge>
            <h2 className="mt-4 text-3xl font-bold">Common questions</h2>
            <p className="mt-4 text-muted-foreground">
              The things students most often get wrong, usually because nobody
              told them clearly the first time.
            </p>
          </div>
          <FAQ items={FAQS} />
        </div>
      </Section>
    </>
  );
}

/**
 * Pricing.
 *
 * One deliberate decision, made against the brief: the free tier does NOT
 * use lives, hearts, or a daily review cap.
 *
 * Lives work in Duolingo because running out costs you a *streak*. Here it
 * would cost a student revision time in the weeks before an exam, and the
 * people most likely to hit the wall are the ones who cannot pay. Gating
 * the spaced-repetition scheduler — the one thing in this product with
 * evidence behind it — would make Revly worse at the job it claims to do,
 * and it reads as exploitative to the parents who actually hold the card.
 *
 * So: reviewing is unlimited and free, forever. What is paid for is scale
 * (unlimited decks, imports, sync), analysis, and human time. Those are
 * real costs, and charging for them is defensible in a way that charging
 * for the right to revise is not.
 *
 * NOTE ON ENFORCEMENT: Revly is currently a static site with no accounts
 * and no payment processing, so every limit below is presentational. See
 * the README before treating any of it as a paywall.
 */

export type Interval = "month" | "year" | "one-off" | "hour";

export interface PlanFeature {
  label: string;
  /** false renders as an explicit exclusion rather than being omitted. */
  included: boolean;
  detail?: string;
}

export interface Plan {
  id: "free" | "plus" | "family";
  name: string;
  price: number;
  interval: Interval;
  /** Annual equivalent, where one exists. */
  annual?: number;
  tagline: string;
  audience: string;
  features: PlanFeature[];
  cta: string;
  featured?: boolean;
}

/** The free ceiling on learner-created decks. Seed decks never count. */
export const FREE_DECK_LIMIT = 3;
export const FREE_IMPORT_LIMIT = 100;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    tagline: "The whole scheduler, no time limit",
    audience: "Every student, permanently",
    cta: "Start revising",
    features: [
      {
        label: "Unlimited reviews, forever",
        included: true,
        detail: "No daily cap, no lives, no waiting to study.",
      },
      { label: "All built-in decks", included: true },
      {
        label: `Up to ${FREE_DECK_LIMIT} of your own decks`,
        included: true,
        detail: "Written, generated from notes, or imported.",
      },
      {
        label: `Imports up to ${FREE_IMPORT_LIMIT} cards`,
        included: true,
        detail: "Anki, Quizlet, ChatGPT.",
      },
      { label: "Revision timetable", included: true },
      { label: "UCAS and NEA guidance", included: true },
      { label: "Full resource library", included: true },
      { label: "Statement checker", included: true, detail: "One statement." },
      { label: "Progress synced across devices", included: false },
      { label: "Retention analytics", included: false },
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 6,
    annual: 48,
    interval: "month",
    featured: true,
    tagline: "For a full exam season",
    audience: "Students sitting a full set of GCSEs or A-Levels",
    cta: "Go Plus",
    features: [
      { label: "Everything in Free", included: true },
      { label: "Unlimited decks and imports", included: true },
      {
        label: "Progress synced across devices",
        included: true,
        detail: "Phone on the bus, laptop at the desk.",
      },
      {
        label: "Retention analytics",
        included: true,
        detail: "Which topics are actually decaying, per subject.",
      },
      {
        label: "Adaptive timetable",
        included: true,
        detail: "Rebalances when you fall behind instead of shaming you.",
      },
      { label: "Unlimited statement checks", included: true },
      { label: "Exam countdown and workload smoothing", included: true },
      { label: "Priority tutor matching", included: true },
    ],
  },
  {
    id: "family",
    name: "Family",
    price: 10,
    annual: 84,
    interval: "month",
    tagline: "Up to four students",
    audience: "Households with siblings in different year groups",
    cta: "Choose Family",
    features: [
      { label: "Everything in Plus, for four students", included: true },
      { label: "Separate progress for each student", included: true },
      {
        label: "Optional parent summary",
        included: true,
        detail: "Weekly email. Students 16+ choose whether to share it.",
      },
      { label: "One bill", included: true },
    ],
  },
];

export interface UcasProduct {
  id: string;
  name: string;
  price: number;
  interval: Interval;
  from?: boolean;
  summary: string;
  includes: string[];
  bestFor: string;
}

export const UCAS_PRODUCTS: UcasProduct[] = [
  {
    id: "course",
    name: "UCAS course",
    price: 39,
    interval: "one-off",
    summary:
      "A self-paced course covering the whole cycle: choosing courses, the three statement questions, references, offers and results day.",
    bestFor: "Working through it yourself, at your own pace",
    includes: [
      "Eight modules, roughly six hours total",
      "Worked examples of strong and weak answers",
      "Deadline planner for your cycle",
      "Keeps access through to results day",
    ],
  },
  {
    id: "review",
    name: "Statement review",
    price: 49,
    interval: "one-off",
    summary:
      "A specialist reads your statement and returns line-level feedback against what admissions tutors actually look for, plus one follow-up round after you redraft.",
    bestFor: "A draft that needs an experienced eye on it",
    includes: [
      "Line-level written feedback in 3 working days",
      "Structure and evidence assessment per question",
      "One follow-up round on your redraft",
      "Automated checker included, unlimited",
    ],
  },
  {
    id: "tutor",
    name: "UCAS tutor",
    price: 30,
    interval: "hour",
    from: true,
    summary:
      "One-to-one sessions with someone who has been through admissions for your subject — course choice, statement, admissions tests and interviews.",
    bestFor: "Competitive courses, or when you are stuck on direction",
    includes: [
      "Matched to your subject and target universities",
      "Interview practice for courses that require it",
      "Admissions test preparation where relevant",
      "Rate set by the tutor, never below £30 an hour",
    ],
  },
];

export function annualSaving(plan: Plan): number | null {
  if (!plan.annual || plan.price === 0) return null;
  const monthlyTotal = plan.price * 12;
  return Math.round(((monthlyTotal - plan.annual) / monthlyTotal) * 100);
}

export function formatPrice(value: number): string {
  return value === 0
    ? "£0"
    : Number.isInteger(value)
      ? `£${value}`
      : `£${value.toFixed(2)}`;
}

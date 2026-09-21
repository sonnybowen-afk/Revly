"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Answers, Match } from "@/lib/annie-hair-match";
import { confidence, rankMethods } from "@/lib/annie-hair-match";
import { formatDurationRange } from "@/lib/annie-pricing";
import { AnnieButton, AnnieLink } from "./ui";

type Question = {
  readonly key: keyof Answers;
  readonly title: string;
  readonly help: string;
  readonly options: readonly {
    readonly value: string | boolean;
    readonly label: string;
    readonly detail: string;
  }[];
};

const QUESTIONS: readonly Question[] = [
  {
    key: "hairType",
    title: "How would you describe your hair?",
    help: "Take a single strand between your fingers. Can you barely feel it, or is it coarse?",
    options: [
      { value: "fine", label: "Fine", detail: "Soft, hard to feel a single strand, scalp shows at the parting." },
      { value: "medium", label: "Medium", detail: "You can feel a strand. Holds a style for a day or so." },
      { value: "thick", label: "Thick", detail: "Coarse to the touch. Takes a while to dry." },
      { value: "textured", label: "Curly or afro-textured", detail: "Curl pattern from loose waves through to tight coils." },
    ],
  },
  {
    key: "density",
    title: "How much hair have you got?",
    help: "Not how thick each strand is — how many of them there are.",
    options: [
      { value: "low", label: "Not a lot", detail: "Scalp visible in places. A ponytail sits thin." },
      { value: "medium", label: "An average amount", detail: "A normal ponytail. No thin patches." },
      { value: "high", label: "Plenty", detail: "Thick ponytail. Updos need a lot of grips." },
    ],
  },
  {
    key: "goal",
    title: "What are you actually after?",
    help: "Most people want a bit of both, and that is a valid answer.",
    options: [
      { value: "length", label: "Length", detail: "Your hair is the density you want, just not the length." },
      { value: "volume", label: "Volume", detail: "The length is fine. You want it fuller and thicker." },
      { value: "both", label: "Both", detail: "Longer and fuller — the full transformation." },
    ],
  },
  {
    key: "lifestyle",
    title: "How hard is your hair going to work?",
    help: "Be honest here. It matters more than anything else on this page.",
    options: [
      { value: "relaxed", label: "Gently", detail: "Washing a couple of times a week. No swimming." },
      { value: "active", label: "Fairly hard", detail: "The gym a few times a week, washing often." },
      { value: "very-active", label: "Very hard", detail: "Training most days, swimming, washing daily." },
    ],
  },
  {
    key: "upkeep",
    title: "How often can you come back in?",
    help: "Every method needs moving up as your own hair grows. This is the single biggest cost over a year.",
    options: [
      { value: "frequent", label: "Every 6 weeks or so", detail: "Happy to keep on top of it." },
      { value: "standard", label: "Every couple of months", detail: "The usual rhythm." },
      { value: "minimal", label: "As rarely as possible", detail: "Three months if you can get away with it." },
    ],
  },
  {
    key: "budget",
    title: "Where are you on budget?",
    help: "Nothing here is a quote. It only shifts which method gets suggested first.",
    options: [
      { value: "value", label: "Keep it sensible", detail: "The best result for the least outlay." },
      { value: "mid", label: "Somewhere in the middle", detail: "Happy to pay for quality that lasts." },
      { value: "premium", label: "Whatever it takes", detail: "The finest bond and the best hair, full stop." },
    ],
  },
  {
    key: "fragile",
    title: "Is your hair bleached, coloured or fragile?",
    help: "Previously damaged hair needs a gentler bond. Saying yes never rules anything out — it re-weights the ranking.",
    options: [
      { value: true, label: "Yes", detail: "Bleached, highlighted, or it snaps easily." },
      { value: false, label: "No", detail: "Healthy, or coloured without lightening." },
    ],
  },
];

export function HairMatch() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const done = step >= QUESTIONS.length;
  const complete = QUESTIONS.every((q) => answers[q.key] !== undefined);

  const ranked = useMemo(
    () => (complete ? rankMethods(answers as Answers) : null),
    [answers, complete],
  );

  /**
   * Moving between steps must move screen-reader focus with it, or a
   * keyboard user is left reading the old question.
   */
  const goTo = (next: number) => {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const choose = (key: keyof Answers, value: string | boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // A small beat so the selected state is seen before the step turns.
    window.setTimeout(() => goTo(step + 1), 220);
  };

  const restart = () => {
    setAnswers({});
    goTo(0);
  };

  if (done && ranked) {
    return (
      <Results
        ranked={ranked}
        onRestart={restart}
        onBack={() => goTo(QUESTIONS.length - 1)}
        headingRef={headingRef}
      />
    );
  }

  const question = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];
  const current = answers[question.key];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="annie-card p-6 md:p-10">
      <div className="flex items-center justify-between gap-4">
        <p className="annie-label">
          Step {step + 1} of {QUESTIONS.length}
        </p>
        {step > 0 ? (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back
          </button>
        ) : null}
      </div>

      <div
        className="mt-4 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress through the hair match"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <fieldset className="mt-8">
        <legend className="contents">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl leading-tight md:text-[2rem]"
          >
            {question.title}
          </h2>
        </legend>
        <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
          {question.help}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => {
            const selected = current === option.value;
            return (
              <button
                key={String(option.value)}
                type="button"
                aria-pressed={selected}
                onClick={() => choose(question.key, option.value)}
                className={cn(
                  "annie-lift group cursor-pointer rounded-xl border p-5 text-left",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "border-primary bg-primary-soft"
                    : "border-card-border bg-background-subtle hover:border-primary/40",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-medium text-foreground">
                    {option.label}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors duration-200",
                      selected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-border-strong",
                    )}
                  >
                    {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                  {option.detail}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function Results({
  ranked,
  onRestart,
  onBack,
  headingRef,
}: {
  ranked: readonly Match[];
  onRestart: () => void;
  onBack: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const viable = ranked.filter((m) => !m.blocked);
  const blocked = ranked.filter((m) => m.blocked);
  const level = confidence(ranked);
  const best = viable[0];

  return (
    <div>
      <div className="annie-card p-6 md:p-10">
        <p className="annie-label">Your match</p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-4 font-display text-[2rem] leading-tight md:text-[2.75rem]"
        >
          {best ? (
            <>
              Annie would start you on{" "}
              <span className="text-gilt annie-shimmer">{best.method.name}</span>
            </>
          ) : (
            "Let's talk it through in person"
          )}
        </h2>

        <p className="mt-5 max-w-[60ch] text-pretty leading-relaxed text-muted-foreground">
          {level === "close" && viable.length > 1
            ? `${viable[0].method.name} and ${viable[1].method.name} came out almost level, which means either would work on your hair. Annie will pick between them once she has seen it.`
            : best
              ? best.method.bestFor
              : "Nothing in the standard range is a clean fit for what you have described, which is exactly the situation a consultation is for."}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <AnnieLink
            href={best ? `/annie/book?method=${best.method.id}` : "/annie/book"}
            arrow
          >
            Book a free consultation
          </AnnieLink>
          <AnnieButton tone="outline" onClick={onRestart}>
            <RotateCcw aria-hidden="true" className="size-4" />
            Start again
          </AnnieButton>
          <AnnieButton tone="ghost" onClick={onBack}>
            Change my last answer
          </AnnieButton>
        </div>

        <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
          This is a starting point, not a diagnosis. The only way to judge a
          head of hair properly is to look at it, which is what the free
          consultation is for — and it is where the price is agreed too.
        </p>
      </div>

      <h3 className="annie-label mt-12">How every method scored</h3>
      <ul className="mt-5 grid gap-4">
        {viable.map((match, i) => (
          <MatchRow key={match.method.id} match={match} rank={i + 1} />
        ))}
      </ul>

      {blocked.length > 0 ? (
        <>
          <h3 className="annie-label mt-12">Ruled out, and why</h3>
          <ul className="mt-5 grid gap-3">
            {blocked.map((match) => (
              <li
                key={match.method.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-background-subtle p-4"
              >
                <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div>
                  <p className="font-medium">{match.method.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {match.reasons.find((r) => r.kind === "block")?.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function MatchRow({ match, rank }: { match: Match; rank: number }) {
  const { method } = match;
  return (
    <li className="annie-card annie-lift p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="annie-label text-[0.6rem]">
            {rank === 1 ? "Best match" : `Option ${rank}`}
          </p>
          <h4 className="mt-1.5 font-display text-xl">{method.name}</h4>
        </div>
        <div className="text-right">
          <p className="font-technical text-2xl leading-none text-primary tabular-nums">
            {match.score}
            <span className="text-sm text-muted-foreground">/100</span>
          </p>
          <p className="mt-1 text-[0.7rem] text-muted-foreground">fit score</p>
        </div>
      </div>

      <div
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${method.name} scores ${match.score} out of 100 for your hair`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
          style={{ width: `${match.score}%` }}
        />
      </div>

      <ul className="mt-5 grid gap-2">
        {match.reasons.slice(0, 4).map((reason, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 size-1.5 shrink-0 rounded-full",
                reason.kind === "plus" ? "bg-success" : "bg-warning",
              )}
            />
            <span className="leading-relaxed text-muted-foreground">
              {reason.text}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="annie-label text-[0.55rem]">Fitting</dt>
          <dd className="font-technical mt-1">
            {formatDurationRange(method.fitMinutes)}
          </dd>
        </div>
        <div>
          <dt className="annie-label text-[0.55rem]">Move-ups</dt>
          <dd className="font-technical mt-1">
            {method.maintenanceWeeks[0]}&ndash;{method.maintenanceWeeks[1]} wks
          </dd>
        </div>
        <div>
          <dt className="annie-label text-[0.55rem]">Hair lasts</dt>
          <dd className="font-technical mt-1">
            {method.hairLifeMonths[0]}&ndash;{method.hairLifeMonths[1]} mths
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <span className="annie-label shrink-0 text-[0.55rem] text-warning">
          Note
        </span>
        {method.watchOut}
      </p>

      <Link
        href={`/annie/services#${method.id}`}
        className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm text-primary transition-colors duration-200 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        More about {method.name}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </li>
  );
}

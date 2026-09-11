import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { Callout, FAQ, PageHeader } from "@/components/ui/page";
import {
  PLANS,
  UCAS_PRODUCTS,
  annualSaving,
  formatPrice,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Revly pricing. The spaced-repetition scheduler is free and uncapped forever; Plus adds unlimited decks, sync and analytics. UCAS courses, statement review and tutoring priced separately.",
};

const FAQS = [
  {
    question: "Why is there no free trial limit or daily cap?",
    answer:
      "Because capping revision would make the product worse at the thing it exists to do, and the students who would hit the cap are the ones least able to pay. The scheduler is free and uncapped permanently. What costs money is scale, analysis and human time.",
  },
  {
    question: "Who actually pays — students or parents?",
    answer:
      "Usually a parent. That is why the Family plan exists and why the parent summary is optional rather than automatic: a student aged 16 or over decides whether their progress is shared.",
  },
  {
    question: "Can I cancel?",
    answer:
      "Monthly plans stop at the end of the period you have paid for. Annual plans are covered by your statutory 14-day cancellation right. Your decks and progress stay in your browser either way.",
  },
  {
    question: "What happens to my decks if I stop paying?",
    answer:
      "Nothing is deleted. You keep reviewing everything you have, and you drop back to the free limit on creating new decks.",
  },
  {
    question: "Is tutoring included in a plan?",
    answer:
      "No. Tutoring is paid per hour at a rate the tutor sets, never below £25. A plan gets you priority matching, not free sessions — bundling hours into a subscription tends to mean paying for time you do not use.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Revising is free. Always will be."
        description="The scheduler is the part with evidence behind it, so it is not the part we put behind a paywall. Everything below is what sits around it."
      />

      <Section className="border-b border-border">
        <ul className="grid gap-px overflow-hidden rounded-[6px] border border-border bg-border lg:grid-cols-3">
          {PLANS.map((plan) => {
            const saving = annualSaving(plan);
            return (
              <li
                key={plan.id}
                className={
                  plan.featured
                    ? "relative flex flex-col bg-card p-7 md:p-9"
                    : "flex flex-col bg-card p-7 md:p-9"
                }
              >
                {plan.featured ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 bg-primary"
                  />
                ) : null}

                <div className="flex items-center gap-3">
                  <h2 className="font-display text-2xl">{plan.name}</h2>
                  {plan.featured ? <Badge tone="brand">Most chosen</Badge> : null}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {plan.audience}
                </p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="figures-display text-5xl">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      / {plan.interval}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                  {plan.annual
                    ? `or ${formatPrice(plan.annual)} a year — ${saving}% less`
                    : plan.tagline}
                </p>

                <ul className="mt-7 flex-1 space-y-3 border-t border-border pt-6">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex gap-3 text-sm">
                      {f.included ? (
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      ) : (
                        <Minus
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span
                        className={
                          f.included ? "" : "text-muted-foreground line-through decoration-1"
                        }
                      >
                        {f.label}
                        {f.detail ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground no-underline">
                            {f.detail}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href={plan.id === "free" ? "/revision/flashcards" : "#"}
                  variant={plan.featured ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  {plan.cta}
                </ButtonLink>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 max-w-2xl">
          <Callout tone="warning" title="Nothing here takes payment yet">
            <p>
              Revly is currently a static site with no accounts and no payment
              processing, so every limit above is presentational. Enforcing
              them needs authentication, a database and a payment provider —
              see the README for what that involves.
            </p>
          </Callout>
        </div>
      </Section>

      {/* ── UCAS products ───────────────────────────────────────── */}
      <Section className="border-b border-border bg-background-subtle">
        <SectionHeading
          eyebrow="UCAS support"
          title="Priced separately, because you only need it once"
          description="A subscription makes sense for revision you do every week. An application you submit once does not — so these are one-off, or paid by the hour."
        />

        <ul className="mt-12 grid gap-px overflow-hidden rounded-[6px] border border-border bg-border lg:grid-cols-3">
          {UCAS_PRODUCTS.map((p) => (
            <li key={p.id} className="flex flex-col bg-card p-7 md:p-8">
              <h3 className="font-display text-xl">{p.name}</h3>
              <p className="mt-4 flex items-baseline gap-1.5">
                {p.from ? (
                  <span className="text-sm text-muted-foreground">from</span>
                ) : null}
                <span className="figures-display text-4xl">
                  {formatPrice(p.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {p.interval === "hour" ? "/ hour" : "one-off"}
                </span>
              </p>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {p.summary}
              </p>

              <p className="mt-4 border-l-2 border-border pl-3 text-sm">
                <span className="font-semibold">Best for. </span>
                {p.bestFor}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-border pt-5">
                {p.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="mt-[0.6em] h-px w-3 shrink-0 bg-border-strong"
                    />
                    {inc}
                  </li>
                ))}
              </ul>

              <ButtonLink
                href={p.id === "review" ? "/ucas/review" : "/ucas"}
                variant="secondary"
                className="mt-7 w-full"
              >
                {p.id === "review" ? "Try the free checker" : "Find out more"}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <Badge tone="brand">FAQ</Badge>
            <h2 className="mt-4 font-display text-3xl">Questions about cost</h2>
          </div>
          <FAQ items={FAQS} />
        </div>
      </Section>
    </>
  );
}

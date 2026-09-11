import { ArrowRight, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DECKS, totalCards } from "@/lib/decks";

const STATS = [
  { value: `${totalCards()}`, label: "cards ready to study" },
  { value: `${DECKS.length}`, label: "curated decks" },
  { value: "5", label: "tools in one hub" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative field — purely visual, hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-10%] top-20 size-[30rem] rounded-full bg-study/10 blur-3xl" />
      </div>

      <div className="container-page pt-16 pb-14 md:pt-24 md:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="reveal">
            <Badge tone="brand">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Built for GCSE &amp; A-Level
            </Badge>

            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl max-w-[15ch]">
              Everything you need to revise.
            </h1>

            <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">
              Flashcards that schedule themselves, a timetable that fits around
              your real life, and proper help with UCAS and your NEA. One hub,
              built on the two techniques the research actually backs:{" "}
              <strong className="font-semibold text-foreground">
                active recall
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-foreground">
                spaced repetition
              </strong>
              .
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/revision/flashcards" size="lg">
                Start revising free
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary" size="lg">
                See how it works
              </ButtonLink>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="tabular block text-2xl font-bold">
                      {stat.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroCardPreview />
        </div>
      </div>
    </section>
  );
}

/** Static mock of the review screen. Illustrative only — not interactive. */
function HeroCardPreview() {
  return (
    <div className="reveal relative" style={{ animationDelay: "120ms" }}>
      <div
        aria-hidden="true"
        className="absolute inset-x-6 -bottom-3 h-24 rounded-card bg-card/60 border border-card-border"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-3 -bottom-1.5 h-24 rounded-card bg-card/80 border border-card-border"
      />

      <figure className="card-surface relative p-6 md:p-8">
        <figcaption className="flex flex-wrap items-center justify-between gap-3">
          <Badge tone="success">Biology · GCSE</Badge>
          <span className="tabular text-sm text-muted-foreground">
            12 due today
          </span>
        </figcaption>

        <blockquote className="mt-7 min-h-32 text-xl font-semibold leading-snug md:text-2xl">
          Why do ionic compounds have high melting points?
        </blockquote>

        <div className="mt-6 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
          Strong electrostatic forces of attraction between oppositely charged
          ions act in all directions throughout the giant lattice.
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2" aria-hidden="true">
          {[
            { label: "Again", delay: "10m", tone: "text-destructive" },
            { label: "Hard", delay: "12d", tone: "text-warning" },
            { label: "Good", delay: "25d", tone: "text-primary" },
            { label: "Easy", delay: "34d", tone: "text-success" },
          ].map((b) => (
            <div
              key={b.label}
              className="rounded-xl border border-border px-2 py-2.5 text-center"
            >
              <span className="block text-xs font-semibold">{b.label}</span>
              <span className={`tabular block text-xs ${b.tone}`}>
                {b.delay}
              </span>
            </div>
          ))}
        </div>
      </figure>
    </div>
  );
}

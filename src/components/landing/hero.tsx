import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { DECKS, totalCards } from "@/lib/decks";

const STATS = [
  { value: totalCards(), label: "cards ready to study" },
  { value: DECKS.length, label: "curated decks" },
  { value: 5, label: "tools in one hub" },
];

export function Hero() {
  return (
    <section className="border-b border-border">
      <div className="container-page">
        <div className="grid gap-12 pt-14 pb-16 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:pt-24 lg:pb-24">
          {/* ── Editorial column ─────────────────────────────────── */}
          <div className="reveal max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-rule/40" aria-hidden="true" />
              <span className="eyebrow">GCSE &amp; A-Level</span>
            </div>

            <h1 className="mt-7 max-w-[13ch] font-display text-[2.75rem] leading-[1.02] tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4.25rem]">
              Everything you need to{" "}
              <em className="italic">actually</em> revise.
            </h1>

            <p className="mt-7 max-w-[54ch] text-lg leading-relaxed text-muted-foreground">
              Flashcards that schedule themselves. A timetable built around
              your real week. Proper help with UCAS and your NEA. One hub,
              built on the only two techniques the research consistently
              backs.
            </p>

            {/* The two ideas the product rests on, set as a definition
                list rather than another row of icon cards. */}
            <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-border pt-6 sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Active recall</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Retrieve the answer cold, before you look at it.
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Spaced repetition</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Review it the moment before you would forget.
                </dd>
              </div>
            </dl>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/revision/flashcards" size="lg">
                Start revising
                <ArrowRight className="size-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary" size="lg">
                How the scheduler works
              </ButtonLink>
            </div>
          </div>

          <HeroCardPreview />
        </div>
      </div>

      {/* ── Ruled stat band ─────────────────────────────────────── */}
      <div className="border-t border-border">
        <div className="container-page">
          <dl className="grid grid-cols-3 divide-x divide-border">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={i === 0 ? "py-6 pr-5" : "py-6 pl-5 pr-5"}
              >
                <dd>
                  <span className="figures-display block text-3xl md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-xs leading-snug text-muted-foreground md:text-sm">
                    {stat.label}
                  </span>
                </dd>
                <dt className="sr-only">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Static mock of the review screen. Illustrative, not interactive. */
function HeroCardPreview() {
  return (
    <div
      className="reveal lg:pt-4"
      style={{ animationDelay: "100ms" }}
    >
      <figure className="card-surface p-6 md:p-8">
        <figcaption className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <span className="eyebrow">Biology · GCSE</span>
          <span className="tabular text-xs text-muted-foreground">
            12 due today
          </span>
        </figcaption>

        <blockquote className="mt-7 font-display text-[1.5rem] leading-snug md:text-[1.75rem]">
          Why do ionic compounds have high melting points?
        </blockquote>

        <div className="mt-6 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">
          Strong electrostatic forces of attraction between oppositely charged
          ions act in all directions throughout the giant lattice.
        </div>

        <div
          className="mt-7 grid grid-cols-4 gap-px overflow-hidden rounded-[3px] border border-border bg-border"
          aria-hidden="true"
        >
          {[
            { label: "Again", delay: "10m" },
            { label: "Hard", delay: "12d" },
            { label: "Good", delay: "25d" },
            { label: "Easy", delay: "34d" },
          ].map((b) => (
            <div key={b.label} className="bg-card px-2 py-2.5 text-center">
              <span className="block text-xs font-semibold">{b.label}</span>
              <span className="tabular mt-0.5 block text-xs text-muted-foreground">
                {b.delay}
              </span>
            </div>
          ))}
        </div>
      </figure>
    </div>
  );
}

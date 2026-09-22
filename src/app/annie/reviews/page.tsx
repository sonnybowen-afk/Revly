import type { Metadata } from "next";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { Reveal } from "@/components/annie/reveal";
import { ReviewWall, Stars } from "@/components/annie/review-wall";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
} from "@/components/annie/ui";
import { CountUp } from "@/components/annie/count-up";
import { REVIEW_THEMES } from "@/lib/annie-reviews";
import { RATING, SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "Reviews",
  description: `Annie's Secret Hair Extension is rated ${RATING.value} out of 5 from ${RATING.count} reviews on ${RATING.source}. What clients say about the fitting, the value and how long the hair lasts.`,
};

export default function ReviewsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <AnnieHeading
              as="h1"
              label="Reviews"
              title={
                <>
                  <span className="text-gilt annie-shimmer">
                    {RATING.value}
                  </span>{" "}
                  out of 5
                </>
              }
              lede={`From ${RATING.count} reviews on ${RATING.source}. Four things come up again and again, and how long the hair lasts is the one people write about most.`}
            />

            <Reveal direction="zoom-out" delay={120}>
              <div className="annie-card annie-sheen relative p-8 text-center">
                <p className="font-display text-[4.5rem] leading-none text-primary">
                  <CountUp to={RATING.value} decimals={1} />
                </p>
                <div className="mt-4 flex justify-center">
                  <Stars
                    rating={RATING.value}
                    size="lg"
                    label={`${RATING.value} out of 5 from ${RATING.count} reviews on ${RATING.source}`}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  <CountUp to={RATING.count} /> reviews on {RATING.source}
                </p>
                <div className="mt-7 flex flex-col gap-3">
                  <a
                    href={RATING.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Read them on {RATING.source}
                  </a>
                  <a
                    href={SALON.social.fresha}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--gold-hairline)] px-6 text-sm font-semibold transition-colors duration-200 hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    And on Fresha
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <AnnieSection tone="subtle">
        <AnnieHeading
          label="The themes"
          title="What comes up again and again"
          lede="Drawn from the studio's public review profiles and from the messages clients have sent — not picked out one flattering quote at a time."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEW_THEMES.map((theme, i) => (
            <Reveal key={theme.id} direction="zoom" delay={i * 80}>
              <article className="annie-card annie-lift h-full p-6">
                <span className="font-display text-4xl text-primary/75">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-4 font-display text-xl">{theme.label}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {theme.detail}
                </p>
                <p className="annie-label mt-5 text-[0.55rem]">
                  From {theme.source}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection>
        <AnnieHeading
          label="In their own words"
          title="Messages clients have sent"
          lede="Quoted word for word from WhatsApp and Instagram, and published by the salon to its own Instagram story."
        />
        <Reveal delay={120}>
          <div className="mt-12">
            <ReviewWall />
          </div>
        </Reveal>
      </AnnieSection>

      <AnnieSection tone="subtle" className="py-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-[1.75rem] md:text-[2.25rem]">
              Had your hair done here?
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Reviews are how a studio inside a market gets found at all.
              If Annie looked after you, a couple of lines goes a long way.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={RATING.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Leave a review
              </a>
              <AnnieLink href="/annie/book" tone="outline" arrow>
                Book your next set
              </AnnieLink>
            </div>
          </div>
        </Reveal>
      </AnnieSection>
    </>
  );
}

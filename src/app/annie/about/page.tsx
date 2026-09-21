import type { Metadata } from "next";
import { Building2, Clock, MapPin, Scissors } from "lucide-react";
import { Atmosphere } from "@/components/annie/atmosphere";
import { BreadcrumbJsonLd } from "@/components/annie/json-ld";
import { Reveal } from "@/components/annie/reveal";
import {
  AnnieHeading,
  AnnieLink,
  AnnieSection,
  PhotoFrame,
  Stat,
} from "@/components/annie/ui";
import { CountUp } from "@/components/annie/count-up";
import { METHODS } from "@/lib/annie-methods";
import { ADDRESS_ONE_LINE, RATING, SALON } from "@/lib/annie-salon";

export const metadata: Metadata = {
  title: "About Annie",
  description:
    "Annie's Secret Hair Extension is a boutique studio inside Manchester Arndale Market. Salon director Annie matches, fits and blends every set herself.",
};

const VALUES = [
  {
    icon: Scissors,
    title: "She does it herself",
    body: "Annie is the salon director and she is also the person fitting your hair. Nobody hands you over halfway through, and nobody learns on your head.",
  },
  {
    icon: Building2,
    title: "A studio, not a chain",
    body: "One chair inside Manchester Arndale Market. The overheads of a market unit are what keep the prices where reviewers keep remarking on them.",
  },
  {
    icon: Clock,
    title: "Unhurried",
    body: "A nano-ring full head can take four hours and it gets four hours. The consultation before it is free and is not rushed either.",
  },
  {
    icon: MapPin,
    title: "Properly central",
    body: "Two minutes from Piccadilly Gardens and a short walk from Victoria. Easy to get to on a lunch break, easier still on a day off.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]}
      />

      <section className="relative isolate overflow-hidden">
        <Atmosphere />
        <div className="container-page relative py-20 md:py-28">
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div>
              <AnnieHeading
                as="h1"
                label="About"
                title="The secret is that there isn't one"
                lede="No trick, no miracle product. Just one person who has fitted enough hair to know what will work on yours before she picks anything up."
              />
              <Reveal delay={140}>
                <div className="mt-9 space-y-5 text-pretty leading-relaxed text-muted-foreground">
                  <p>
                    Annie&rsquo;s Secret Hair &amp; Weave Bar is tucked inside
                    Manchester Arndale Market — the kind of place you find
                    because someone told you about it. Salon director Annie
                    runs it, and she is the one who matches your shade, picks
                    the method, fits the hair and cuts it in.
                  </p>
                  <p>
                    The studio specialises in extensions and weaving rather
                    than doing a bit of everything. That narrowness is the
                    point: five methods, fitted properly, on hair chosen to
                    last. Reviewers write about sets still going strong a year
                    on more often than they write about anything else.
                  </p>
                  <p>
                    Styling comes with the fitting. Curls, waves or
                    straightened — you leave with it finished, not with a
                    promise that it will look right once you have had a go at
                    it yourself.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <AnnieLink href="/annie/book" arrow>
                    Come and meet her
                  </AnnieLink>
                  <AnnieLink href="/annie/gallery" tone="outline">
                    See the work
                  </AnnieLink>
                </div>
              </Reveal>
            </div>

            <Reveal direction="zoom" delay={120}>
              <PhotoFrame
                caption="Annie in the studio: portrait at the chair, market light behind."
                ratio="4 / 5"
                index={1}
              />
            </Reveal>
          </div>
        </div>
      </section>

      <AnnieSection tone="subtle">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal direction="zoom">
            <Stat
              value={<CountUp to={RATING.value} decimals={1} />}
              label="Rated"
              detail={`${RATING.count} reviews on ${RATING.source}`}
            />
          </Reveal>
          <Reveal direction="zoom" delay={80}>
            <Stat
              value={<CountUp to={METHODS.length} />}
              label="Methods"
              detail="Each matched to a kind of hair"
            />
          </Reveal>
          <Reveal direction="zoom" delay={160}>
            <Stat value="1" label="Pair of hands" detail="Every set, start to finish" />
          </Reveal>
          <Reveal direction="zoom" delay={240}>
            <Stat
              value={<CountUp to={5} />}
              label="Days a week"
              detail="Monday to Friday, 11am–6pm"
            />
          </Reveal>
        </div>
      </AnnieSection>

      <AnnieSection>
        <AnnieHeading
          label="How it runs"
          title="Four things that do not change"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} direction="zoom" delay={i * 80}>
              <article className="annie-card annie-lift flex h-full gap-5 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--gold-hairline)] bg-primary-soft">
                  <value.icon aria-hidden="true" className="size-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl">{value.title}</h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {value.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </AnnieSection>

      <AnnieSection tone="subtle">
        <div className="mx-auto max-w-2xl">
          <AnnieHeading
            label="The details"
            title="For the record"
            align="center"
          />
          <Reveal delay={100}>
            <dl className="annie-card mt-10 divide-y divide-border">
              <Row term="Trading name">{SALON.name}</Row>
              <Row term="Also known as">{SALON.alternateName}</Row>
              <Row term="Registered name">{SALON.legalName}</Row>
              <Row term="Company number">
                <span className="font-technical">{SALON.companyNumber}</span>
              </Row>
              <Row term="Address">{ADDRESS_ONE_LINE}</Row>
              <Row term="Hours">Monday to Friday, 11am&ndash;6pm</Row>
              <Row term="Appointments">Walk-in, or message ahead</Row>
            </dl>
          </Reveal>
        </div>
      </AnnieSection>
    </>
  );
}

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 p-5 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="annie-label sm:w-44 sm:shrink-0">{term}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
